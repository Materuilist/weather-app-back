import { ROLES } from "../constants/roles.constant.js";
import Role from "../model/role.model.js";
import sequalize from "./database.js";

export default async (deleteAllDbs = false, createTestData = false) => {
  if (deleteAllDbs) {
    await sequalize.dropAllSchemas({});
    await sequalize.sync();
  }

  Role.bulkCreate([
    {
      id: ROLES.DEFAULT,
      name: "default",
    },
    {
      id: ROLES.DESIGNER,
      name: "designer",
    },
  ]);
};
