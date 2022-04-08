import sequalize from "./database.js";

export default async (deleteAllDbs = false, createTestData = false) => {
  if (deleteAllDbs) {
    await sequalize.dropAllSchemas({});
    await sequalize.sync();
  }
};
