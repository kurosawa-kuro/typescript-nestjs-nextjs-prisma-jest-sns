import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma.service';

export abstract class BaseService<
  T,
  CreateInput,
  UpdateInput,
  WhereUniqueInput,
  WhereInput,
> {
  protected abstract entityName: string;

  constructor(protected prisma: PrismaService) {}

  protected abstract getRepository(): any;

  async create(data: CreateInput): Promise<Partial<T>> {
    return this.getRepository().create({ data }) as Promise<Partial<T>>;
  }

  async all(): Promise<T[]> {
    return this.getRepository().findMany() as Promise<T[]>;
  }

  async findById(id: number): Promise<T> {
    const entity = (await this.getRepository().findUnique({
      where: { id: Number(id) } as WhereUniqueInput,
    })) as T | null;
    if (!entity) {
      this.handleNotFound(id);
    }
    return entity as T;
  }

  async update(id: number, updateDto: UpdateInput): Promise<T> {
    try {
      return await this.getRepository().update({
        where: { id: Number(id) },
        data: updateDto,
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(
          `${this.entityName} with ID ${id} not found`,
        );
      }
      throw error;
    }
  }

  async destroy(id: number): Promise<void> {
    try {
      await this.getRepository().delete({
        where: { id: Number(id) } as WhereUniqueInput,
      });
    } catch (error) {
      if (error.code === 'P2025') {
        this.handleNotFound(id);
      }
      throw error;
    }
  }

  async findFirst(where: WhereInput): Promise<T> {
    const entity = (await this.getRepository().findFirst({
      where,
    })) as T | null;
    if (!entity) {
      throw new NotFoundException(
        `${this.entityName} not found with criteria: ${JSON.stringify(where)}`,
      );
    }
    return entity;
  }

  protected handleNotFound(id: number): never {
    throw new NotFoundException(`${this.entityName} with ID ${id} not found`);
  }
}
