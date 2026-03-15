"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildApp = buildApp;
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const container_1 = require("./container");
const errorHandler_1 = require("./interfaces/http/middleware/errorHandler");
const v1_1 = require("./interfaces/http/routes/v1");
function buildApp(containerArg) {
    const app = (0, express_1.default)();
    const container = containerArg ?? (0, container_1.buildContainer)();
    app.use((0, helmet_1.default)());
    app.use((0, cors_1.default)());
    app.use((0, morgan_1.default)('dev'));
    app.use(express_1.default.json({ limit: '2mb' }));
    app.use(express_1.default.urlencoded({ extended: true }));
    app.get('/health', (_req, res) => {
        res.status(200).json({ status: 'ok' });
    });
    app.use('/api/v1', (0, v1_1.buildV1Router)(container));
    app.use(errorHandler_1.notFoundHandler);
    app.use(errorHandler_1.errorHandler);
    return app;
}
