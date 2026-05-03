import swaggerJsdoc from 'swagger-jsdoc';
import { config } from '@config/index';

export const openapiSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Beats API',
      version: '1.0.0',
      description: 'REST API for the beats marketplace.',
    },
    servers: [{ url: `${config.app.url}/api/v1`, description: config.env }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        SuccessEnvelope: {
          type: 'object',
          required: ['success', 'code', 'message', 'data'],
          properties: {
            success: { type: 'boolean', example: true },
            code: { type: 'integer', example: 200 },
            message: { type: 'string', example: 'OK' },
            data: {},
            meta: { type: 'object', additionalProperties: true },
          },
        },
        ErrorEnvelope: {
          type: 'object',
          required: ['success', 'code', 'message'],
          properties: {
            success: { type: 'boolean', example: false },
            code: { type: 'integer', example: 422 },
            message: { type: 'string', example: 'VALIDATION_ERROR' },
            details: { type: 'object', additionalProperties: true },
          },
        },
        PaginationMeta: {
          type: 'object',
          required: ['page', 'limit', 'total', 'hasNextPage', 'hasPrevPage'],
          properties: {
            page: { type: 'integer' },
            limit: { type: 'integer' },
            total: { type: 'integer' },
            hasNextPage: { type: 'boolean' },
            hasPrevPage: { type: 'boolean' },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
    tags: [
      { name: 'Auth' },
      { name: 'Users' },
      { name: 'Beats' },
      { name: 'Cart' },
      { name: 'Orders' },
      { name: 'Playlists' },
    ],
    paths: {},
  },
  apis: [
    './src/modules/**/routes.ts',
    './src/modules/**/controller.ts',
    './dist/modules/**/routes.js',
    './dist/modules/**/controller.js',
  ],
});
