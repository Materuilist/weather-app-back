import { ROLES, BODY_PARTS } from "../constants.js";
import Role from "../model/role.model.js";
import BodyPart from "../model/body-part.model.js";
import User from "../model/user.model.js";
import Encrypter from "../services/encrypter.js";
import sequalize from "./database.js";
import Garment from "../model/garment.model.js";
import { CLOTHES_MOCK } from "./clothes-mock.js";
import Wardrobe from "../model/wardrobe.model.js";
import OutfitGarment from "../model/outfit-garment.model.js";
import OutfitWeather from "../model/outfit-weather.model.js";
import Activity from "../model/activity.model.js";
import UserLocation from "../model/user-location.model.js";
import Weather from "../model/weather.model.js";
import Outfit from "../model/outfit.model.js";
import { createStatsMockData } from "./stats-mock.js";

export default async (deleteAllDbs = false, createTestData = false) => {
  if (deleteAllDbs) {
    await Wardrobe.drop();
    await OutfitGarment.drop();
    await OutfitWeather.drop();
    await Activity.drop();
    await UserLocation.drop();
    await Weather.drop();
    await Outfit.drop();
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
      {
        login: "user1",
        password: await Encrypter.hash("user1"),
        roleId: ROLES.DEFAULT,
        sex: 2,
      },
      {
        login: "user2",
        password: await Encrypter.hash("user2"),
        roleId: ROLES.DEFAULT,
        sex: 1,
      },
      {
        login: "user3",
        password: await Encrypter.hash("user3"),
        roleId: ROLES.DEFAULT,
        sex: 2,
      },
    ]);

    await Garment.bulkCreate(CLOTHES_MOCK);

    await Wardrobe.create({ userId: 2, garmentId: 1 });

    await createStatsMockData();
  }
};
