import { DeepPartial, FindManyOptions, FindOneOptions, FindOptionsWhere, ObjectLiteral, Repository } from 'typeorm';

export abstract class BaseRepository<T extends ObjectLiteral> extends Repository<T> {
    constructor(private readonly repository: Repository<T>) {
        super(repository.target, repository.manager, repository.queryRunner);
    }

    async findAll(options?: FindManyOptions<T>): Promise<T[]> {
        return this.repository.find(options);
    }

    async findOne(options: FindOneOptions<T>): Promise<T | null> {
        return this.repository.findOne(options);
    }

    async findById(id: any, options?: FindOneOptions<T>): Promise<T | null> {
        return this.repository.findOne({
            where: { id } as FindOptionsWhere<T>,
            ...options,
        });
    }

    async createEntity(data: Partial<T>): Promise<T> {
        const entity = this.repository.create(data as DeepPartial<T>);
        return this.repository.save(entity);
    }

    async updateEntity(id: any, data: Partial<T>): Promise<T | null> {
        await this.repository.update(id, data as any);
        return this.findById(id);
    }

    async deleteEntity(id: any): Promise<boolean> {
        const result = await this.repository.delete(id);
        return result.affected !== 0;
    }

    async countEntities(options?: FindManyOptions<T>): Promise<number> {
        return this.repository.count(options);
    }
}
