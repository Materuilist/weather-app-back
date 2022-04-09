import Error from "../entities/error.js";
import Role from "../model/role.model.js";
import User from "../model/user.model.js";
import TokenProcessor from "../services/token-processor.js";

export const parseUser = async (req, res, next) => {
  if (!req.headers.authorization) {
    return next(new Error(401, "Ошибка при получении пользователя!"));
  }
  const token = req.headers.authorization.split(" ")[1];
  const login = await TokenProcessor.decodeToken(token);

  if (!login) {
    return next(new Error(401, "Ошибка при получении пользователя!"));
  }

  const user = await User.findOne({ where: { login }, include: 'role' });

  if (!user) {
    return next(new Error(401, "Ошибка при получении пользователя!"));
  }

  req.body.user = user;
  next();
};
