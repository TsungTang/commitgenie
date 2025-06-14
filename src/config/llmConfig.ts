import fs from 'fs';
import path from 'path';
import os from 'os';
import dotenv from 'dotenv';

// Load environment variables from .env.local if present
dotenv.config({ path: path.join(process.cwd(), '.env.local'), override: true });

const configFilePath = path.join(os.homedir(), '.commitgenie_config.json');

export type Provider = 'openai' | 'anthropic' | 'google';

interface LLMConfig {
  provider: Provider;
  apiKey: string;
  model: string;
}

const DEFAULT_MODELS: Record<Provider, string> = {
  openai: 'gpt-4o-mini',
  anthropic: 'claude-3-haiku-20240307',
  google: 'gemini-pro'
};

export const getLLMConfig = (): LLMConfig => {
  let envProvider = process.env.LLM_PROVIDER as Provider | undefined;
  let provider: Provider = 'openai';
  let apiKey = '';
  let model = '';
  let fileConfig: any = {};

  if (fs.existsSync(configFilePath)) {
    try {
      fileConfig = JSON.parse(fs.readFileSync(configFilePath, 'utf-8'));
    } catch (error) {
      console.error('Error reading config file:', error);
    }
  }

  provider = (envProvider || fileConfig.provider || provider) as Provider;

  const envApiKeyMap: Record<Provider, string | undefined> = {
    openai: process.env.OPENAI_API_KEY,
    anthropic: process.env.ANTHROPIC_API_KEY,
    google: process.env.GOOGLE_API_KEY
  };

  const envModelMap: Record<Provider, string | undefined> = {
    openai: process.env.OPENAI_MODEL,
    anthropic: process.env.ANTHROPIC_MODEL,
    google: process.env.GOOGLE_MODEL
  };

  apiKey =
    envApiKeyMap[provider] ||
    fileConfig[`${provider}ApiKey`] ||
    fileConfig.apiKey ||
    '';

  model =
    envModelMap[provider] ||
    fileConfig[`${provider}Model`] ||
    fileConfig.model ||
    DEFAULT_MODELS[provider];

  if (!apiKey) {
    throw new Error(
      `${provider} API key is not set. Provide it via the ${provider.toUpperCase()}_API_KEY environment variable or save it using the config command.`
    );
  }

  return { provider, apiKey, model };
};
