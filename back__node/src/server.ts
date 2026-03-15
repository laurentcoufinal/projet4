import { buildApp } from './app';
import { connectMongo } from './infrastructure/db/mongoose';
import { env } from './shared/config/env';

async function bootstrap(): Promise<void> {
  await connectMongo(env.mongoUri);
  const app = buildApp();
  app.listen(env.port, () => {
    // eslint-disable-next-line no-console
    console.log(`API back__node démarrée sur le port ${env.port}`);
  });
}

bootstrap().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error);
  process.exit(1);
});
