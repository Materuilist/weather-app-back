import { compare, hash } from "bcrypt";

export default class {
  constructor() {}

  static async hash(value) {
    return await hash(value, 12);
  }

  static async verify(value, encrypted) {
    return await compare(value, encrypted);
  }
}
