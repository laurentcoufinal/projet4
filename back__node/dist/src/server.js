"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const mongoose_1 = require("./infrastructure/db/mongoose");
const env_1 = require("./shared/config/env");
async function bootstrap() {
    await (0, mongoose_1.connectMongo)(env_1.env.mongoUri);
    const app = (0, app_1.buildApp)();
    app.listen(env_1.env.port, () => {
        // eslint-disable-next-line no-console
        console.log(`API back__node démarrée sur le port ${env_1.env.port}`);
    });
}
bootstrap().catch((error) => {
    // eslint-disable-next-line no-console
    console.error(error);
    process.exit(1);
});
