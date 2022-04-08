import { DataTypes } from "sequelize";

import sequalize from "../utils/database.js";

const Garment = sequalize.define("Garment", {
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
  imageData: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  clo: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  sex: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

export default Garment;
