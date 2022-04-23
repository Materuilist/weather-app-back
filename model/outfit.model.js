import { DataTypes } from "sequelize";

import sequalize from "../utils/database.js";

const Outfit = sequalize.define("Outfit", {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
});

export default Outfit;
