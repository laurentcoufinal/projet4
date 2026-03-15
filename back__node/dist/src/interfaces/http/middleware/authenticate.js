"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
const errors_1 = require("../../../shared/errors/errors");
function authenticate(tokenService) {
    return (req, _res, next) => {
        const header = req.headers.authorization;
        if (!header || !header.startsWith('Bearer ')) {
            return next(errors_1.Errors.unauthorized('Token manquant.'));
        }
        const token = header.slice('Bearer '.length);
        try {
            const payload = tokenService.verify(token);
            req.auth = {
                userId: payload.sub,
                email: payload.email,
                name: payload.name,
            };
            next();
        }
        catch {
            next(errors_1.Errors.unauthorized('Token invalide.'));
        }
    };
}
