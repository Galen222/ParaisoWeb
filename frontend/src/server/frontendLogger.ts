import {
  appendFileSync,
  existsSync,
  mkdirSync,
  renameSync,
  statSync,
  unlinkSync,
} from "node:fs";
import path from "node:path";
import { inspect } from "node:util";

import type { AppLogger } from "../logging/appLogger";

type LogLevel = "debug" | "info" | "warn" | "error";

const LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

const DEFAULT_MAX_BYTES = 10 * 1024 * 1024;
const DEFAULT_BACKUP_COUNT = 10;
const LOG_FILENAME = "frontend.log";
const LOG_DIRECTORY = path.join(/* turbopackIgnore: true */ process.cwd(), "logs");
const LOG_PATH = path.join(LOG_DIRECTORY, LOG_FILENAME);
let reportedWriteFailure = false;

const parsePositiveInteger = (value: string | undefined, fallback: number): number => {
  if (!value) {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : fallback;
};

const configuredLevel = (): LogLevel => {
  const candidate = process.env.FRONTEND_LOG_LEVEL?.toLowerCase();
  return candidate && candidate in LEVEL_PRIORITY ? (candidate as LogLevel) : "info";
};

const formatValue = (value: unknown): string => {
  if (typeof value === "string") {
    return value;
  }
  if (value instanceof Error) {
    return value.stack || `${value.name}: ${value.message}`;
  }

  return inspect(value, {
    breakLength: Number.POSITIVE_INFINITY,
    compact: true,
    depth: 5,
    maxArrayLength: 50,
  });
};

const rotateLogFile = (logPath: string, maxBytes: number, backupCount: number, incomingBytes: number): void => {
  if (!existsSync(/* turbopackIgnore: true */ logPath) || statSync(/* turbopackIgnore: true */ logPath).size + incomingBytes <= maxBytes) {
    return;
  }

  const oldestBackup = `${logPath}.${backupCount}`;
  if (existsSync(/* turbopackIgnore: true */ oldestBackup)) {
    unlinkSync(/* turbopackIgnore: true */ oldestBackup);
  }

  for (let index = backupCount - 1; index >= 1; index -= 1) {
    const source = `${logPath}.${index}`;
    if (existsSync(/* turbopackIgnore: true */ source)) {
      renameSync(/* turbopackIgnore: true */ source, `${logPath}.${index + 1}`);
    }
  }

  renameSync(/* turbopackIgnore: true */ logPath, `${logPath}.1`);
};

const writeProductionLog = (level: LogLevel, values: unknown[]): void => {
  if (LEVEL_PRIORITY[level] < LEVEL_PRIORITY[configuredLevel()]) {
    return;
  }

  const line = `${new Date().toISOString()} | ${level.toUpperCase()} | ${values.map(formatValue).join(" ")}\n`;
  const maxBytes = parsePositiveInteger(process.env.FRONTEND_LOG_MAX_BYTES, DEFAULT_MAX_BYTES);
  const backupCount = parsePositiveInteger(
    process.env.FRONTEND_LOG_BACKUP_COUNT,
    DEFAULT_BACKUP_COUNT
  );

  try {
    mkdirSync(/* turbopackIgnore: true */ LOG_DIRECTORY, { recursive: true });
    rotateLogFile(LOG_PATH, maxBytes, backupCount, Buffer.byteLength(line, "utf8"));
    appendFileSync(/* turbopackIgnore: true */ LOG_PATH, line, { encoding: "utf8" });
    reportedWriteFailure = false;
  } catch (error: unknown) {
    // Si el destino no puede abrirse, se informa una sola vez por stderr. Ocultarlo
    // por completo dejaría el proceso sin ninguna pista sobre permisos o disco lleno.
    if (!reportedWriteFailure) {
      reportedWriteFailure = true;
      const detail = error instanceof Error ? error.message : "error desconocido";
      process.stderr.write(`No se pudo escribir ${LOG_FILENAME}: ${detail}\n`);
    }
  }
};

const writeLog = (level: LogLevel, values: unknown[]): void => {
  if (process.env.NODE_ENV !== "production") {
    const method = level === "warn" ? console.warn : level === "error" ? console.error : level === "debug" ? console.debug : console.info;
    method(...values);
    return;
  }

  writeProductionLog(level, values);
};

/** Logger exclusivo del proceso servidor de Next.js. No debe importarse desde componentes cliente. */
export const frontendLogger: AppLogger = {
  debug: (...values: unknown[]): void => writeLog("debug", values),
  info: (...values: unknown[]): void => writeLog("info", values),
  warn: (...values: unknown[]): void => writeLog("warn", values),
  error: (...values: unknown[]): void => writeLog("error", values),
};
