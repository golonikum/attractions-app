import { z } from 'zod';

export interface StructuredRequest<T> {
  system: string;
  user: string;
  schema: z.ZodType<T>;
  maxTokens?: number;
}

export interface LlmProvider {
  generateStructured<T>(request: StructuredRequest<T>): Promise<T>;
}

export class AutofillRefusalError extends Error {}

export class AutofillServiceError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}
