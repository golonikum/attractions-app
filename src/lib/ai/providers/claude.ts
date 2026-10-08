import Anthropic from '@anthropic-ai/sdk';
import { betaZodOutputFormat } from '@anthropic-ai/sdk/helpers/beta/zod';

import { extractJson } from '../extractJson';
import { AutofillRefusalError, AutofillServiceError, LlmProvider, StructuredRequest } from '../types';

const DEFAULT_MODEL = 'claude-opus-5';

const toServiceError = (error: unknown) => {
  if (error instanceof Anthropic.RateLimitError) {
    return new AutofillServiceError(`Claude: ${error.message}`, 429);
  }

  if (error instanceof Anthropic.APIConnectionError) {
    return new AutofillServiceError(`Claude: сетевая ошибка ${error.message}`, 504);
  }

  if (error instanceof Anthropic.APIError) {
    return new AutofillServiceError(`Claude: ${error.status} ${error.message}`, error.status ?? 502);
  }

  return new AutofillServiceError(`Claude: ${error instanceof Error ? error.message : String(error)}`, 500);
};

export const createClaudeProvider = (): LlmProvider => {
  const client = new Anthropic();
  const model = process.env.ANTHROPIC_MODEL || DEFAULT_MODEL;

  return {
    async generateStructured<T>({ system, user, schema, maxTokens = 4000 }: StructuredRequest<T>): Promise<T> {
      let response;

      // create, а не parse: parse требует, чтобы текст был ровно одним JSON, и падает, если модель
      // дописала что-то после него. Разбираем сами через extractJson и проверяем zod-схемой
      try {
        response = await client.beta.messages.create({
          model,
          max_tokens: maxTokens,
          betas: ['server-side-fallback-2026-07-01'],
          fallbacks: 'default',
          output_config: {
            effort: 'low',
            format: betaZodOutputFormat(schema),
          },
          system,
          messages: [{ role: 'user', content: user }],
        });
      } catch (error) {
        throw toServiceError(error);
      }

      if (response.stop_reason === 'refusal') {
        throw new AutofillRefusalError(`Claude отказался отвечать: ${response.stop_details?.category ?? 'unknown'}`);
      }

      const text =
        response.content.find((block): block is Anthropic.Beta.BetaTextBlock => block.type === 'text')?.text ?? '';
      const meta = `model: ${response.model}, stop_reason: ${response.stop_reason}`;

      let parsed: { value: unknown; rest: string };

      try {
        parsed = extractJson(text);
      } catch (error) {
        throw new AutofillRefusalError(`Ответ Claude не JSON (${meta}): ${error}\n${text.slice(-500)}`);
      }

      if (parsed.rest) {
        console.warn(`Claude дописал текст после JSON (${meta}): ${parsed.rest.slice(0, 300)}`);
      }

      const result = schema.safeParse(parsed.value);

      if (!result.success) {
        const reason = result.error.issues.map(({ path, message }) => `${path.join('.')}: ${message}`).join('; ');

        throw new AutofillRefusalError(`Ответ Claude не соответствует схеме (${meta}): ${reason}`);
      }

      return result.data;
    },
  };
};
