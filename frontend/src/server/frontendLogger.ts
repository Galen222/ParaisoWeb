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
type LogTarget = "consola" | "archivo";

const LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

const DEFAULT_MAX_BYTES = 10 * 1024 * 1024;
const DEFAULT_BACKUP_COUNT = 10;
const LOG_FILENAME = "frontend.log";
const LOG_CONTROL_CHARACTERS = /[\u0000-\u001f\u007f-\u009f\u2028\u2029]+/g;
const configuredLogDirectory = process.env.FRONTEND_LOG_DIR?.trim();
const LOG_DIRECTORY = configuredLogDirectory
  ? path.resolve(/* turbopackIgnore: true */ configuredLogDirectory)
  : path.resolve(/* turbopackIgnore: true */ process.cwd(), "..", "logs");
const LOG_PATH = path.join(LOG_DIRECTORY, LOG_FILENAME);
let reportedWriteFailure = false;

const parsePositiveInteger = (value: string | undefined, fallback: number): number => {
  const normalized = value?.trim();
  if (!normalized || !/^\d+$/.test(normalized)) {
    return fallback;
  }

  const parsed = Number(normalized);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : fallback;
};

const configuredTarget = (): LogTarget => {
  const candidate = process.env.FRONTEND_LOG_TARGET?.trim().toLowerCase();
  return candidate === "archivo" ? "archivo" : "consola";
};

const configuredLevel = (): LogLevel => {
  const candidate = process.env.FRONTEND_LOG_LEVEL?.trim().toLowerCase();
  return candidate && candidate in LEVEL_PRIORITY ? (candidate as LogLevel) : "info";
};

const sanitizeLogValue = (value: string): string =>
  value.replace(LOG_CONTROL_CHARACTERS, " ").replace(/\s+/g, " ").trim();

const formatValue = (value: unknown): string => {
  let formattedValue: string;
  if (typeof value === "string") {
    formattedValue = value;
  } else if (value instanceof Error) {
    formattedValue = value.stack || `${value.name}: ${value.message}`;
  } else {
    formattedValue = inspect(value, {
      breakLength: Number.POSITIVE_INFINITY,
      compact: true,
      depth: 5,
      maxArrayLength: 50,
    });
  }

  // Cada llamada debe ocupar una sola línea para que datos externos no puedan
  // falsificar entradas adicionales ni romper el formato del archivo.
  return sanitizeLogValue(formattedValue);
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

const writeFileLog = (level: LogLevel, values: unknown[]): void => {
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
  if (LEVEL_PRIORITY[level] < LEVEL_PRIORITY[configuredLevel()]) {
    return;
  }

  if (configuredTarget() === "consola") {
    const method = level === "warn" ? console.warn : level === "error" ? console.error : level === "debug" ? console.debug : console.info;
    method(...values);
    return;
  }

  writeFileLog(level, values);
};

/** Logger exclusivo del proceso servidor de Next.js. No debe importarse desde componentes cliente. */
export const frontendLogger: AppLogger = {
  debug: (...values: unknown[]): void => writeLog("debug", values),
  info: (...values: unknown[]): void => writeLog("info", values),
  warn: (...values: unknown[]): void => writeLog("warn", values),
  error: (...values: unknown[]): void => writeLog("error", values),
};
