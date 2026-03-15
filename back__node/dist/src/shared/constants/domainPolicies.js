"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FORBIDDEN_FILE_EXTENSIONS = exports.SHARE_LINK_MAX_EXPIRES_IN_DAYS = exports.SHARE_LINK_MIN_EXPIRES_IN_DAYS = exports.SHARE_LINK_DEFAULT_EXPIRES_IN_DAYS = exports.USER_PASSWORD_MIN_LENGTH = exports.FILE_PASSWORD_MIN_LENGTH = exports.FILE_MAX_SIZE_BYTES = void 0;
exports.FILE_MAX_SIZE_BYTES = 1024 * 1024 * 1024; // 1 Go
exports.FILE_PASSWORD_MIN_LENGTH = 6;
exports.USER_PASSWORD_MIN_LENGTH = 8;
exports.SHARE_LINK_DEFAULT_EXPIRES_IN_DAYS = 7;
exports.SHARE_LINK_MIN_EXPIRES_IN_DAYS = 1;
exports.SHARE_LINK_MAX_EXPIRES_IN_DAYS = 7;
exports.FORBIDDEN_FILE_EXTENSIONS = ['.exe', '.bat', '.cmd', '.sh', '.msi'];
