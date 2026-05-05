import { config } from 'dotenv';
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';

const env = process.env.NODE_ENV || 'development';
const envFile = `.env.${env}.local`;

if (!existsSync(envFile)) {
  console.error(`[prisma] env file not found: ${envFile}`);
  process.exit(1);
}

config({ path: envFile });
console.log(`[prisma] loaded ${envFile} (NODE_ENV=${env})`);

const child = spawn('npx', ['prisma', ...process.argv.slice(2)], {
  stdio: 'inherit',
  shell: true,
  env: process.env,
});

child.on('exit', (code) => process.exit(code ?? 0));
