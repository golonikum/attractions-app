/**
 * Достаёт первое целое JSON-значение (объект или массив) из ответа модели.
 * Модели иногда оборачивают JSON в ```json ... ``` или дописывают после него текст/второй объект,
 * из-за чего JSON.parse всего ответа падает. Возвращает { value, rest }, где rest — всё, что шло после JSON.
 */
export const extractJson = (text: string): { value: unknown; rest: string } => {
  try {
    return { value: JSON.parse(text), rest: '' };
  } catch {
    // ниже — разбор с поиском границ
  }

  const start = text.search(/[{[]/);

  if (start === -1) {
    throw new SyntaxError('В ответе нет JSON');
  }

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = start; i < text.length; i++) {
    const char = text[i];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === '\\') {
        escaped = true;
      } else if (char === '"') {
        inString = false;
      }
    } else if (char === '"') {
      inString = true;
    } else if (char === '{' || char === '[') {
      depth++;
    } else if (char === '}' || char === ']') {
      depth--;

      if (depth === 0) {
        return { value: JSON.parse(text.slice(start, i + 1)), rest: text.slice(i + 1).trim() };
      }
    }
  }

  throw new SyntaxError('JSON в ответе не закончен — вероятно, ответ обрезан по длине');
};
