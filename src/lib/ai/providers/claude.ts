import Anthropic from '@anthropic-ai/sdk';
import { betaZodOutputFormat } from '@anthropic-ai/sdk/helpers/beta/zod';

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

      try {
        response = await client.beta.messages.parse({
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

      if (!response.parsed_output) {
        throw new AutofillRefusalError(`Ответ Claude не соответствует схеме (stop_reason: ${response.stop_reason})`);
      }

      return response.parsed_output as T;
    },
  };
};
