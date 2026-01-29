import { appDataSource } from "../config/database";

const dropEmailUniqueIndex = async () => {
  try {
    await appDataSource.initialize();

    // List indexes on users table
    const indexes = await appDataSource.query(`
      SELECT indexname, indexdef
      FROM pg_indexes
      WHERE tablename = 'users';
    `);

    console.log("Current indexes:");
    console.log(JSON.stringify(indexes, null, 2));

    // Typical TypeORM-generated unique index name
    // It may differ depending on how the table was created
    const emailIndex = indexes.find(
      (i: any) =>
        i.indexdef.includes("(email)") && i.indexdef.includes("UNIQUE"),
    );

    if (!emailIndex) {
      console.log("No unique index found on email field.");
      process.exit(0);
    }

    console.log(`Dropping unique index: ${emailIndex.indexname}`);
    await appDataSource.query(
      `DROP INDEX IF EXISTS "${emailIndex.indexname}";`,
    );

    console.log("Unique index on email field dropped successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Error dropping email index:", error);
    process.exit(1);
  }
};

dropEmailUniqueIndex();
