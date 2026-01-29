import { appDataSource } from "../config/database";
import { UserEntity, UserRole } from "../entities";

export const UserRepository = {
  repo() {
    return appDataSource.getRepository(UserEntity);
  },

  save(user: {
    username: string;
    email: string;
    password: string;
    role: UserRole;
  }) {
    return this.repo().save(user);
  },

  async update(id: string, user: Partial<UserEntity>) {
    await this.repo().update(id, user);
    return await this.repo().findOneByOrFail({ id });
  },

  delete(id: string) {
    return this.repo().delete(id);
  },

  findById(id: string, skipPassword?: boolean) {
    if (skipPassword)
      return this.repo().findOne({
        where: { id },
        select: { password: false },
      });

    return this.repo().findOneBy({ id });
  },

  findByUsername(username: string) {
    return this.repo().findOneBy({ username });
  },

  findAll(skipPassword?: boolean) {
    if (skipPassword) return this.repo().find({ select: { password: false } });

    return this.repo().find();
  },
};
