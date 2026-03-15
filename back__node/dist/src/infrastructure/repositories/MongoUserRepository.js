"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoUserRepository = void 0;
const UserModel_1 = require("../db/schemas/UserModel");
function toUser(doc) {
    return {
        id: doc._id.toString(),
        name: doc.name,
        email: doc.email,
        passwordHash: doc.passwordHash,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
    };
}
class MongoUserRepository {
    async create(input) {
        const created = await UserModel_1.UserModel.create(input);
        return toUser(created);
    }
    async findByEmail(email) {
        const user = await UserModel_1.UserModel.findOne({ email: email.toLowerCase() }).exec();
        return user ? toUser(user) : null;
    }
    async findById(id) {
        const user = await UserModel_1.UserModel.findById(id).exec();
        return user ? toUser(user) : null;
    }
}
exports.MongoUserRepository = MongoUserRepository;
