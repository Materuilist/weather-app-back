import { DataTypes } from "sequelize";

import sequalize from "../utils/database.js";
import Garment from "./garment.model.js";

const BodyPart = sequalize.define("BodyPart", {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  naming: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

BodyPart.hasMany(Garment, {
  foreignKey: "bodyPartId",
  as: "garments",
});
Garment.belongsTo(BodyPart, {
  foreignKey: "bodyPartId",
  as: "bodyPart",
});

export default BodyPart;
