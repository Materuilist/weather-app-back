import { ROLES, BODY_PARTS } from "../constants.js";
import Role from "../model/role.model.js";
import BodyPart from "../model/body-part.model.js";
import User from "../model/user.model.js";
import Encrypter from "../services/encrypter.js";
import sequalize from "./database.js";
import Garment from "../model/garment.model.js";
import { CLOTHES_MOCK } from "./clothes-mock.js";
import Wardrobe from "../model/wardrobe.model.js";

export default async (deleteAllDbs = false, createTestData = false) => {
  if (deleteAllDbs) {
    await Wardrobe.drop();
    await Garment.drop();
    await BodyPart.drop();
    await User.drop();
    await Role.drop();
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

  BodyPart.bulkCreate(
    Object.entries(BODY_PARTS).map(([key, value]) => ({
      id: value,
      naming: key,
    }))
  );

  if (createTestData) {
    await User.bulkCreate([
      {
        login: "designer",
        password: await Encrypter.hash("designer"),
        roleId: ROLES.DESIGNER,
        sex: 1,
      },
      {
        login: "borow",
        password: await Encrypter.hash("borow"),
        roleId: ROLES.DEFAULT,
        sex: 1,
      },
    ]);

    await Garment.bulkCreate(CLOTHES_MOCK);

    await Wardrobe.create({ userId: 2, garmentId: 1 });
  }
};
