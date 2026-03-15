"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toPublicUser = toPublicUser;
function toPublicUser(user) {
    return {
        id: user.id,
        name: user.name,
        email: user.email,
    };
}
