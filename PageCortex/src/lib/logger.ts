// ─── PageCortex Structured Logger ─────────────────────────────
// JSON in production (compatible with Vercel Log Drains / Datadog).
// Coloured console output in development.

type Level = 'info' | 'warn' | 'error' | 'debug';
type Category = 'api' | 'chat' | 'crawl' | 'billing' | 'webhook' | 'usage' | 'auth' | 'admin' | 'cache';

interface LogEntry {
    timestamp: string;
    level: Level;
    category: Category;
    message: string;
    durationMs?: number;
    data?: Record<string, unknown>;
}

type OptionalMeta = { durationMs?: number; [key: string]: unknown };

const IS_PROD = process.env.NODE_ENV === 'production';

const DEV_COLORS: Record<Level, string> = {
    info:  '\x1b[36m',  // cyan
    warn:  '\x1b[33m',  // yellow
    error: '\x1b[31m',  // red
    debug: '\x1b[90m',  // grey
};

function emit(level: Level, category: Category, message: string, meta?: OptionalMeta) {
    const { durationMs, ...rest } = meta || {};
    const data = Object.keys(rest).length > 0 ? rest as Record<string, unknown> : undefined;

    const entry: LogEntry = {
        timestamp: new Date().toISOString(),
        level,
        category,
        message,
        ...(durationMs !== undefined && { durationMs }),
        ...(data && { data }),
    };

    if (IS_PROD) {
        // Structured JSON — readable by Vercel log drains
        const fn = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;
        fn(JSON.stringify(entry));
    } else {
        const color = DEV_COLORS[level];
        const reset = '\x1b[0m';
        const tag = `${color}[${level.toUpperCase().padEnd(5)}]${reset}`;
        const cat = `\x1b[2m[${category}]${reset}`;
        const dur = durationMs !== undefined ? ` \x1b[90m${durationMs}ms${reset}` : '';
        const fn = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;
        fn(`${tag} ${cat} ${message}${dur}`, data ? data : '');
    }
}

// ─── Timer helper for API latency tracking ────────────────
export function startTimer(): () => number {
    const start = Date.now();
    return () => Date.now() - start;
}

// ─── Public logger API ────────────────────────────────────
export const logger = {
    info:  (cat: Category, msg: string, meta?: OptionalMeta) => emit('info',  cat, msg, meta),
    warn:  (cat: Category, msg: string, meta?: OptionalMeta) => emit('warn',  cat, msg, meta),
    error: (cat: Category, msg: string, meta?: OptionalMeta) => emit('error', cat, msg, meta),
    debug: (cat: Category, msg: string, meta?: OptionalMeta) => emit('debug', cat, msg, meta),
};
