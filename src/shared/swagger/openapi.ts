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
            id: { type: 'string', format: 'uuid', example: '01935aaa-bbbb-7ccc-dddd-eeeeffff0000' },
            firstName: { type: 'string', example: 'John' },
            lastName: { type: 'string', example: 'Doe' },
            userName: { type: 'string', nullable: true, example: 'johndoe' },
            email: { type: 'string', format: 'email', example: 'john.doe@example.com' },
            avatar: { type: 'string', format: 'uri', nullable: true, example: 'https://eu2.contabostorage.com/...' },
            role: { type: 'string', enum: ['user', 'producer', 'admin'], example: 'user' },
            profileHeading: { type: 'string', nullable: true, example: 'Producer & Beatmaker' },
            profileDescription: { type: 'string', nullable: true },
            profileContactEmail: { type: 'string', format: 'email', nullable: true },
            profileSocialLinks: {
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
            id: { type: 'string', format: 'uuid', example: '01935678-1234-7890-abcd-1234567890ab' },
            name: { type: 'string', example: 'Dark Trap' },
            slug: { type: 'string', example: 'dark-trap' },
            description: { type: 'string', example: 'Hard-hitting 808s' },
            thumbnail: { type: 'string', format: 'uri', nullable: true },
            previewType: { type: 'string', example: 'audio' },
            previewImage: { type: 'string', format: 'uri', nullable: true },
            previewVideo: { type: 'string', format: 'uri', nullable: true },
            previewAudio: { type: 'string', format: 'uri', nullable: true },
            regularPrice: { type: 'number', example: 29.99 },
            extendedPrice: { type: 'number', example: 99.99 },
            bpm: { type: 'integer', nullable: true, example: 140 },
            musicKey: { type: 'string', nullable: true, example: 'Am' },
            tags: { type: 'array', items: { type: 'string' }, example: ['trap', 'dark'] },
            isFree: { type: 'boolean', example: false },
            isFeatured: { type: 'boolean', example: false },
            isTrending: { type: 'boolean', example: false },
            isBestSelling: { type: 'boolean', example: false },
            isPremium: { type: 'boolean', example: false },
            isOnDiscount: { type: 'boolean', example: false },
            purchasingStatus: { type: 'boolean', example: true },
            totalSales: { type: 'integer', example: 0 },
            totalReviews: { type: 'integer', example: 0 },
            avgReviews: { type: 'number', example: 0 },
            totalViews: { type: 'integer', example: 0 },
            author: {
              type: 'object',
              properties: {
                id: { type: 'string', format: 'uuid', example: '0193abcd-5678-7def-9012-3456789abcde' },
                firstName: { type: 'string', nullable: true, example: 'John' },
                lastName: { type: 'string', nullable: true, example: 'Doe' },
                userName: { type: 'string', nullable: true, example: 'johndoe' },
                avatar: { type: 'string', format: 'uri', nullable: true },
              },
            },
            category: {
              type: 'object',
              properties: {
                id: { type: 'string', format: 'uuid', example: '01935678-1234-7890-abcd-1234567890ab' },
                name: { type: 'string', example: 'Hip-Hop' },
                slug: { type: 'string', example: 'hip-hop' },
              },
            },
            subCategory: {
              type: 'object',
              nullable: true,
              properties: {
                id: { type: 'string', format: 'uuid', example: '01934567-89ab-7cde-f012-3456789abcde' },
                name: { type: 'string', example: 'Trap' },
                slug: { type: 'string', example: 'trap' },
              },
            },
            createdAt: { type: 'string', format: 'date-time', nullable: true },
            updatedAt: { type: 'string', format: 'date-time', nullable: true },
          },
        },
        BeatWrite: {
          type: 'object',
          required: ['title', 'regularPrice', 'extendedPrice', 'categoryId'],
          properties: {
            beatFile: { type: 'string', format: 'binary', description: 'Audio file (MP3, WAV, FLAC, AAC) — max 100 MB. Required on create.' },
            coverImage: { type: 'string', format: 'binary', description: 'Cover image (JPEG, PNG, WebP, GIF) — max 5 MB.' },
            title: { type: 'string', minLength: 1, maxLength: 100, example: 'Dark Trap' },
            description: { type: 'string', maxLength: 5000 },
            bpm: { type: 'integer', minimum: 1, maximum: 400, example: 140 },
            musicKey: { type: 'string', maxLength: 10, example: 'Am' },
            regularPrice: { type: 'string', example: '29.99' },
            extendedPrice: { type: 'string', example: '99.99' },
            isFree: { type: 'string', enum: ['true', 'false'], default: 'false' },
            tags: { type: 'string', example: 'trap,dark,808', description: 'Comma-separated or JSON array string' },
            categoryId: { type: 'string', format: 'uuid', example: '01935aaa-bbbb-7ccc-dddd-eeeeffff0000' },
            subCategoryId: { type: 'string', format: 'uuid' },
          },
        },
        EarningRecord: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid', example: '01935678-1234-7890-abcd-1234567890ab' },
            itemId: { type: 'string', format: 'uuid', example: '0193abcd-5678-7def-9012-3456789abcde', description: 'Beat (item) ID' },
            buyerId: { type: 'string', format: 'uuid', example: '01935aaa-bbbb-7ccc-dddd-eeeeffff0000', description: 'User who purchased' },
            licenseType: { type: 'string', enum: ['regular', 'extended'], example: 'regular' },
            salePrice: { type: 'string', example: '29.99', description: 'Total sale amount' },
            authorEarning: { type: 'string', example: '20.99', description: 'Producer earnings after fees' },
            soldAt: { type: 'string', format: 'date-time', nullable: true },
          },
        },
        CartItem: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid', example: '01935678-1234-7890-abcd-1234567890ab' },
            itemId: { type: 'string', format: 'uuid', example: '0193abcd-5678-7def-9012-3456789abcde' },
            licenseType: { type: 'string', enum: ['regular', 'extended'], example: 'regular' },
            quantity: { type: 'integer', example: 1 },
            item: {
              type: 'object',
              properties: {
                id: { type: 'string', format: 'uuid', example: '0193abcd-5678-7def-9012-3456789abcde' },
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
            id: { type: 'string', format: 'uuid', example: '01935678-1234-7890-abcd-1234567890ab' },
            itemId: { type: 'string', format: 'uuid', nullable: true, example: '0193abcd-5678-7def-9012-3456789abcde' },
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
            id: { type: 'string', format: 'uuid', example: '01935678-1234-7890-abcd-1234567890ab' },
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
            id: { type: 'string', format: 'uuid', example: '01935aaa-bbbb-7ccc-dddd-eeeeffff0000' },
            name: { type: 'string', example: 'Hip-Hop' },
            slug: { type: 'string', example: 'hip-hop' },
          },
        },
        DownloadGrant: {
          type: 'object',
          properties: {
            purchaseId: { type: 'string', format: 'uuid', example: '01935678-1234-7890-abcd-1234567890ab', description: 'purchases.id' },
            beatId: { type: 'string', format: 'uuid', example: '0193abcd-5678-7def-9012-3456789abcde' },
            beatName: { type: 'string', example: 'Dark Trap' },
            licenseType: { type: 'string', enum: ['regular', 'extended'], example: 'regular' },
            url: { type: 'string', format: 'uri', example: 'https://eu2.contabostorage.com/...?X-Amz-Signature=...', description: 'Pre-signed S3 URL, valid for 1 hour' },
            expiresAt: { type: 'string', format: 'date-time', example: '2025-05-08T13:00:00.000Z' },
          },
        },
        PlaylistItem: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid', example: '01935678-1234-7890-abcd-1234567890ab', description: 'playlist_item record ID' },
            beatId: { type: 'string', format: 'uuid', example: '0193abcd-5678-7def-9012-3456789abcde' },
            beatName: { type: 'string', example: 'Dark Trap' },
            beatSlug: { type: 'string', example: 'dark-trap' },
            thumbnail: { type: 'string', nullable: true, example: 'https://eu2.contabostorage.com/...' },
            position: { type: 'integer', example: 0 },
            addedAt: { type: 'string', format: 'date-time', nullable: true },
          },
        },
        Playlist: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid', example: '01935678-1234-7890-abcd-1234567890ab' },
            name: { type: 'string', example: 'My Trap Beats' },
            description: { type: 'string', nullable: true },
            isPublic: { type: 'boolean', example: false },
            itemCount: { type: 'integer', example: 3 },
            items: { type: 'array', items: { $ref: '#/components/schemas/PlaylistItem' } },
            createdAt: { type: 'string', format: 'date-time', nullable: true },
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
      { name: 'Dashboard', description: 'Producer earnings and sales analytics (PRODUCER/ADMIN only)' },
      { name: 'Downloads', description: 'Signed download URLs for purchased beats' },
      { name: 'Playlists', description: 'User playlist management' },
    ],
    paths: {},
  },
  apis: [
    './src/modules/**/routes.ts',
    './dist/modules/**/routes.js',
  ],
});
