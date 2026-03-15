"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = validate;
const errors_1 = require("../../../shared/errors/errors");
function validate(schema, value) {
    const parsed = schema.safeParse(value);
    if (!parsed.success) {
        throw errors_1.Errors.validation('Erreur de validation.', parsed.error.flatten().fieldErrors);
    }
    return parsed.data;
}
