import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { buildContainer, type AppContainer } from './container';
import { errorHandler, notFoundHandler } from './interfaces/http/middleware/errorHandler';
import { buildV1Router } from './interfaces/http/routes/v1';

export function buildApp(containerArg?: AppContainer) {
  const app = express();
  const container = containerArg ?? buildContainer();

  app.use(helmet());
  app.use(cors());
  app.use(morgan('dev'));
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true }));

  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  app.use('/api/v1', buildV1Router(container));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
