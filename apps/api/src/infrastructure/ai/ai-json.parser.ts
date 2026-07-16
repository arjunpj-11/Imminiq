import { z } from 'zod';

import { dependencyFailure } from '../../shared/errors/service.error';

// ============================================================
// JSON PARSER HELPER
// ============================================================

export const parseAIJson = <T>(
  response: string,
  schema: z.ZodSchema<T>,
  options: { logErrors?: boolean } = {}
): T => {
  const logErrors = options.logErrors ?? true;
  const normalizedResponse = response.replace(/^\uFEFF/, '').trim();

  let jsonContent: string;

  try {
    jsonContent = extractFirstJsonValue(normalizedResponse);
  } catch (error) {
    if (logErrors) {
      console.error('AI JSON extraction failed:', {
        responseLength: normalizedResponse.length,
        responsePreview: normalizedResponse.slice(0, 500),
        error,
      });
    }

    throw dependencyFailure('AI returned invalid JSON', 'AI_INVALID_JSON');
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(jsonContent);
  } catch (error) {
    if (logErrors) {
      console.error('AI JSON parse failed:', {
        jsonLength: jsonContent.length,
        errorContext: getJsonErrorContext(jsonContent, error),
        error,
      });
    }

    throw dependencyFailure('AI returned malformed JSON', 'AI_INVALID_JSON');
  }

  const validationResult = schema.safeParse(parsed);

  if (!validationResult.success) {
    if (logErrors) {
      console.error('AI JSON schema validation failed:', {
        issues: validationResult.error.issues,
        jsonPreview: jsonContent.slice(0, 500),
      });
    }

    throw dependencyFailure(
      'AI returned JSON with an invalid structure',
      'AI_INVALID_JSON_STRUCTURE'
    );
  }

  return validationResult.data;
};

// ============================================================
// INTERNAL HELPERS
// ============================================================

const extractFirstJsonValue = (response: string): string => {
  const startIndex = findJsonStart(response);

  if (startIndex === -1) {
    throw new Error('AI response does not contain a JSON object or array');
  }

  const expectedClosingCharacters: string[] = [];

  let insideString = false;
  let escaped = false;

  for (let index = startIndex; index < response.length; index += 1) {
    const character = response[index];

    if (insideString) {
      if (escaped) {
        escaped = false;
        continue;
      }

      if (character === '\\') {
        escaped = true;
        continue;
      }

      if (character === '"') {
        insideString = false;
      }

      continue;
    }

    if (character === '"') {
      insideString = true;
      continue;
    }

    if (character === '{') {
      expectedClosingCharacters.push('}');
      continue;
    }

    if (character === '[') {
      expectedClosingCharacters.push(']');
      continue;
    }

    if (character !== '}' && character !== ']') {
      continue;
    }

    const expectedCharacter = expectedClosingCharacters.pop();

    if (character !== expectedCharacter) {
      throw new Error(
        `Malformed JSON: expected "${expectedCharacter ?? 'nothing'}" but received "${character}"`
      );
    }

    if (expectedClosingCharacters.length === 0) {
      const endIndex = index + 1;
      const trailingContent = response.slice(endIndex).trim();

      if (trailingContent.length > 0 && trailingContent !== '```') {
        console.warn('AI response contained trailing content after JSON:', {
          trailingLength: trailingContent.length,
          trailingPreview: trailingContent.slice(0, 500),
        });
      }

      return response.slice(startIndex, endIndex);
    }
  }

  throw new Error('AI response contains incomplete or truncated JSON');
};

const findJsonStart = (response: string): number => {
  const objectStartIndex = response.indexOf('{');
  const arrayStartIndex = response.indexOf('[');

  if (objectStartIndex === -1) {
    return arrayStartIndex;
  }

  if (arrayStartIndex === -1) {
    return objectStartIndex;
  }

  return Math.min(objectStartIndex, arrayStartIndex);
};

const getJsonErrorContext = (content: string, error: unknown): string => {
  if (!(error instanceof SyntaxError)) {
    return content.slice(0, 500);
  }

  const positionMatch = error.message.match(/position\s+(\d+)/i);

  if (!positionMatch) {
    return content.slice(0, 500);
  }

  const position = Number(positionMatch[1]);
  const contextSize = 200;

  const startIndex = Math.max(0, position - contextSize);

  const endIndex = Math.min(content.length, position + contextSize);

  return content.slice(startIndex, endIndex);
};
