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
      parameters: {
        page: {
          in: 'query',
          name: 'page',
          schema: { type: 'integer', minimum: 1, default: 1 },
          description: 'Page number',
        },
        limit: {
          in: 'query',
          name: 'limit',
          schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
          description: 'Items per page',
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
            page: { type: 'integer', example: 1 },
            limit: { type: 'integer', example: 20 },
            total: { type: 'integer', example: 100 },
            hasNextPage: { type: 'boolean', example: true },
            hasPrevPage: { type: 'boolean', example: false },
          },
        },
        TokenPair: {
          type: 'object',
          properties: {
            accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
            refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
          },
        },
        UserProfile: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'clxyz123' },
            firstname: { type: 'string', example: 'John' },
            lastname: { type: 'string', example: 'Doe' },
            username: { type: 'string', nullable: true, example: 'johndoe' },
            email: { type: 'string', format: 'email', example: 'john.doe@example.com' },
            avatar: { type: 'string', format: 'uri', nullable: true, example: 'https://eu2.contabostorage.com/...' },
            is_author: { type: 'boolean', example: false },
            profile_heading: { type: 'string', nullable: true, example: 'Producer & Beatmaker' },
            profile_description: { type: 'string', nullable: true },
            profile_contact_email: { type: 'string', format: 'email', nullable: true },
            profile_social_links: {
              type: 'object',
              nullable: true,
              properties: {
                twitter: { type: 'string', format: 'uri' },
                instagram: { type: 'string', format: 'uri' },
                facebook: { type: 'string', format: 'uri' },
                youtube: { type: 'string', format: 'uri' },
                soundcloud: { type: 'string', format: 'uri' },
                spotify: { type: 'string', format: 'uri' },
                website: { type: 'string', format: 'uri' },
              },
            },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Beat: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            title: { type: 'string', example: 'Dark Trap' },
            description: { type: 'string', nullable: true },
            bpm: { type: 'integer', example: 140 },
            regularPrice: { type: 'string', example: '29.99' },
            extendedPrice: { type: 'string', example: '99.99' },
            isFree: { type: 'boolean', example: false },
            isFeatured: { type: 'boolean', example: false },
            audioUrl: { type: 'string', format: 'uri', nullable: true },
            coverImageUrl: { type: 'string', format: 'uri', nullable: true },
            tags: { type: 'array', items: { type: 'string' }, example: ['trap', 'dark'] },
            categoryId: { type: 'integer', example: 1 },
            subCategoryId: { type: 'integer', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        BeatWrite: {
          type: 'object',
          required: ['title', 'bpm', 'regularPrice', 'extendedPrice', 'categoryId'],
          properties: {
            title: { type: 'string', minLength: 1, maxLength: 100, example: 'Dark Trap' },
            description: { type: 'string', maxLength: 5000 },
            bpm: { type: 'integer', minimum: 1, maximum: 400, example: 140 },
            regularPrice: { type: 'string', example: '29.99' },
            extendedPrice: { type: 'string', example: '99.99' },
            isFree: { type: 'boolean', default: false },
            audioUrl: { type: 'string', format: 'uri' },
            coverImageUrl: { type: 'string', format: 'uri' },
            tags: { type: 'array', items: { type: 'string', maxLength: 50 }, maxItems: 20 },
            categoryId: { type: 'string', pattern: '^\\d+$', example: '1' },
            subCategoryId: { type: 'string', pattern: '^\\d+$' },
          },
        },
        CartItem: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '7' },
            itemId: { type: 'string', example: '42' },
            licenseType: { type: 'string', enum: ['regular', 'extended'], example: 'regular' },
            quantity: { type: 'integer', example: 1 },
            item: {
              type: 'object',
              properties: {
                id: { type: 'string', example: '42' },
                name: { type: 'string', example: 'Dark Trap' },
                slug: { type: 'string', example: 'dark-trap' },
                thumbnail: { type: 'string', nullable: true },
                regularPrice: { type: 'number', example: 29.99 },
                extendedPrice: { type: 'number', example: 99.99 },
                bpm: { type: 'integer', nullable: true, example: 140 },
              },
            },
          },
        },
        OrderItem: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '1' },
            itemId: { type: 'string', nullable: true, example: '42' },
            name: { type: 'string', nullable: true, example: 'Dark Trap' },
            slug: { type: 'string', nullable: true, example: 'dark-trap' },
            thumbnail: { type: 'string', nullable: true },
            licenseType: { type: 'string', enum: ['regular', 'extended'] },
            price: { type: 'number', example: 29.99 },
            quantity: { type: 'integer', example: 1 },
            total: { type: 'number', example: 29.99 },
          },
        },
        Order: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '1' },
            amount: { type: 'number', example: 29.99 },
            fees: { type: 'number', example: 0 },
            total: { type: 'number', example: 29.99 },
            status: { type: 'string', enum: ['pending', 'paid', 'failed', 'cancelled'], example: 'paid' },
            createdAt: { type: 'string', format: 'date-time' },
            items: { type: 'array', items: { $ref: '#/components/schemas/OrderItem' } },
          },
        },
        Category: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'Hip-Hop' },
            slug: { type: 'string', example: 'hip-hop' },
          },
        },
      },
      responses: {
        BadRequest: {
          description: 'Bad request',
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/ErrorEnvelope' } },
          },
        },
        Unauthorized: {
          description: 'Missing or invalid access token',
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/ErrorEnvelope' } },
          },
        },
        Forbidden: {
          description: 'Insufficient role/permissions',
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/ErrorEnvelope' } },
          },
        },
        NotFound: {
          description: 'Resource not found',
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/ErrorEnvelope' } },
          },
        },
        ValidationError: {
          description: 'Request validation failed',
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/ErrorEnvelope' } },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
    tags: [
      { name: 'Auth', description: 'Registration, login, and token management' },
      { name: 'Users', description: 'User profile and avatar' },
      { name: 'Beats', description: 'Beat catalogue and producer writes' },
      { name: 'Categories', description: 'Genre categories' },
      { name: 'Cart', description: 'Shopping cart management' },
      { name: 'Orders', description: 'Purchase history, validation, and checkout' },
    ],
    paths: {},
  },
  apis: [
    './src/modules/**/routes.ts',
    './dist/modules/**/routes.js',
  ],
});
