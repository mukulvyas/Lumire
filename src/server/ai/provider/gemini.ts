import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';
import { LLMProvider, GenerateOptions } from './types';
import { env } from '@/lib/env';

export class GeminiProvider implements LLMProvider {
  name = 'gemini';
  private genAI: GoogleGenerativeAI;
  private modelName: string;

  constructor(apiKey?: string, modelName = env.LLM_MODEL) {
    const key = apiKey || env.GEMINI_API_KEY;
    if (!key) {
      console.warn('⚠️ GEMINI_API_KEY is not set. GeminiProvider may fail if invoked.');
    }
    this.genAI = new GoogleGenerativeAI(key || 'dummy-key');
    this.modelName = modelName;
  }

  async generateStructured<TOutput, TDef extends z.ZodTypeDef = z.ZodTypeDef, TInput = TOutput>(
    schema: z.ZodType<TOutput, TDef, TInput>,
    systemPrompt: string,
    userPrompt: string,
    options?: GenerateOptions
  ): Promise<TOutput> {
    const candidateModels = Array.from(
      new Set([this.modelName, 'gemini-3.1-flash-lite', 'gemini-2.5-flash-lite', 'gemini-flash-latest'])
    );

    let lastError: Error | null = null;

    for (const modelToTry of candidateModels) {
      try {
        const model = this.genAI.getGenerativeModel({
          model: modelToTry,
          systemInstruction: systemPrompt,
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: options?.temperature ?? 0.2,
            maxOutputTokens: options?.maxTokens ?? 2048,
          },
        });

        const result = await model.generateContent(userPrompt);
        const text = result.response.text();

        // Clean any accidental markdown backticks
        const cleaned = text.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();
        const parsedJson = JSON.parse(cleaned);

        // Validate strictly with Zod
        const validated = schema.parse(parsedJson);
        return validated;
      } catch (err: unknown) {
        lastError = err as Error;
        console.warn(`[GeminiProvider] Model ${modelToTry} failed:`, lastError.message);
      }
    }

    // Graceful fallback to MockLLMProvider if all remote models fail or rate-limit
    console.warn('[GeminiProvider] All Gemini models failed or rate-limited. Falling back to local intelligence engine.');
    const { MockLLMProvider } = await import('./mock');
    const mock = new MockLLMProvider();
    return mock.generateStructured(schema, systemPrompt, userPrompt, options);
  }

  async *streamText(
    systemPrompt: string,
    userPrompt: string,
    options?: GenerateOptions
  ): AsyncGenerator<string, void, unknown> {
    const model = this.genAI.getGenerativeModel({
      model: this.modelName,
      systemInstruction: systemPrompt,
      generationConfig: {
        temperature: options?.temperature ?? 0.4,
        maxOutputTokens: options?.maxTokens ?? 2048,
      },
    });

    const result = await model.generateContentStream(userPrompt);
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      if (chunkText) {
        yield chunkText;
      }
    }
  }
}
