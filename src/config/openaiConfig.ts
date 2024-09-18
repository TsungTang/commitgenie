import fs from 'fs';
import path from 'path';
import os from 'os';

const configFilePath = path.join(os.homedir(), '.commitgenie_config.json');

export const getOpenAIConfig = () => {
  let apiKey = '';
  let model = 'gpt-4o-mini'; // default model

  // if config file exists, read config
  if (fs.existsSync(configFilePath)) {
    try {
      const config = JSON.parse(fs.readFileSync(configFilePath, 'utf-8'));
      apiKey = config.apiKey || apiKey;
      model = config.model || model;
    } catch (error) {
      console.error('Error reading config file:', error);
    }
  }

  if (!apiKey) {
    throw new Error(
      'OpenAI API key is not set. Please set it in your environment variables or configuration file.'
    );
  }

  return { apiKey, model };
};
