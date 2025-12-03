import dotenv from "dotenv";
import connectDB from "../config/database";
import Interrogation from "../models/InterrogationModel";
import User from "../models/UserModel"; // Import User model to register it

// Load environment variables
dotenv.config();

const listInterrogations = async () => {
  try {
    // Connect to database
    await connectDB();

    // Just reference User to ensure it's registered
    console.log(`User model registered: ${User.modelName}`);

    // Get all interrogations
    const interrogations = await Interrogation.find().populate(
      "createdBy",
      "username email"
    );

    console.log("Interrogations in database:");
    console.log("===========================");
    interrogations.forEach((interrogation) => {
      console.log(`ID: ${interrogation._id}`);
      console.log(`Title: ${interrogation.title}`);
      console.log(`Date: ${interrogation.date}`);
      console.log(`Suspect: ${interrogation.suspect}`);
      console.log(`Officer: ${interrogation.officer}`);
      console.log(`Transcript: ${interrogation.transcript}`);
      if (interrogation.createdBy) {
        // @ts-ignore
        console.log(
          `Created By: ${interrogation.createdBy.username} (${interrogation.createdBy.email})`
        );
      }
      // @ts-ignore
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
