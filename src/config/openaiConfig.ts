import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import os from 'os';

dotenv.config({ path: path.join(__dirname, '..', '..', '.env.local') });

const configFilePath = path.join(os.homedir(), '.commitgenie_config.json');

let apiKey = process.env.OPENAI_API_KEY || ''; // Use .env.local for development
let model = 'gpt-4o-mini'; // Default model

// Load configuration if it exists
if (fs.existsSync(configFilePath)) {
  const config = JSON.parse(fs.readFileSync(configFilePath, 'utf-8'));
  apiKey = config.apiKey || apiKey;
  model = config.model || model;
}

export const getOpenAIConfig = () => ({
  apiKey,
  model
});
