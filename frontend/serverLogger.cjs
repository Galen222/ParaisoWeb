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
const LOG_CONTROL_CHARACTERS = /[\u0000-\u001f\u007f-\u009f\u2028\u2029]+/g;
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

function sanitizeLogValue(value) {
  return value.replace(LOG_CONTROL_CHARACTERS, " ").replace(/\s+/g, " ").trim();
}

/** Recorta por puntos de código para no partir una secuencia UTF-8 ni escribir �. */
function truncateUtf8(value, maxBytes) {
  if (maxBytes <= 0) return "";
  if (Buffer.byteLength(value, "utf8") <= maxBytes) return value;

  const suffix = "…";
  const suffixBytes = Buffer.byteLength(suffix, "utf8");
  const contentBudget = Math.max(0, maxBytes - suffixBytes);
  let truncated = "";
  let usedBytes = 0;

  for (const character of value) {
    const characterBytes = Buffer.byteLength(character, "utf8");
    if (usedBytes + characterBytes > contentBudget) break;
    truncated += character;
    usedBytes += characterBytes;
  }

  return suffixBytes <= maxBytes ? `${truncated}${suffix}` : truncated;
}

function buildBoundedLogLine(level, values, maxBytes) {
  const lineBody = `${new Date().toISOString()} | ${level.toUpperCase()} | ${values.map(formatValue).join(" ")}`;
  // appendFileSync escribe un salto de línea de un byte. Incluso una sola entrada
  // sobredimensionada debe respetar el límite configurado del archivo.
  return `${truncateUtf8(lineBody, Math.max(0, maxBytes - 1))}\n`;
}

function formatValue(value) {
  let formattedValue;
  if (typeof value === "string") formattedValue = value;
  else if (value instanceof Error) formattedValue = value.stack || `${value.name}: ${value.message}`;
  else {
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
  const maxBytes = parsePositiveInteger(
    process.env.FRONTEND_LOG_MAX_BYTES,
    DEFAULT_MAX_BYTES,
  );
  const backupCount = parsePositiveInteger(
    process.env.FRONTEND_LOG_BACKUP_COUNT,
    DEFAULT_BACKUP_COUNT,
  );
  const line = buildBoundedLogLine(level, values, maxBytes);
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
