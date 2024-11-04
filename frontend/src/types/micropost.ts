import { UserInfo } from './user';

export interface Comment {
  id: number;
  content: string;
  userId: number;
  micropostId: number;
  createdAt: string;
  updatedAt: string;
  user: Pick<UserInfo, 'id' | 'name'> & {
    profile: NonNullable<UserInfo['profile']>;
  };
}

export interface Category {
  id: number;
  name: string;
}

export interface CategoryMicropost {
  id: number;
  title: string;
  imagePath: string;
  createdAt: string;
  updatedAt: string;
  likesCount: number;
  viewsCount: number;
  isLiked: boolean;
  user: {
    id: number;
    name: string;
    profile: {
      avatarPath: string;
    };
  };
}

export interface CategoryDetail extends Category {
  microposts: CategoryMicropost[];
}

export interface Micropost {
  id: number;
  user: Pick<UserInfo, 'id' | 'name'> & {
    profile: NonNullable<UserInfo['profile']>;
  };
  title: string;
  imagePath: string;
  createdAt: string;
  updatedAt: string;
  likesCount: number;
  isLiked?: boolean;
  comments: Comment[];
  viewsCount: number;
  categories: Category[];
}

export interface NewMicropost {
  user: Pick<UserInfo, 'id' | 'name'> & {
    profile: NonNullable<UserInfo['profile']>;
  };
  title: string;
  imagePath: string;
}

export interface TimelineProps {
  microposts: Micropost[];
  currentPage: number;
  totalPages: number;
}

export interface CategoryRanking {
  id: number;
  name: string;
  postCount: number;
  recentPosts: {
    id: number;
    title: string;
    imagePath: string;
    createdAt: string;
    user: {
      id: number;
      name: string;
      profile: {
        avatarPath: string;
      };
    };
  }[];
}

export interface MostViewRanking {
  id: number;
  title: string;
  imagePath: string;
  viewCount: number;
  createdAt: string;
  user: {
    id: number;
    name: string;
    profile: {
      avatarPath: string;
    };
  };
}