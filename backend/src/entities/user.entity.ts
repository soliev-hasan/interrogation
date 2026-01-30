import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

export enum UserRole {
  INVESTIGATOR = "investigator",
  ADMIN = "admin",
}

@Entity({ name: "users" })
export class UserEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", unique: true })
  username!: string;

  @Column({ type: "varchar", nullable: true })
  email?: string;

  @Column({ type: "varchar", select: false })
  password!: string;

  @Column({
    type: "enum",
    enum: UserRole,
    default: UserRole.INVESTIGATOR,
  })
  role!: UserRole;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt!: Date;
}
