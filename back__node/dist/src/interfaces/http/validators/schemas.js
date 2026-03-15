"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.passwordDownloadSchema = exports.shareLinkSchema = exports.shareSchema = exports.uploadFormSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
exports.registerSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(255),
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8),
    password_confirmation: zod_1.z.string().min(8),
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(1),
});
exports.uploadFormSchema = zod_1.z.object({
    name: zod_1.z.string().max(255).optional(),
    tags: zod_1.z.union([zod_1.z.array(zod_1.z.string()), zod_1.z.string()]).optional(),
    password: zod_1.z.string().min(6).max(255).optional(),
});
exports.shareSchema = zod_1.z
    .object({
    user_id: zod_1.z.string().optional(),
    email: zod_1.z.string().email().optional(),
})
    .refine((value) => Boolean(value.user_id || value.email), {
    message: 'Indiquez user_id ou email.',
});
exports.shareLinkSchema = zod_1.z.object({
    expires_in_days: zod_1.z.number().int().min(1).max(7).optional(),
});
exports.passwordDownloadSchema = zod_1.z.object({
    password: zod_1.z.string().min(1).max(255),
});
