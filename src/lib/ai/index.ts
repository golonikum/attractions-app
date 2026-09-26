import { createClaudeProvider } from './providers/claude';
import { createYandexGptProvider } from './providers/yandexGpt';

import { AutofillServiceError, LlmProvider } from './types';

const providerFactories: Record<string, () => LlmProvider> = {
  yandex: createYandexGptProvider,
  claude: createClaudeProvider,
};

let provider: LlmProvider | undefined;

/** Движок ИИ выбирается переменной окружения AI_PROVIDER (yandex | claude), по умолчанию yandex */
export const getLlmProvider = () => {
  if (!provider) {
    const name = process.env.AI_PROVIDER || 'yandex';
    const factory = providerFactories[name];

    if (!factory) {
      throw new AutofillServiceError(`Неизвестный AI_PROVIDER: ${name}`, 500);
    }

    provider = factory();
  }

  return provider;
};

export * from './types';
