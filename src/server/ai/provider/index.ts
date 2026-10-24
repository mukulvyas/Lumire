import { LLMProvider } from './types';
import { GeminiProvider } from './gemini';
import { MockLLMProvider } from './mock';
import { env } from '@/lib/env';

export * from './types';

export function getLLMProvider(): LLMProvider {
  if (env.LLM_PROVIDER === 'mock' || !env.GEMINI_API_KEY) {
    return new MockLLMProvider();
  }

  return new GeminiProvider();
}
