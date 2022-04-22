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
    type: DataTypes.TEXT,
    allowNull: false,
  },
  saveData: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  clo: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  layer: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  sex: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

export default Garment;
