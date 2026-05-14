/**
 * Generates a full Postman v2.1 collection directly from route/schema knowledge.
 * Does NOT depend on swagger-jsdoc or JSDoc annotations.
 * Run: `npm run postman:generate` — outputs to ./beats-api.postman_collection.json
 */
import fs from 'node:fs';
import path from 'node:path';

// ── helpers ────────────────────────────────────────────────────────────────────

function json(body: object) {
  return { mode: 'raw' as const, raw: JSON.stringify(body, null, 2), options: { raw: { language: 'json' } } };
}

function formdata(fields: Array<{ key: string; type: 'text' | 'file'; value?: string; description?: string }>) {
  return { mode: 'formdata' as const, formdata: fields };
}

function url(path: string, query?: Array<{ key: string; value: string | null; description?: string; disabled?: boolean }>) {
  const segments = path.replace(/^\//, '').split('/');
  const raw = query?.length
    ? `{{baseUrl}}${path}?${query.filter(q => !q.disabled && q.value !== null).map(q => `${q.key}=${q.value}`).join('&')}`
    : `{{baseUrl}}${path}`;
  return { raw, host: ['{{baseUrl}}'], path: segments, ...(query ? { query } : {}) };
}

function script(...lines: string[]) {
  return [{ listen: 'test', script: { exec: lines, type: 'text/javascript' } }];
}

// ── collection ─────────────────────────────────────────────────────────────────

const collection = {
  info: {
    name: 'Beats API',
    schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
    description: 'Beats API collection. Start with Auth module.',
  },
  auth: {
    type: 'bearer',
    bearer: [{ key: 'token', value: '{{accessToken}}', type: 'string' }],
  },
  variable: [
    { key: 'baseUrl', value: 'http://localhost:4000/api/v1', type: 'string' },
    { key: 'accessToken', value: '', type: 'string' },
    { key: 'refreshToken', value: '', type: 'string' },
    { key: 'resetToken', value: '', type: 'string' },
    { key: 'beatId', value: '', type: 'string' },
    { key: 'cartItemId', value: '', type: 'string' },
    { key: 'orderId', value: '', type: 'string' },
    { key: 'playlistId', value: '', type: 'string' },
    { key: 'purchaseId', value: '', type: 'string' },
  ],
  item: [
    // ── Auth ──────────────────────────────────────────────────────────────────
    {
      name: 'Auth',
      item: [
        {
          name: 'Register',
          event: script(
            'if (pm.response.code === 201) {',
            '  const body = pm.response.json();',
            "  pm.collectionVariables.set('accessToken', body.data.tokens.accessToken);",
            "  pm.collectionVariables.set('refreshToken', body.data.tokens.refreshToken);",
            '}',
          ),
          request: {
            auth: { type: 'noauth' },
            method: 'POST',
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: json({ firstName: 'John', lastName: 'Doe', userName: 'johndoe', email: 'john.doe@example.com', password: 'Password123!', role: 'user' }),
            url: url('/auth/register'),
            description: 'Register a new user. Auto-saves accessToken and refreshToken on success.',
          },
          response: [],
        },
        {
          name: 'Login',
          event: script(
            'if (pm.response.code === 200) {',
            '  const body = pm.response.json();',
            "  pm.collectionVariables.set('accessToken', body.data.tokens.accessToken);",
            "  pm.collectionVariables.set('refreshToken', body.data.tokens.refreshToken);",
            '}',
          ),
          request: {
            auth: { type: 'noauth' },
            method: 'POST',
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: json({ email: 'john.doe@example.com', password: 'Password123!' }),
            url: url('/auth/login'),
            description: 'Login with email and password. Auto-saves tokens on success.',
          },
          response: [],
        },
        {
          name: 'Logout',
          event: script(
            'if (pm.response.code === 200) {',
            "  pm.collectionVariables.set('accessToken', '');",
            "  pm.collectionVariables.set('refreshToken', '');",
            '}',
          ),
          request: {
            auth: { type: 'noauth' },
            method: 'POST',
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: json({ refreshToken: '{{refreshToken}}' }),
            url: url('/auth/logout'),
            description: 'Logout by invalidating the refresh token. Clears stored tokens on success.',
          },
          response: [],
        },
        {
          name: 'Refresh Token',
          event: script(
            'if (pm.response.code === 200) {',
            '  const body = pm.response.json();',
            "  pm.collectionVariables.set('accessToken', body.data.accessToken);",
            "  pm.collectionVariables.set('refreshToken', body.data.refreshToken);",
            '}',
          ),
          request: {
            auth: { type: 'noauth' },
            method: 'POST',
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: json({ refreshToken: '{{refreshToken}}' }),
            url: url('/auth/refresh-token'),
            description: 'Exchange a refresh token for a new access/refresh token pair (token rotation).',
          },
          response: [],
        },
        {
          name: 'Forgot Password',
          event: script(
            'if (pm.response.code === 200) {',
            '  const body = pm.response.json();',
            '  if (body.data && body.data.resetToken) {',
            "    pm.collectionVariables.set('resetToken', body.data.resetToken);",
            "    console.log('Reset token saved:', body.data.resetToken);",
            '  }',
            '}',
          ),
          request: {
            auth: { type: 'noauth' },
            method: 'POST',
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: json({ email: 'john.doe@example.com' }),
            url: url('/auth/forgot-password'),
            description: 'Request a password reset. In dev/test mode the token is returned in the response.',
          },
          response: [],
        },
        {
          name: 'Reset Password',
          event: script(
            'if (pm.response.code === 200) {',
            "  pm.collectionVariables.set('resetToken', '');",
            "  pm.collectionVariables.set('accessToken', '');",
            "  pm.collectionVariables.set('refreshToken', '');",
            '}',
          ),
          request: {
            auth: { type: 'noauth' },
            method: 'POST',
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: json({ email: 'john.doe@example.com', token: '{{resetToken}}', password: 'NewPassword123!' }),
            url: url('/auth/reset-password'),
            description: 'Reset password. Revokes all sessions — login again afterwards.',
          },
          response: [],
        },
        {
          name: 'Change Password',
          event: script(
            'if (pm.response.code === 200) {',
            '  const body = pm.response.json();',
            '  if (body.data && body.data.tokens) {',
            "    pm.collectionVariables.set('accessToken', body.data.tokens.accessToken);",
            "    pm.collectionVariables.set('refreshToken', body.data.tokens.refreshToken);",
            '  }',
            '}',
          ),
          request: {
            method: 'POST',
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: json({ currentPassword: 'Password123!', newPassword: 'NewPassword456!' }),
            url: url('/auth/change-password'),
            description:
              'Change password for the authenticated user. Revokes every other session and issues a fresh token pair (auto-saved) so this device stays signed in.',
          },
          response: [],
        },
      ],
    },

    // ── User ──────────────────────────────────────────────────────────────────
    {
      name: 'User',
      item: [
        {
          name: 'Get Profile',
          request: {
            method: 'GET',
            header: [],
            url: url('/user/profile'),
            description: 'Get the authenticated user\'s profile.',
          },
          response: [],
        },
        {
          name: 'Update Profile',
          request: {
            method: 'PUT',
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: json({ firstName: 'John', lastName: 'Doe', userName: 'johndoe', profileHeading: 'Producer & Beatmaker', profileDescription: 'NYC-based producer.', profileContactEmail: 'contact@johndoe.com' }),
            url: url('/user/profile'),
            description: 'Update profile fields. At least one field is required.',
          },
          response: [],
        },
        {
          name: 'Upload Avatar',
          request: {
            method: 'PUT',
            header: [],
            body: formdata([
              { key: 'avatar', type: 'file', description: 'JPEG, PNG, WebP, or GIF — max 5 MB' },
            ]),
            url: url('/user/profile/avatar'),
            description: 'Upload a profile avatar via multipart/form-data. Field name must be "avatar". Returns updated profile with new avatar URL.',
          },
          response: [],
        },
      ],
    },

    // ── Beats ─────────────────────────────────────────────────────────────────
    {
      name: 'Beats',
      item: [
        {
          name: 'List Beats',
          request: {
            method: 'GET',
            header: [],
            url: url('/beats', [
              { key: 'page', value: '1' },
              { key: 'limit', value: '20' },
              { key: 'sort', value: 'newest', description: 'newest | oldest | priceAsc | priceDesc | bpmAsc | bpmDesc' },
            ]),
            description: 'Paginated list of all published beats.',
          },
          response: [],
        },
        {
          name: 'Get Beat',
          request: {
            method: 'GET',
            header: [],
            url: url('/beats/{{beatId}}'),
            description: 'Single beat detail by numeric ID.',
          },
          response: [],
        },
        {
          name: 'Search Beats',
          request: {
            method: 'GET',
            header: [],
            url: url('/beats/search', [
              { key: 'q', value: 'trap', description: 'Search in title, description, tags' },
              { key: 'bpm', value: null, disabled: true, description: 'Exact BPM match' },
              { key: 'tag', value: null, disabled: true, description: 'Tag contains search' },
              { key: 'sort', value: 'newest', description: 'newest | oldest | priceAsc | priceDesc | bpmAsc | bpmDesc' },
              { key: 'page', value: '1' },
              { key: 'limit', value: '20' },
            ]),
            description: 'Full-text search across beat title, description, and tags. At least one of q, bpm, or tag is required.',
          },
          response: [],
        },
        {
          name: 'Filter Beats',
          request: {
            method: 'GET',
            header: [],
            url: url('/beats/filter', [
              { key: 'category', value: null, disabled: true, description: 'Category slug' },
              { key: 'subCategory', value: null, disabled: true, description: 'Sub-category slug' },
              { key: 'priceMin', value: null, disabled: true, description: 'Min regularPrice' },
              { key: 'priceMax', value: null, disabled: true, description: 'Max regularPrice' },
              { key: 'isFree', value: null, disabled: true, description: 'true | false' },
              { key: 'sort', value: 'newest' },
              { key: 'page', value: '1' },
              { key: 'limit', value: '20' },
            ]),
            description: 'Filter beats by category, sub-category, price range, or free flag.',
          },
          response: [],
        },
        {
          name: 'Featured Beats',
          request: {
            method: 'GET',
            header: [],
            url: url('/beats/featured', [
              { key: 'page', value: '1' },
              { key: 'limit', value: '20' },
            ]),
            description: 'Beats marked as featured.',
          },
          response: [],
        },
        {
          name: 'Free Beats',
          request: {
            method: 'GET',
            header: [],
            url: url('/beats/free', [
              { key: 'page', value: '1' },
              { key: 'limit', value: '20' },
            ]),
            description: 'Beats available for free.',
          },
          response: [],
        },
        {
          name: 'Create Beat',
          request: {
            method: 'POST',
            header: [],
            body: formdata([
              { key: 'beatFile', type: 'file', description: 'Audio file (MP3, WAV, FLAC, AAC) — max 100 MB. Required.' },
              { key: 'coverImage', type: 'file', description: 'Cover image (JPEG, PNG, WebP, GIF) — max 5 MB. Optional.' },
              { key: 'title', type: 'text', value: 'Dark Trap' },
              { key: 'description', type: 'text', value: 'Hard-hitting 808s' },
              { key: 'bpm', type: 'text', value: '140' },
              { key: 'musicKey', type: 'text', value: 'Am' },
              { key: 'regularPrice', type: 'text', value: '29.99' },
              { key: 'extendedPrice', type: 'text', value: '99.99' },
              { key: 'isFree', type: 'text', value: 'false' },
              { key: 'tags', type: 'text', value: 'trap,dark,808', description: 'Comma-separated or JSON array' },
              { key: 'categoryId', type: 'text', value: '1' },
            ]),
            url: url('/beats'),
            description: 'Upload a new beat as multipart/form-data. beatFile (audio) is required. Requires PRODUCER or ADMIN role.',
          },
          response: [],
        },
        {
          name: 'Update Beat',
          request: {
            method: 'PUT',
            header: [],
            body: formdata([
              { key: 'beatFile', type: 'file', description: 'Audio file (MP3, WAV, FLAC, AAC) — max 100 MB. Omit to keep existing.' },
              { key: 'coverImage', type: 'file', description: 'Cover image (JPEG, PNG, WebP, GIF) — max 5 MB. Omit to keep existing.' },
              { key: 'title', type: 'text', value: 'Dark Trap v2' },
              { key: 'description', type: 'text', value: 'Updated version' },
              { key: 'bpm', type: 'text', value: '140' },
              { key: 'regularPrice', type: 'text', value: '29.99' },
              { key: 'extendedPrice', type: 'text', value: '99.99' },
              { key: 'isFree', type: 'text', value: 'false' },
              { key: 'tags', type: 'text', value: 'trap,dark' },
              { key: 'categoryId', type: 'text', value: '1' },
            ]),
            url: url('/beats/{{beatId}}'),
            description: 'Update a beat by ID as multipart/form-data. Files are optional — omit to keep existing. Requires PRODUCER or ADMIN role.',
          },
          response: [],
        },
        {
          name: 'Delete Beat',
          request: {
            method: 'DELETE',
            header: [],
            url: url('/beats/{{beatId}}'),
            description: 'Delete a beat by ID. Requires PRODUCER or ADMIN role.',
          },
          response: [],
        },
      ],
    },

    // ── Categories ────────────────────────────────────────────────────────────
    {
      name: 'Categories',
      item: [
        {
          name: 'List Categories',
          request: {
            method: 'GET',
            header: [],
            url: url('/categories'),
            description: 'All genres/categories ordered by name.',
          },
          response: [],
        },
        {
          name: 'Beats by Category',
          request: {
            method: 'GET',
            header: [],
            url: url('/categories/hip-hop/beats', [
              { key: 'page', value: '1' },
              { key: 'limit', value: '20' },
              { key: 'sort', value: 'newest' },
            ]),
            description: 'Paginated beats for a specific category identified by its slug.',
          },
          response: [],
        },
      ],
    },

    // ── Cart ──────────────────────────────────────────────────────────────────
    {
      name: 'Cart',
      item: [
        {
          name: 'Get Cart',
          request: {
            method: 'GET',
            header: [],
            url: url('/cart'),
            description: 'Get the authenticated user\'s cart with beat details.',
          },
          response: [],
        },
        {
          name: 'Add to Cart',
          request: {
            method: 'POST',
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: json({ beatId: '{{beatId}}', licenseType: 'regular' }),
            url: url('/cart/add'),
            description: 'Add a beat to the cart. licenseType: regular | extended.',
          },
          response: [],
        },
        {
          name: 'Remove from Cart',
          request: {
            method: 'DELETE',
            header: [],
            url: url('/cart/remove/{{cartItemId}}'),
            description: 'Remove a cart item by its numeric ID.',
          },
          response: [],
        },
      ],
    },

    // ── Checkout ──────────────────────────────────────────────────────────────
    {
      name: 'Checkout',
      item: [
        {
          name: 'Checkout',
          request: {
            method: 'POST',
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: json({ cartItemIds: ['{{cartItemId}}'] }),
            url: url('/checkout'),
            description: 'Initiate checkout. Run POST /orders/validate first. Returns 501 until a payment provider is integrated.',
          },
          response: [],
        },
      ],
    },

    // ── Dashboard ─────────────────────────────────────────────────────────────
    {
      name: 'Dashboard',
      item: [
        {
          name: 'Get Earnings',
          request: {
            method: 'GET',
            header: [],
            url: url('/dashboard/earnings', [
              { key: 'from', value: null, disabled: true, description: 'ISO 8601 date-time, e.g. 2025-01-01T00:00:00Z' },
              { key: 'to', value: null, disabled: true, description: 'ISO 8601 date-time' },
              { key: 'page', value: '1' },
              { key: 'limit', value: '20' },
            ]),
            description: 'Producer earnings per sale with total amount in meta. Requires PRODUCER or ADMIN role.',
          },
          response: [],
        },
        {
          name: 'Get Sales',
          request: {
            method: 'GET',
            header: [],
            url: url('/dashboard/sales', [
              { key: 'from', value: null, disabled: true, description: 'ISO 8601 date-time' },
              { key: 'to', value: null, disabled: true, description: 'ISO 8601 date-time' },
              { key: 'page', value: '1' },
              { key: 'limit', value: '20' },
            ]),
            description: 'Paginated list of individual beat sales for the producer. Requires PRODUCER or ADMIN role.',
          },
          response: [],
        },
      ],
    },

    // ── Downloads ─────────────────────────────────────────────────────────────
    {
      name: 'Downloads',
      item: [
        {
          name: 'Get Download URL',
          request: {
            method: 'GET',
            header: [],
            url: url('/downloads/{{purchaseId}}'),
            description: 'Get a pre-signed S3 download URL for a purchased beat. The `id` is the purchase ID (purchases.id), not the beat ID. URL is valid for 1 hour.',
          },
          response: [],
        },
      ],
    },

    // ── Playlists ─────────────────────────────────────────────────────────────
    {
      name: 'Playlists',
      item: [
        {
          name: 'List Playlists',
          request: {
            method: 'GET',
            header: [],
            url: url('/playlists'),
            description: "List the authenticated user's playlists with full item details ordered by position.",
          },
          response: [],
        },
        {
          name: 'Create Playlist',
          request: {
            method: 'POST',
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: json({ name: 'My Trap Beats', description: 'Best trap beats of 2025', isPublic: false }),
            url: url('/playlists'),
            description: 'Create a new playlist.',
          },
          response: [],
        },
        {
          name: 'Add Beat to Playlist',
          request: {
            method: 'POST',
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: json({ beatId: '{{beatId}}' }),
            url: url('/playlists/{{playlistId}}/add'),
            description: 'Add a published beat to a playlist. Returns 409 if beat is already in the playlist.',
          },
          response: [],
        },
        {
          name: 'Remove Beat from Playlist',
          request: {
            method: 'DELETE',
            header: [],
            url: url('/playlists/{{playlistId}}/remove/{{beatId}}'),
            description: 'Remove a beat from a playlist by playlist ID and beat ID.',
          },
          response: [],
        },
      ],
    },

    // ── Favorites ─────────────────────────────────────────────────────────────
    {
      name: 'Favorites',
      item: [
        {
          name: 'List Favorites',
          request: {
            method: 'GET',
            header: [],
            url: url('/favorites'),
            description: "List the authenticated user's favorited beats. Each item is a full beat with a `favoritedAt` timestamp. Newest first.",
          },
          response: [],
        },
        {
          name: 'Add to Favorites',
          request: {
            method: 'POST',
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: json({ beatId: '{{beatId}}' }),
            url: url('/favorites/add'),
            description: 'Add a published beat to favorites. Returns 409 if the beat is already favorited.',
          },
          response: [],
        },
        {
          name: 'Remove from Favorites',
          request: {
            method: 'DELETE',
            header: [],
            url: url('/favorites/remove/{{beatId}}'),
            description: 'Remove a beat from favorites by beat ID. Returns 404 if not in favorites.',
          },
          response: [],
        },
      ],
    },

    // ── Orders ────────────────────────────────────────────────────────────────
    {
      name: 'Orders',
      item: [
        {
          name: 'List Orders',
          request: {
            method: 'GET',
            header: [],
            url: url('/orders', [
              { key: 'status', value: null, disabled: true, description: 'pending | paid | failed | cancelled' },
              { key: 'page', value: '1' },
              { key: 'limit', value: '20' },
            ]),
            description: 'Paginated purchase history for the authenticated user.',
          },
          response: [],
        },
        {
          name: 'Validate Order',
          request: {
            method: 'POST',
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: json({ cartItemIds: ['{{cartItemId}}'] }),
            url: url('/orders/validate'),
            description: 'Pre-checkout validation. Checks beats are published, purchasable, and not already owned. Returns { ok, issues }.',
          },
          response: [],
        },
        {
          name: 'Get Order',
          request: {
            method: 'GET',
            header: [],
            url: url('/orders/{{orderId}}'),
            description: 'Get a single order (transaction) by its numeric ID.',
          },
          response: [],
        },
      ],
    },
  ],
};

// ── write ──────────────────────────────────────────────────────────────────────

const outFile = path.resolve(__dirname, '..', 'beats-api.postman_collection.json');
fs.writeFileSync(outFile, JSON.stringify(collection, null, 2));
console.log(`[postman] Wrote ${outFile}`);
console.log(`[postman] Folders: ${collection.item.map(f => `${f.name} (${f.item.length})`).join(', ')}`);
