// apps/api/src/infrastructure/compiler/piston.service.ts

import { ApiError } from '../../shared/utils/ApiError';

type PistonRuntime = {
  language: string;
  version: string;
  aliases?: string[];
  runtime?: string;
};

type PistonRunResult = {
  stdout?: string;
  stderr?: string;
  code?: number | null;
  signal?: string | null;
  output?: string;
};

type PistonExecuteResponse = {
  language?: string;
  version?: string;
  run?: PistonRunResult;
  message?: string;
  error?: string;
};

export type ExecuteCodeInput = {
  sourceCode: string;
  languageId?: number;
  language?: string;
  stdin?: string;
};

export type ExecuteCodeResult = {
  stdout: string;
  stderr: string;
  compileOutput: string;
  message: string;
  status: {
    id: number;
    description: string;
  };
  time?: string | null;
  memory?: number | null;
};

const getPistonBaseUrl = () => {
  return (process.env.PISTON_API_URL?.trim() || 'https://emkc.org/api/v2/piston').replace(
    /\/$/,
    ''
  );
};

const getPistonHeaders = () => {
  const apiKey = process.env.PISTON_API_KEY?.trim();

  const headers: Record<string, string> = {
    'content-type': 'application/json',
  };

  if (apiKey) {
    headers.authorization = `Bearer ${apiKey}`;
  }

  return headers;
};

// FIX: added `extends object` constraint so T is compatible with { raw?: string }
const parseJsonResponse = async <T extends object>(
  response: Response
): Promise<T & { raw?: string }> => {
  const text = await response.text();

  try {
    return text ? (JSON.parse(text) as T) : ({} as T);
  } catch {
    return {
      raw: text,
    } as T & { raw?: string };
  }
};

const languageIdToPistonLanguage = (languageId?: number) => {
  switch (languageId) {
    case 63:
      return 'javascript';
    case 74:
      return 'typescript';
    case 71:
      return 'python';
    case 62:
      return 'java';
    case 54:
      return 'cpp';
    case 50:
      return 'c';
    default:
      return 'javascript';
  }
};

const normalizeLanguage = (language?: string, languageId?: number) => {
  const raw = (language || '').toLowerCase().trim();

  if (!raw) return languageIdToPistonLanguage(languageId);

  if (raw.includes('javascript') || raw.includes('node') || raw === 'js') {
    return 'javascript';
  }

  if (raw.includes('typescript') || raw === 'ts') {
    return 'typescript';
  }

  if (raw.includes('python') || raw === 'py') {
    return 'python';
  }

  if (raw.includes('java')) return 'java';

  if (raw.includes('c++') || raw.includes('cpp') || raw === 'cxx') {
    return 'cpp';
  }

  if (raw === 'c') return 'c';
  if (raw.includes('c#') || raw.includes('csharp')) return 'csharp';
  if (raw.includes('go') || raw === 'golang') return 'go';
  if (raw.includes('rust')) return 'rust';
  if (raw.includes('php')) return 'php';
  if (raw.includes('ruby')) return 'ruby';
  if (raw.includes('kotlin')) return 'kotlin';
  if (raw.includes('swift')) return 'swift';

  return raw;
};

let runtimeCache: PistonRuntime[] | null = null;
let runtimeCacheAt = 0;

const getRuntimes = async () => {
  const now = Date.now();

  if (runtimeCache && now - runtimeCacheAt < 1000 * 60 * 10) {
    return runtimeCache;
  }

  const baseUrl = getPistonBaseUrl();

  const response = await fetch(`${baseUrl}/runtimes`, {
    method: 'GET',
    headers: getPistonHeaders(),
  });

  const data = await parseJsonResponse<PistonRuntime[]>(response);

  if (!response.ok || !Array.isArray(data)) {
    throw new ApiError(
      502,
      data?.raw ||
        'Could not fetch Piston runtimes. Public Piston may require authorization or self-hosting.',
      'PISTON_RUNTIMES_FAILED'
    );
  }

  runtimeCache = data;
  runtimeCacheAt = now;

  return data;
};

const findRuntime = async (language: string) => {
  const runtimes = await getRuntimes();
  const target = language.toLowerCase();

  const directMatch = runtimes.find((runtime) => {
    return runtime.language.toLowerCase() === target;
  });

  if (directMatch) return directMatch;

  const aliasMatch = runtimes.find((runtime) => {
    return (runtime.aliases || []).some((alias) => alias.toLowerCase() === target);
  });

  if (aliasMatch) return aliasMatch;

  const softMatch = runtimes.find((runtime) => {
    const runtimeText = [runtime.language, runtime.runtime || '', ...(runtime.aliases || [])]
      .join(' ')
      .toLowerCase();

    return runtimeText.includes(target) || target.includes(runtimeText);
  });

  if (softMatch) return softMatch;

  throw new ApiError(
    400,
    `Language "${language}" is not available in Piston runtimes`,
    'PISTON_LANGUAGE_NOT_AVAILABLE'
  );
};

export const executeCodeWithPiston = async ({
  sourceCode,
  language,
  languageId,
  stdin = '',
}: ExecuteCodeInput): Promise<ExecuteCodeResult> => {
  if (!sourceCode?.trim()) {
    throw new ApiError(400, 'Source code is required', 'SOURCE_CODE_REQUIRED');
  }

  const pistonLanguage = normalizeLanguage(language, languageId);
  const runtime = await findRuntime(pistonLanguage);
  const baseUrl = getPistonBaseUrl();

  console.log('Piston execute request:', {
    baseUrl,
    requestedLanguage: language,
    languageId,
    pistonLanguage,
    runtime: runtime.language,
    version: runtime.version,
    hasSourceCode: Boolean(sourceCode.trim()),
    sourceCodePreview: sourceCode.slice(0, 100),
  });

  const response = await fetch(`${baseUrl}/execute`, {
    method: 'POST',
    headers: getPistonHeaders(),
    body: JSON.stringify({
      language: runtime.language,
      version: runtime.version,
      files: [
        {
          name: 'main',
          content: sourceCode,
        },
      ],
      stdin,
    }),
  });

  const data = await parseJsonResponse<PistonExecuteResponse>(response);

  console.error('Piston execute response:', {
    status: response.status,
    ok: response.ok,
    data,
  });

  if (!response.ok) {
    throw new ApiError(
      502,
      data.message || data.error || data.raw || 'Piston code execution failed',
      'PISTON_EXECUTION_FAILED'
    );
  }

  const run = data.run;

  if (!run) {
    throw new ApiError(
      502,
      data.message || data.error || data.raw || 'Piston returned an invalid response',
      'PISTON_INVALID_RESPONSE'
    );
  }

  const hasRuntimeError = Boolean(run.stderr);
  const exitCode = typeof run.code === 'number' ? run.code : 0;

  return {
    stdout: run.stdout || '',
    stderr: run.stderr || '',
    compileOutput: '',
    message: run.output || '',
    status: {
      id: exitCode === 0 && !hasRuntimeError ? 3 : 6,
      description: exitCode === 0 && !hasRuntimeError ? 'Accepted' : 'Runtime Error',
    },
    time: null,
    memory: null,
  };
};
