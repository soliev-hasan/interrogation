import { appDataSource } from "../config/database";
import { InterrogationEntity, UserEntity } from "../entities";

const listInterrogations = async () => {
  try {
    await appDataSource.initialize();

    console.log("User entity registered:", UserEntity.name);

    const interrogationRepo = appDataSource.getRepository(InterrogationEntity);

    // Equivalent of `.find().populate("createdBy", "username email")`
    const interrogations = await interrogationRepo
      .createQueryBuilder("interrogation")
      .leftJoinAndSelect("interrogation.createdBy", "user")
      .select(["interrogation", "user.username", "user.email"])
      .orderBy("interrogation.createdAt", "DESC")
      .getMany();

    console.log("Interrogations in database:");
    console.log("===========================");

    interrogations.forEach((interrogation) => {
      console.log(`ID: ${interrogation.id}`);
      console.log(`Title: ${interrogation.title}`);
      console.log(`Date: ${interrogation.date}`);
      console.log(`Suspect: ${interrogation.suspect}`);
      console.log(`Officer: ${interrogation.officer}`);
      console.log(`Transcript: ${interrogation.transcript}`);
      console.log(`Audio File Path: ${interrogation.audioFilePath}`);

      if (interrogation.createdBy) {
        console.log(
          `Created By: ${interrogation.createdBy.username} (${interrogation.createdBy.email ?? "N/A"})`,
        );
      }

      console.log(`Created: ${interrogation.createdAt}`);
      console.log("-------------------");
    });

    process.exit(0);
  } catch (error) {
    console.error("Error listing interrogations:", error);
    process.exit(1);
  }
};

listInterrogations();
