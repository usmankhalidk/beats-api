/**
 * Generate a Postman v2.1 collection from the OpenAPI spec.
 * Run: `npm run postman:generate` — outputs to ./docs/postman-collection.json
 */
import fs from 'node:fs';
import path from 'node:path';
import { openapiSpec } from '../src/shared/swagger/openapi';

interface PostmanItem {
  name: string;
  request: {
    method: string;
    header: Array<{ key: string; value: string; type: string }>;
    url: { raw: string; host: string[]; path: string[] };
    body?: { mode: string; raw: string; options: { raw: { language: string } } };
  };
}

interface PostmanFolder {
  name: string;
  item: PostmanItem[];
}

interface PostmanCollection {
  info: { name: string; schema: string; _postman_id: string };
  auth: { type: 'bearer'; bearer: Array<{ key: string; value: string; type: string }> };
  variable: Array<{ key: string; value: string }>;
  item: PostmanFolder[];
}

const spec = openapiSpec as {
  info?: { title?: string; version?: string };
  paths?: Record<string, Record<string, { tags?: string[]; summary?: string; requestBody?: unknown }>>;
};

const folders = new Map<string, PostmanFolder>();

const paths = spec.paths ?? {};
for (const [route, methods] of Object.entries(paths)) {
  for (const [method, def] of Object.entries(methods)) {
    if (!['get', 'post', 'put', 'patch', 'delete'].includes(method.toLowerCase())) continue;
    const tag = def.tags?.[0] ?? 'Default';
    if (!folders.has(tag)) folders.set(tag, { name: tag, item: [] });

    const segments = route.replace(/^\//, '').split('/');
    folders.get(tag)!.item.push({
      name: def.summary ?? `${method.toUpperCase()} ${route}`,
      request: {
        method: method.toUpperCase(),
        header: [{ key: 'Content-Type', value: 'application/json', type: 'text' }],
        url: {
          raw: `{{baseUrl}}${route}`,
          host: ['{{baseUrl}}'],
          path: segments,
        },
        ...(def.requestBody
          ? {
              body: {
                mode: 'raw',
                raw: '{}',
                options: { raw: { language: 'json' } },
              },
            }
          : {}),
      },
    });
  }
}

const collection: PostmanCollection = {
  info: {
    name: spec.info?.title ?? 'Beats API',
    _postman_id: '00000000-0000-0000-0000-000000000000',
    schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
  },
  auth: {
    type: 'bearer',
    bearer: [{ key: 'token', value: '{{accessToken}}', type: 'string' }],
  },
  variable: [
    { key: 'baseUrl', value: 'http://localhost:4000/api/v1' },
    { key: 'accessToken', value: '' },
  ],
  item: Array.from(folders.values()),
};

const outDir = path.resolve(__dirname, '..', 'docs');
fs.mkdirSync(outDir, { recursive: true });
const outFile = path.join(outDir, 'postman-collection.json');
fs.writeFileSync(outFile, JSON.stringify(collection, null, 2));
console.log(`[postman] Wrote ${outFile} (${collection.item.length} folders)`);
