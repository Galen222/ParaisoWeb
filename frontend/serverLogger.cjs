"use strict";

const {
  appendFileSync,
  existsSync,
  mkdirSync,
  renameSync,
  statSync,
  unlinkSync,
} = require("node:fs");
const path = require("node:path");
const { inspect } = require("node:util");

const LEVEL_PRIORITY = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};
const DEFAULT_MAX_BYTES = 10 * 1024 * 1024;
const DEFAULT_BACKUP_COUNT = 10;
const LOG_FILENAME = "frontend.log";
let reportedWriteFailure = false;

function parsePositiveInteger(value, fallback) {
  const normalized = typeof value === "string" ? value.trim() : "";
  if (!/^\d+$/.test(normalized)) return fallback;

  const parsed = Number(normalized);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function configuredTarget() {
  const candidate = process.env.FRONTEND_LOG_TARGET?.trim().toLowerCase();
  return candidate === "archivo" ? "archivo" : "consola";
}

function configuredLevel() {
  const candidate = process.env.FRONTEND_LOG_LEVEL?.trim().toLowerCase();
  return candidate && Object.hasOwn(LEVEL_PRIORITY, candidate) ? candidate : "info";
}

function configuredLogPath() {
  const configuredDirectory = process.env.FRONTEND_LOG_DIR?.trim();
  const directory = configuredDirectory
    ? path.resolve(configuredDirectory)
    : path.resolve(process.cwd(), "..", "logs");
  return { directory, logPath: path.join(directory, LOG_FILENAME) };
}

function formatValue(value) {
  if (typeof value === "string") return value;
  if (value instanceof Error) return value.stack || `${value.name}: ${value.message}`;

  return inspect(value, {
    breakLength: Number.POSITIVE_INFINITY,
    compact: true,
    depth: 5,
    maxArrayLength: 50,
  });
}

function rotateLogFile(logPath, maxBytes, backupCount, incomingBytes) {
  if (!existsSync(logPath) || statSync(logPath).size + incomingBytes <= maxBytes) return;

  const oldestBackup = `${logPath}.${backupCount}`;
  if (existsSync(oldestBackup)) unlinkSync(oldestBackup);

  for (let index = backupCount - 1; index >= 1; index -= 1) {
    const source = `${logPath}.${index}`;
    if (existsSync(source)) renameSync(source, `${logPath}.${index + 1}`);
  }

  renameSync(logPath, `${logPath}.1`);
}

function writeFileLog(level, values) {
  const line = `${new Date().toISOString()} | ${level.toUpperCase()} | ${values.map(formatValue).join(" ")}\n`;
  const maxBytes = parsePositiveInteger(
    process.env.FRONTEND_LOG_MAX_BYTES,
    DEFAULT_MAX_BYTES,
  );
  const backupCount = parsePositiveInteger(
    process.env.FRONTEND_LOG_BACKUP_COUNT,
    DEFAULT_BACKUP_COUNT,
  );
  const { directory, logPath } = configuredLogPath();

  try {
    mkdirSync(directory, { recursive: true });
    rotateLogFile(logPath, maxBytes, backupCount, Buffer.byteLength(line, "utf8"));
    appendFileSync(logPath, line, { encoding: "utf8" });
    reportedWriteFailure = false;
  } catch (error) {
    // Si el destino no puede abrirse, se informa una sola vez por stderr. Ocultarlo
    // por completo dejaría el proceso sin ninguna pista sobre permisos o disco lleno.
    if (!reportedWriteFailure) {
      reportedWriteFailure = true;
      const detail = error instanceof Error ? error.message : "error desconocido";
      process.stderr.write(`No se pudo escribir ${LOG_FILENAME}: ${detail}\n`);
    }
  }
}

function writeLog(level, values) {
  if (LEVEL_PRIORITY[level] < LEVEL_PRIORITY[configuredLevel()]) return;

  if (configuredTarget() === "consola") {
    const method = level === "warn"
      ? console.warn
      : level === "error"
        ? console.error
        : level === "debug"
          ? console.debug
          : console.info;
    method(...values);
    return;
  }

  writeFileLog(level, values);
}

/** Logger del proceso Node que arranca Next.js desde server.cjs o app.js. */
const frontendServerLogger = {
  debug: (...values) => writeLog("debug", values),
  info: (...values) => writeLog("info", values),
  warn: (...values) => writeLog("warn", values),
  error: (...values) => writeLog("error", values),
};

module.exports = {
  frontendServerLogger,
  parsePositiveInteger,
};
