import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, BaseEntity } from 'typeorm';

@Entity('history')
export class History extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'varchar', length: 10 })
    method!: string;

    @Column('text')
    url!: string;

    @Column('json', { nullable: true })
    requestHeaders: Record<string, any> | null = null;

    @Column('text', { nullable: true })
    requestBody: string | null = null;

    @Column('int', { nullable: true })
    statusCode: number | null = null;

    @Column('json', { nullable: true })
    responseHeaders: Record<string, any> | null = null;

    @Column('text', { nullable: true })
    responseBody: string | null = null;

    @Column('float', { nullable: true })
    responseTime: number | null = null;

    @CreateDateColumn({ type: 'timestamp' })
    createdAt!: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updatedAt!: Date;

    constructor(partial?: Partial<History>) {
        super();
        if (partial) {
            this.id = partial.id || 0;
            this.method = partial.method || '';
            this.url = partial.url || '';
            this.requestHeaders = partial.requestHeaders || null;
            this.requestBody = partial.requestBody || null;
            this.statusCode = partial.statusCode || null;
            this.responseHeaders = partial.responseHeaders || null;
            this.responseBody = partial.responseBody || null;
            this.responseTime = partial.responseTime || null;
            this.createdAt = partial.createdAt || new Date();
            this.updatedAt = partial.updatedAt || new Date();
        } else {
            this.id = 0;
            this.method = '';
            this.url = '';
            this.requestHeaders = null;
            this.requestBody = null;
            this.statusCode = null;
            this.responseHeaders = null;
            this.responseBody = null;
            this.responseTime = null;
            this.createdAt = new Date();
            this.updatedAt = new Date();
        }
    }
}
