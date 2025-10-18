// Lightweight logger wrapper: use pino on Node (server) when available, otherwise fallback to console.
// This keeps Edge/browser compatibility: Edge/browser will use console methods.

import type { Logger as PinoLogger, LoggerOptions } from "pino";

let pinoLogger: PinoLogger | null = null;
const isBrowser = typeof window !== "undefined";

// Only try to load pino in non-browser environments. Use require to avoid bundlers
// statically including pino in client/edge builds.
if (!isBrowser) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const pino: typeof import("pino") = require("pino");

    const opts: LoggerOptions = {
      level: (process.env.LOG_LEVEL as any) || "info",
      // prettyPrint is deprecated in newer pino versions; use transport when available.
      // Keep a simple, permissive config where non-production prints nicer output.
      transport:
        process.env.NODE_ENV !== "production"
          ? { target: "pino-pretty", options: { colorize: true } }
          : undefined,
      // include pid and hostname by default is fine
    };

    // Support both CJS and ESM interop: require('pino') may return the function directly
    const createPino = (pino as any).default || (pino as any);
    pinoLogger = createPino(opts) as PinoLogger;
  } catch (err) {
    // It's fine if pino or pino-pretty isn't available in certain runtimes (Edge)
    // We'll fall back to console below.
    pinoLogger = null;
  }
}

function normalizeArgsForPino(args: any[]): any[] {
  // If first argument is an Error, prefer pino's error logging signature: logger.error(err, message)
  if (args.length === 1 && args[0] instanceof Error) return [args[0]];

  if (args.length >= 2 && args[0] instanceof Error && typeof args[1] === "string") {
    return [args[0], args.slice(1).join(" ")];
  }

  // If first arg is a plain object, pass-through so pino can encode structured data.
  if (args.length >= 1 && typeof args[0] === "object" && !(args[0] instanceof Error)) {
    return args;
  }

  // Otherwise, join arguments into a single message string
  return [args.map((a) => (typeof a === "string" ? a : safeStringify(a))).join(" ")];
}

function safeStringify(v: any): string {
  try {
    if (typeof v === "string") return v;
    if (v === undefined) return "undefined";
    return JSON.stringify(v);
  } catch (e) {
    return String(v);
  }
}

function callLogger(method: keyof PinoLogger | string, ...args: any[]): void {
  if (pinoLogger && typeof (pinoLogger as any)[method] === "function") {
    try {
      const normalized = normalizeArgsForPino(args);
      (pinoLogger as any)[method](...normalized);
    } catch (e) {
      // fallback to console if pino logging throws
      // eslint-disable-next-line no-console
      (console as any)[method](...args);
    }
  } else {
    // Browser or edge fallback: use console with best-effort formatting.
    // eslint-disable-next-line no-console
    if ((console as any)[method]) {
      (console as any)[method](...args);
    } else {
      // If method missing on console, default to log
      // eslint-disable-next-line no-console
      console.log(...args);
    }
  }
}

// Public logger surface similar to console/pino
export const logger = {
  info: (...args: any[]): void => { callLogger("info", ...args); },
  warn: (...args: any[]): void => { callLogger("warn", ...args); },
  error: (...args: any[]): void => { callLogger("error", ...args); },
  debug: (...args: any[]): void => { callLogger("debug", ...args); },
  trace: (...args: any[]): void => { callLogger("trace", ...args); },
  child: (bindings: Record<string, any>) => {
    if (pinoLogger && typeof pinoLogger.child === "function") {
      try {
        const childLogger = (pinoLogger as any).child(bindings);
        return {
          info: (...args: any[]): void => childLogger.info(...normalizeArgsForPino(args)),
          warn: (...args: any[]): void => childLogger.warn(...normalizeArgsForPino(args)),
          error: (...args: any[]): void => childLogger.error(...normalizeArgsForPino(args)),
          debug: (...args: any[]): void => childLogger.debug(...normalizeArgsForPino(args)),
          trace: (...args: any[]): void => childLogger.trace(...normalizeArgsForPino(args)),
        } as PinoLogger;
      } catch (e) {
        // fallback to root logger below
      }
    }

    // If no pino child available, return a console-backed child-like wrapper
    return {
      info: (...args: any[]): void => { callLogger("info", { ...bindings }, ...args); },
      warn: (...args: any[]): void => { callLogger("warn", { ...bindings }, ...args); },
      error: (...args: any[]): void => { callLogger("error", { ...bindings }, ...args); },
      debug: (...args: any[]): void => { callLogger("debug", { ...bindings }, ...args); },
      trace: (...args: any[]): void => { callLogger("trace", { ...bindings }, ...args); },
    } as unknown as PinoLogger;
  },
};

export type Logger = typeof logger;

export default logger;

