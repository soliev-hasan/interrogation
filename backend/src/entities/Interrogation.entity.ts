import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { UserEntity } from "./user.entity";

@Entity({ name: "interrogations" })
export class InterrogationEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar" })
  title!: string;

  @Column({ type: "timestamptz" })
  date!: Date;

  @Column({ type: "varchar" })
  suspect!: string;

  @Column({ type: "varchar" })
  officer!: string;

  @Column({ type: "text", default: "" })
  transcript!: string;

  @Column({ type: "varchar", nullable: true })
  audioFilePath?: string;

  @Column({ type: "varchar", nullable: true })
  wordDocumentPath?: string;

  // createdBy: ObjectId ref -> ManyToOne relation
  @ManyToOne(() => UserEntity, { nullable: false, onDelete: "CASCADE" })
  @JoinColumn({ name: "created_by" })
  createdBy!: UserEntity;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt!: Date;
}
