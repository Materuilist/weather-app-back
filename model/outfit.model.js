import { DataTypes } from "sequelize";

import sequalize from "../utils/database.js";

const Outfit = sequalize.define("Outfit", {
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

export default Outfit;
