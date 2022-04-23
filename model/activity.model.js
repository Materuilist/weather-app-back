import { DataTypes } from "sequelize";

import sequalize from "../utils/database.js";

const Activity = sequalize.define("Activity", {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  intensivity: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  timestamp: {
    type: DataTypes.DATE,
    allowNull: false,
  },
});

export default Activity;
