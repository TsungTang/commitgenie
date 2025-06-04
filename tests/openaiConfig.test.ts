import { test, expect } from 'bun:test';
import { getOpenAIConfig } from '../src/config/openaiConfig';

const originalApiKey = process.env.OPENAI_API_KEY;
const originalModel = process.env.OPENAI_MODEL;

test('getOpenAIConfig returns values from environment variables', () => {
  process.env.OPENAI_API_KEY = 'test-key';
  process.env.OPENAI_MODEL = 'gpt-test';
  const config = getOpenAIConfig();
  expect(config.apiKey).toBe('test-key');
  expect(config.model).toBe('gpt-test');
});

test('getOpenAIConfig throws when API key is missing', () => {
  delete process.env.OPENAI_API_KEY;
  delete process.env.OPENAI_MODEL;
  expect(() => getOpenAIConfig()).toThrow();
});

// restore environment
process.env.OPENAI_API_KEY = originalApiKey;
process.env.OPENAI_MODEL = originalModel;
