import { Sequelize } from "sequelize";

const sequalize = new Sequelize("weather_app", "root", "sqlborow", {
    dialect: "mysql",
    host: "localhost",
});

export default sequalize;