import { createProbot } from 'probot';
import * as dotenv from 'dotenv';
import robot from "./src/robot";
import { readFileSync } from 'fs';

dotenv.config();

// Set up Probot App
const probot = createProbot({
	id: Number(process.env.APP_ID),
	secret: process.env.WEBHOOK_SECRET,
	port: Number(process.env.APP_PORT),
	webhookProxy: process.env.WEBHOOK_PROXY_URL,
	cert: readFileSync('private_key.pem') as any
});

// 
probot.setup([robot]);
probot.start();
