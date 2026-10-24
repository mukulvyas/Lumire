import { z } from 'zod';

export interface GenerateOptions {
  temperature?: number;
  maxTokens?: number;
}

export interface LLMProvider {
  name: string;
  generateStructured<TOutput, TDef extends z.ZodTypeDef = z.ZodTypeDef, TInput = TOutput>(
    schema: z.ZodType<TOutput, TDef, TInput>,
    systemPrompt: string,
    userPrompt: string,
    options?: GenerateOptions
  ): Promise<TOutput>;

  streamText(
    systemPrompt: string,
    userPrompt: string,
    options?: GenerateOptions
  ): AsyncGenerator<string, void, unknown>;
}
