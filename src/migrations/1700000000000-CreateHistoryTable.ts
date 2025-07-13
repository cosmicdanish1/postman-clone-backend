import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateHistoryTable1700000000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'history',
                columns: [
                    {
                        name: 'id',
                        type: 'int',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'increment',
                    },
                    {
                        name: 'method',
                        type: 'varchar',
                        length: '10',
                        isNullable: false,
                    },
                    {
                        name: 'url',
                        type: 'text',
                        isNullable: false,
                    },
                    {
                        name: 'requestHeaders',
                        type: 'json',
                        isNullable: true,
                    },
                    {
                        name: 'requestBody',
                        type: 'text',
                        isNullable: true,
                    },
                    {
                        name: 'statusCode',
                        type: 'int',
                        isNullable: true,
                    },
                    {
                        name: 'responseHeaders',
                        type: 'json',
                        isNullable: true,
                    },
                    {
                        name: 'responseBody',
                        type: 'text',
                        isNullable: true,
                    },
                    {
                        name: 'responseTime',
                        type: 'float',
                        isNullable: true,
                    },
                    {
                        name: 'createdAt',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
                    },
                    {
                        name: 'updatedAt',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
                        onUpdate: 'CURRENT_TIMESTAMP',
                    },
                ],
            }),
            true,
        );

        // Add indexes
        await queryRunner.query('CREATE INDEX IDX_history_method ON history(method)');
        await queryRunner.query('CREATE INDEX IDX_history_statusCode ON history(statusCode)');
        await queryRunner.query('CREATE INDEX IDX_history_createdAt ON history(createdAt)');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('history');
    }
}
