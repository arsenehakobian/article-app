import { MigrationInterface, QueryRunner } from 'typeorm';

export class ArticleModel1748125319181 implements MigrationInterface {
  name = 'ArticleModel1748125319181';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "article" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "description" character varying NOT NULL, "publishedAt" TIMESTAMP NOT NULL, "authorId" integer, CONSTRAINT "PK_40808690eb7b915046558c0f81b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "article" ADD CONSTRAINT "FK_a9c5f4ec6cceb1604b4a3c84c87" FOREIGN KEY ("authorId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "article" DROP CONSTRAINT "FK_a9c5f4ec6cceb1604b4a3c84c87"`,
    );
    await queryRunner.query(`DROP TABLE "article"`);
  }
}
