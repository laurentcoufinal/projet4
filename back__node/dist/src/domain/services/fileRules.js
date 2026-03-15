"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertUserPassword = assertUserPassword;
exports.assertFilePassword = assertFilePassword;
exports.assertFileSize = assertFileSize;
exports.assertAllowedExtension = assertAllowedExtension;
exports.assertShareLinkDays = assertShareLinkDays;
exports.normalizeTagLabel = normalizeTagLabel;
const node_path_1 = __importDefault(require("node:path"));
const domainPolicies_1 = require("../../shared/constants/domainPolicies");
const errors_1 = require("../../shared/errors/errors");
function assertUserPassword(password) {
    if (password.length < domainPolicies_1.USER_PASSWORD_MIN_LENGTH) {
        throw errors_1.Errors.validation(`Le mot de passe doit contenir au moins ${domainPolicies_1.USER_PASSWORD_MIN_LENGTH} caractères.`);
    }
}
function assertFilePassword(password) {
    if (password.length < domainPolicies_1.FILE_PASSWORD_MIN_LENGTH) {
        throw errors_1.Errors.validation(`Le mot de passe fichier doit contenir au moins ${domainPolicies_1.FILE_PASSWORD_MIN_LENGTH} caractères.`);
    }
}
function assertFileSize(size) {
    if (size > domainPolicies_1.FILE_MAX_SIZE_BYTES) {
        throw errors_1.Errors.validation('La taille du fichier dépasse la limite de 1 Go.');
    }
}
function assertAllowedExtension(fileName) {
    const extension = node_path_1.default.extname(fileName).toLowerCase();
    if (domainPolicies_1.FORBIDDEN_FILE_EXTENSIONS.includes(extension)) {
        throw errors_1.Errors.validation(`Extension interdite: ${extension}`);
    }
}
function assertShareLinkDays(days) {
    if (days < domainPolicies_1.SHARE_LINK_MIN_EXPIRES_IN_DAYS || days > domainPolicies_1.SHARE_LINK_MAX_EXPIRES_IN_DAYS) {
        throw errors_1.Errors.validation(`La durée d'expiration doit être comprise entre ${domainPolicies_1.SHARE_LINK_MIN_EXPIRES_IN_DAYS} et ${domainPolicies_1.SHARE_LINK_MAX_EXPIRES_IN_DAYS} jours.`);
    }
}
function normalizeTagLabel(value) {
    return value.trim().toLowerCase();
}
