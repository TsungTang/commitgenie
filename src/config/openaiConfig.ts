import fs from 'fs';
import path from 'path';
import os from 'os';
import dotenv from 'dotenv';

// Load environment variables from .env.local if present
dotenv.config({ path: path.join(process.cwd(), '.env.local'), override: true });

const configFilePath = path.join(os.homedir(), '.commitgenie_config.json');

export const getOpenAIConfig = () => {
  const envApiKey = process.env.OPENAI_API_KEY;
  const envModel = process.env.OPENAI_MODEL;

  let apiKey = envApiKey || '';
  let model = envModel || 'gpt-4o-mini'; // default model

  if (fs.existsSync(configFilePath)) {
    try {
      const config = JSON.parse(fs.readFileSync(configFilePath, 'utf-8'));
      if (!apiKey) apiKey = config.apiKey || '';
      if (!envModel) model = config.model || model;
    } catch (error) {
      console.error('Error reading config file:', error);
    }
  }

  if (!apiKey) {
    throw new Error(
      'OpenAI API key is not set. Provide it via the OPENAI_API_KEY environment variable or save it using the config command.'
    );
  }

  return { apiKey, model };
};
