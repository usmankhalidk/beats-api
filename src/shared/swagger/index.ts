import type { Express } from 'express';
import swaggerUi from 'swagger-ui-express';
import { openapiSpec } from './openapi';

export const SWAGGER_PATH = '/api-docs';

export function mountSwagger(app: Express): void {
  app.use(SWAGGER_PATH, swaggerUi.serve, swaggerUi.setup(openapiSpec, { explorer: true }));
  app.get(`${SWAGGER_PATH}.json`, (_req, res) => {
    res.json(openapiSpec);
  });
}
