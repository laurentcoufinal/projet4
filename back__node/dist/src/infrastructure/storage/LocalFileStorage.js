"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalFileStorage = void 0;
const promises_1 = __importDefault(require("node:fs/promises"));
const node_path_1 = __importDefault(require("node:path"));
class LocalFileStorage {
    constructor(baseDir) {
        this.baseDir = baseDir;
    }
    resolvePath(storageKey) {
        return node_path_1.default.join(this.baseDir, storageKey);
    }
    async put(storageKey, data) {
        await promises_1.default.mkdir(this.baseDir, { recursive: true });
        await promises_1.default.writeFile(this.resolvePath(storageKey), data);
    }
    async read(storageKey) {
        try {
            return await promises_1.default.readFile(this.resolvePath(storageKey));
        }
        catch {
            return null;
        }
    }
    async delete(storageKey) {
        try {
            await promises_1.default.unlink(this.resolvePath(storageKey));
        }
        catch {
            // idempotent delete
        }
    }
    async exists(storageKey) {
        try {
            await promises_1.default.access(this.resolvePath(storageKey));
            return true;
        }
        catch {
            return false;
        }
    }
}
exports.LocalFileStorage = LocalFileStorage;
