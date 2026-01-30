import { appDataSource } from "../config/database";
import { UserEntity } from "../entities";

const listUsers = async () => {
  try {
    await appDataSource.initialize();
    const userRepo = appDataSource.getRepository(UserEntity);

    // Password is excluded automatically because of `select: false`
    const users = await userRepo.find({
      order: { createdAt: "DESC" },
    });

    console.log("Users in database:");
    console.log("==================");

    users.forEach((user) => {
      console.log(`ID: ${user.id}`);
      console.log(`Username: ${user.username}`);
      console.log(`Email: ${user.email ?? "N/A"}`);
      console.log(`Role: ${user.role}`);
      console.log(`Created: ${user.createdAt}`);
      console.log("------------------");
    });

    process.exit(0);
  } catch (error) {
    console.error("Error listing users:", error);
    process.exit(1);
  }
};

listUsers();
