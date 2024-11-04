import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function createEntities<T>(count: number, createFn: (index: number) => Promise<T>): Promise<T[]> {
  return Promise.all(Array(count).fill(null).map((_, index) => createFn(index)))
}

async function createRandomEntities<T>(
  minCount: number,
  maxCount: number,
  createFn: (index: number) => Promise<T>
): Promise<T[]> {
  const count = Math.floor(Math.random() * (maxCount - minCount + 1)) + minCount
  return createEntities(count, createFn)
}

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function seed() {
  // Clear existing data
  const tables = [
    'MicropostView',
    'TeamMember', 'Team', 'Follow', 'Like', 'Comment', 'CategoryMicropost', 'Micropost', 
    'CareerProject', 'CareerSkill', 'Career', 'UserSkill', 'Skill',
    'UserRole', 'Role', 'UserProfile', 'User', 'Category'
  ]
  const tablesWithoutSequence = ['TeamMember', 'UserRole', 'Follow', 'UserProfile', 'CategoryMicropost', 'CareerSkill', 'UserSkill', 'Like']

  await prisma.$transaction(
    tables.map(table => prisma.$executeRawUnsafe(`DELETE FROM "${table}"`))
      .concat(tables.filter(table => !tablesWithoutSequence.includes(table))
        .map(table => prisma.$executeRawUnsafe(`ALTER SEQUENCE "${table}_id_seq" RESTART WITH 1`)))
  )

  // Create roles
  const roleData = [
    { name: 'general', description: '一般ユーザー' },
    { name: 'read_only_admin', description: '閲覧限定アドミン' },
    { name: 'admin', description: 'フルアクセス権限を持つアドミン' },
  ]
  const roles = await createEntities(roleData.length, (i) => prisma.role.create({ data: roleData[i] }))

  // Create admin user
  const adminUser = await prisma.user.create({
    data: {
      name: 'Admin',
      email: 'admin@example.com',
      password: await hashPassword('password'),
      userRoles: { create: roles.map(role => ({ roleId: role.id })) },
      profile: { create: { avatarPath: 'admin_avatar.png' } },
    },
  })

  // Create regular users
  const userNames = [
    'Alice', 'Bob', 'Charlie', 'Diana', 'Ethan', 'Fiona', 'George', 'Hannah',
    'Ian', 'Julia', 'Kevin', 'Laura', 'Michael', 'Nora', 'Oscar', 'Pamela',
    'Quentin', 'Rachel', 'Samuel', 'Tina'
  ]
  const users = await createEntities(userNames.length, async (i) => {
    const name = userNames[i]
    return prisma.user.create({
      data: {
        name,
        email: `${name.toLowerCase()}@example.com`,
        password: await hashPassword('password'),
        profile: { create: { avatarPath: `${name.toLowerCase()}_avatar.png` } },
        userRoles: {
          create: [
            { roleId: roles.find(r => r.name === 'general')!.id },
            ...(i % 5 === 0 ? [{ roleId: roles.find(r => r.name === 'read_only_admin')!.id }] : [])
          ]
        }
      },
    })
  })

  // Create categories with more variety
  const categoryNames = [
    'Technology', 'Programming', 'Design', 
    'Career', 'Lifestyle', 'Education',
    'Gaming', 'Sports', 'Food',
    'Travel', 'Music', 'Movies'
  ]
  const categories = await createEntities(categoryNames.length, (i) => 
    prisma.category.create({ data: { name: categoryNames[i] } })
  )

  // Create microposts with multiple categories
  const microposts = await Promise.all(users.flatMap((user, index) => 
    createEntities(3, async (postIndex) => {
      // まず、ランダムな数のユニークなカテゴリーIDを選択
      const selectedCategoryIds = Array.from(new Set(
        Array(Math.floor(Math.random() * 3) + 1)
          .fill(null)
          .map(() => categories[Math.floor(Math.random() * categories.length)].id)
      ));

      return prisma.micropost.create({
        data: {
          userId: user.id,
          title: `${user.name}'s post ${postIndex + 1}`,
          imagePath: `${user.name.toLowerCase()}${postIndex + 1}.png`,
          categories: {
            create: selectedCategoryIds.map(categoryId => ({
              categoryId
            }))
          },
        },
      });
    })
  )).then(arrays => arrays.flat());

  // Create comments
  const commentContents = [
    'Great post!', 'Interesting perspective', 'Thanks for sharing', 
    'I learned something new', 'Well written', 'This is awesome!',
    'I disagree, but respect your opinion', 'Can you elaborate more?',
    'This reminds me of...', 'I have a question about this'
  ]

  await Promise.all(users.flatMap(user =>
    createRandomEntities(5, 15, () => {
      const randomMicropost = microposts[Math.floor(Math.random() * microposts.length)]
      return prisma.comment.create({
        data: {
          content: commentContents[Math.floor(Math.random() * commentContents.length)],
          userId: user.id,
          micropostId: randomMicropost.id,
        }
      })
    })
  ))

  // Create likes
  const likesData = await Promise.all(users.flatMap(user =>
    createRandomEntities(10, 30, async () => {
      const randomMicropost = microposts[Math.floor(Math.random() * microposts.length)]
      return {
        userId: user.id,
        micropostId: randomMicropost.id
      }
    })
  )).then(arrays => arrays.flat())

  // 重複を除去
  const uniqueLikesData = Array.from(new Set(likesData.map(like => JSON.stringify(like))))
    .map(jsonString => JSON.parse(jsonString) as { userId: number; micropostId: number })

  await prisma.like.createMany({
    data: uniqueLikesData,
    skipDuplicates: true
  })

  // Create follows
  await Promise.all(users.flatMap((user, index) => 
    users
      .filter((_, followIndex) => followIndex !== index && Math.random() > 0.7)
      .map(followedUser => 
        prisma.follow.create({
          data: { followerId: user.id, followingId: followedUser.id },
        })
      )
  ))

  // Create teams and team members
  const teamNames = ['Red Team', 'Blue Team', 'Green Team', 'Yellow Team', 'Purple Team']
  const teams = await createEntities(teamNames.length, (i) => 
    prisma.team.create({
      data: { name: teamNames[i], description: `Description for ${teamNames[i]}` },
    })
  )

  await Promise.all(users.map(user => 
    prisma.teamMember.create({
      data: {
        userId: user.id,
        teamId: teams[Math.floor(Math.random() * teams.length)].id,
      }
    })
  ))

  await Promise.all(teams.map(team => 
    prisma.teamMember.create({
      data: { userId: adminUser.id, teamId: team.id },
    })
  ))

  // Create skills and user skills
  const skillNames = ['JavaScript', 'Python', 'Java', 'C++', 'Ruby', 'Go', 'TypeScript', 'SQL', 'HTML', 'CSS']
  const skills = await createEntities(skillNames.length, (i) => 
    prisma.skill.create({ data: { name: skillNames[i] } })
  )

  await Promise.all(users.map(async user => {
    const userSkills = await createRandomEntities(1, 5, async () => ({
      userId: user.id,
      skillId: skills[Math.floor(Math.random() * skills.length)].id
    }))
    
    return prisma.userSkill.createMany({
      data: userSkills,
      skipDuplicates: true
    })
  }))

  // Create careers
  const companies = ['Tech Corp', 'Innovate Inc', 'Digital Solutions', 'Future Systems', 'Code Masters']
  await Promise.all(users.map(user =>
    createRandomEntities(1, 3, async () => {
      const career = await prisma.career.create({
        data: {
          userId: user.id,
          companyName: companies[Math.floor(Math.random() * companies.length)],
          projects: {
            create: await createRandomEntities(1, 3, async (projectIndex) => ({
              name: `Project ${projectIndex + 1}`
            }))
          }
        }
      })

      const careerSkills = Array(Math.floor(Math.random() * 3) + 1).fill(null).map(() => ({
        careerId: career.id,
        skillId: skills[Math.floor(Math.random() * skills.length)].id
      }))

      await prisma.careerSkill.createMany({
        data: careerSkills,
        skipDuplicates: true
      })

      return career
    })
  ))

  // Create micropost views
  const ipAddresses = ['192.168.1.1', '192.168.1.2', '192.168.1.3', '192.168.1.4', '192.168.1.5'];

  const viewsData = microposts.flatMap(micropost => {
    const viewCount = Math.floor(Math.random() * 6) + 5; // 5-10 views per post
    return ipAddresses.slice(0, viewCount).map(ip => ({
      micropostId: micropost.id,
      ipAddress: ip,
      viewedAt: new Date(),
    }));
  });

  await prisma.$transaction([
    prisma.micropostView.createMany({
      data: viewsData,
      skipDuplicates: true,
    }),
    ...microposts.map(micropost => 
      prisma.micropost.update({
        where: { id: micropost.id },
        data: { viewCount: ipAddresses.length },
      })
    ),
  ]);

  console.log('Seed data inserted successfully, including users, relationships, teams, skills, careers, comments, likes, and views')
}
