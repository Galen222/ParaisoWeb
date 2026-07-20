import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(currentDirectory, "../..");

export function resolveBackendPython({
  rootDirectory = projectRoot,
  environment = process.env,
  fileExists = existsSync,
} = {}) {
  const configuredPython = environment.PARAISOWEB_PYTHON?.trim();
  if (configuredPython) {
    return configuredPython;
  }

  const virtualEnvironmentCandidates = [
    path.join(rootDirectory, "backend", ".venv", "Scripts", "python.exe"),
    path.join(rootDirectory, "backend", ".venv", "bin", "python"),
  ];

  return virtualEnvironmentCandidates.find((candidate) => fileExists(candidate)) ?? "python";
}

function runPython(pythonExecutable, argumentsList, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(pythonExecutable, argumentsList, {
      cwd: projectRoot,
      stdio: "inherit",
      ...options,
    });

    child.once("error", reject);
    child.once("exit", (code, signal) => {
      if (signal) {
        reject(new Error(`El proceso de pruebas backend terminó por la señal ${signal}.`));
        return;
      }
      resolve(code ?? 1);
    });
  });
}

async function main() {
  const pythonExecutable = resolveBackendPython();
  const dependencyCheck = [
    "-c",
    "import aiomysql, aiosmtplib, filetype, fastapi, sqlalchemy",
  ];

  let dependencyExitCode;
  try {
    dependencyExitCode = await runPython(pythonExecutable, dependencyCheck, { stdio: "ignore" });
  } catch (error) {
    console.error(`No se pudo ejecutar el intérprete Python: ${pythonExecutable}`);
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
    return;
  }

  if (dependencyExitCode !== 0) {
    console.error(
      `El intérprete ${pythonExecutable} no tiene instaladas las dependencias del backend.`,
    );
    console.error(
      `Ejecuta: "${pythonExecutable}" -m pip install -r backend/requirements.txt`,
    );
    process.exitCode = dependencyExitCode;
    return;
  }

  try {
    process.exitCode = await runPython(pythonExecutable, [
      "-m",
      "backend.tests.run_all_tests",
    ]);
  } catch (error) {
    console.error(`No se pudieron ejecutar las pruebas backend con ${pythonExecutable}.`);
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : "";
if (invokedPath === fileURLToPath(import.meta.url)) {
  await main();
}
