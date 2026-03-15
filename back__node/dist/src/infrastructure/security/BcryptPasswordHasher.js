"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BcryptPasswordHasher = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
class BcryptPasswordHasher {
    async hash(value) {
        return bcrypt_1.default.hash(value, 12);
    }
    async compare(value, hash) {
        return bcrypt_1.default.compare(value, hash);
    }
}
exports.BcryptPasswordHasher = BcryptPasswordHasher;
