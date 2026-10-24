import { getLLMProvider } from '../provider';
import { EventBriefSchema, EventBrief } from '../schemas/eventBrief';
import { INTAKE_SYSTEM_PROMPT, buildIntakeUserPrompt } from '../prompts/intake';

export async function runIntakePipeline(userInput: string): Promise<EventBrief> {
  const provider = getLLMProvider();
  const todayStr = new Date().toISOString().split('T')[0];
  const userPrompt = buildIntakeUserPrompt(userInput, todayStr);

  const brief = await provider.generateStructured(
    EventBriefSchema,
    INTAKE_SYSTEM_PROMPT,
    userPrompt,
    { temperature: 0.1 }
  );

  return brief;
}
