import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity({ name: 'graphql_endpoint_history' })
export class GraphQLEndpointHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  url: string;


  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;
}
