import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS' | 'CONNECT' | 'TRACE';

// Array of valid HTTP methods for validation
export const HTTP_METHODS: HttpMethod[] = [
  'GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS', 'CONNECT', 'TRACE'
];

@Entity('request_history')
export class RequestHistory {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({
        type: 'enum',
        enum: HTTP_METHODS,
        default: 'GET'
    })
    method!: HttpMethod;

    @Column({ length: 2048, default: '' })
    url!: string;

    @Column({ length: 2, default: '01' })
    month!: string;

    @Column({ length: 2, default: '01' })
    day!: string;

    @Column({ length: 4, default: '2025' })
    year!: string;

    @Column({ length: 11, default: '12:00:00 AM' })
    time!: string;

    @CreateDateColumn({ type: 'timestamp' })
    created_at!: Date;

    @Column({ type: 'boolean', default: false })
    is_favorite!: boolean;
}
