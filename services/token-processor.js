import jsonwebtoken from "jsonwebtoken";

const { sign, verify, decode } = jsonwebtoken;

export default class {
  static async getToken(login) {
    return await sign({ login }, "borowisimo", {
      expiresIn: "2h",
    });
  }

  static async verifyToken(token) {
    try {
      await verify(token, "borowisimo");
      return true;
    } catch {
      return false;
    }
  }

  static async decodeToken(token) {
    try {
      const { login } = await decode(token);
      return login;
    } catch {
      return null;
    }
  }
}
