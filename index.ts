import * as dotenv from 'dotenv';
import { createProbot } from 'probot';
import { readFileSync } from 'fs';

import robot from './src/robot';

// Allow use of .env
dotenv.config();

// Create Probot App
const probot = createProbot({
  id: Number(process.env.APP_ID),
  secret: process.env.WEBHOOK_SECRET,
  port: Number(process.env.APP_PORT),
  webhookProxy: process.env.WEBHOOK_PROXY_URL,
  cert: readFileSync('private_key.pem') as any,
});

// Set up with robot listener
probot.setup([robot]);
probot.start();
