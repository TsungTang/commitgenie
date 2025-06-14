import { test, expect } from 'bun:test';
import { getLLMConfig } from '../src/config/llmConfig';

const originalProvider = process.env.LLM_PROVIDER;
const originalOpenAIKey = process.env.OPENAI_API_KEY;
const originalOpenAIModel = process.env.OPENAI_MODEL;

test('getLLMConfig returns values from environment variables', () => {
  process.env.LLM_PROVIDER = 'openai';
  process.env.OPENAI_API_KEY = 'test-key';
  process.env.OPENAI_MODEL = 'gpt-test';
  const config = getLLMConfig();
  expect(config.provider).toBe('openai');
  expect(config.apiKey).toBe('test-key');
  expect(config.model).toBe('gpt-test');
});

test('getLLMConfig throws when API key is missing', () => {
  process.env.LLM_PROVIDER = 'openai';
  delete process.env.OPENAI_API_KEY;
  delete process.env.OPENAI_MODEL;
  expect(() => getLLMConfig()).toThrow();
});

// restore environment
process.env.LLM_PROVIDER = originalProvider;
process.env.OPENAI_API_KEY = originalOpenAIKey;
process.env.OPENAI_MODEL = originalOpenAIModel;
