import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

const readSource = (relativePath) =>
  readFile(new URL(relativePath, import.meta.url), "utf8");

test("el CAPTCHA aparece debajo del consentimiento y bloquea el envío sin token", async () => {
  const [form, validation, service] = await Promise.all([
    readSource("../src/components/Form.tsx"),
    readSource("../src/utils/contactFormValidation.ts"),
    readSource("../src/services/formService.ts"),
  ]);

  const checkboxPosition = form.indexOf('id="privacyCheck"');
  const captchaPosition = form.indexOf("<Captcha");
  const submitPosition = form.indexOf('type="submit"');

  assert.ok(checkboxPosition >= 0);
  assert.ok(captchaPosition > checkboxPosition);
  assert.ok(submitPosition > captchaPosition);
  assert.match(form, /formData\.captchaToken !== ""/);
  assert.match(validation, /isCaptchaVerified[\s\S]*?&&\s+isCaptchaVerified/);
  assert.match(service, /formData\.append\("captcha_token", data\.captchaToken\)/);
});

test("reCAPTCHA se carga una sola vez con nonce CSP y conserva el idioma inicial", async () => {
  const [captcha, loader, proxy] = await Promise.all([
    readSource("../src/components/Captcha.tsx"),
    readSource("../src/utils/recaptchaLoader.ts"),
    readSource("../src/proxy.ts"),
  ]);

  assert.match(captcha, /const initialLocaleRef = useRef\(intl\.locale\)/);
  assert.match(captcha, /loadRecaptcha\(initialLocaleRef\.current\)/);
  assert.match(loader, /let recaptchaLoadPromise:/);
  assert.match(loader, /getDocumentCspNonce\(\)/);
  assert.match(loader, /script\.nonce = nonce/);
  assert.match(loader, /render=explicit&hl=/);
  assert.match(proxy, /script-src[^;]*https:\/\/www\.google\.com[^;]*https:\/\/www\.gstatic\.com/);
  assert.match(proxy, /frame-src[^;]*https:\/\/\*\.google\.com/);
});

test("un script reCAPTCHA fallido se elimina y permite volver a cargarlo", async () => {
  const source = (await readSource("../src/utils/recaptchaLoader.ts")).replace(
    'import { getDocumentCspNonce } from "./cspNonce";',
    'const getDocumentCspNonce = () => "nonce-de-prueba";',
  );
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  });
  const loadedModule = { exports: {} };
  const wrapper = vm.runInThisContext(
    `(function (module, exports) { ${outputText}\n })`,
  );
  wrapper(loadedModule, loadedModule.exports);

  const scripts = [];
  const previousWindow = globalThis.window;
  const previousDocument = globalThis.document;
  const browserWindow = {};
  const browserDocument = {
    getElementById(id) {
      return scripts.find((script) => script.id === id && script.parentNode) ?? null;
    },
    createElement() {
      const listeners = {};
      return {
        id: "",
        src: "",
        async: false,
        defer: false,
        nonce: "",
        parentNode: null,
        listeners,
        addEventListener(name, callback) {
          listeners[name] = callback;
        },
        removeEventListener(name, callback) {
          if (listeners[name] === callback) delete listeners[name];
        },
        remove() {
          this.parentNode = null;
        },
      };
    },
    head: {
      appendChild(script) {
        script.parentNode = this;
        scripts.push(script);
      },
    },
  };

  globalThis.window = browserWindow;
  globalThis.document = browserDocument;
  try {
    const firstLoad = loadedModule.exports.loadRecaptcha("es");
    const firstRejection = assert.rejects(firstLoad, /No se pudo cargar/);
    scripts[0].listeners.error();
    await firstRejection;
    assert.equal(browserDocument.getElementById("google-recaptcha-v2-script"), null);

    const secondLoad = loadedModule.exports.loadRecaptcha("es");
    assert.equal(scripts.length, 2);
    const api = { ready: (callback) => callback(), render: () => 1, reset: () => {} };
    browserWindow.grecaptcha = api;
    scripts[1].listeners.load();
    assert.equal(await secondLoad, api);
  } finally {
    if (previousWindow === undefined) delete globalThis.window;
    else globalThis.window = previousWindow;
    if (previousDocument === undefined) delete globalThis.document;
    else globalThis.document = previousDocument;
  }
});


test("un objeto global reCAPTCHA incompleto no bloquea la recuperación del widget", async () => {
  const source = (await readSource("../src/utils/recaptchaLoader.ts")).replace(
    'import { getDocumentCspNonce } from "./cspNonce";',
    'const getDocumentCspNonce = () => "nonce-de-prueba";',
  );
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  });
  const loadedModule = { exports: {} };
  const wrapper = vm.runInThisContext(
    `(function (module, exports) { ${outputText}\n })`,
  );
  wrapper(loadedModule, loadedModule.exports);

  const scripts = [];
  const previousWindow = globalThis.window;
  const previousDocument = globalThis.document;
  const browserWindow = { grecaptcha: { ready: () => {} } };
  const browserDocument = {
    getElementById(id) {
      return scripts.find((script) => script.id === id && script.parentNode) ?? null;
    },
    createElement() {
      const listeners = {};
      return {
        id: "",
        src: "",
        async: false,
        defer: false,
        nonce: "",
        parentNode: null,
        listeners,
        addEventListener(name, callback) {
          listeners[name] = callback;
        },
        removeEventListener(name, callback) {
          if (listeners[name] === callback) delete listeners[name];
        },
        remove() {
          this.parentNode = null;
        },
      };
    },
    head: {
      appendChild(script) {
        script.parentNode = this;
        scripts.push(script);
      },
    },
  };

  globalThis.window = browserWindow;
  globalThis.document = browserDocument;
  try {
    const loading = loadedModule.exports.loadRecaptcha("es");
    assert.equal(scripts.length, 1);

    const completeApi = {
      ready: (callback) => callback(),
      render: () => 1,
      reset: () => {},
    };
    browserWindow.grecaptcha = completeApi;
    scripts[0].listeners.load();

    assert.equal(await loading, completeApi);
  } finally {
    if (previousWindow === undefined) delete globalThis.window;
    else globalThis.window = previousWindow;
    if (previousDocument === undefined) delete globalThis.document;
    else globalThis.document = previousDocument;
  }
});

test("una carga reCAPTCHA bloqueada expira, limpia el script y permite reintentar", async () => {
  const source = (await readSource("../src/utils/recaptchaLoader.ts"))
    .replace(
      'import { getDocumentCspNonce } from "./cspNonce";',
      'const getDocumentCspNonce = () => "nonce-de-prueba";',
    )
    .replace("const RECAPTCHA_LOAD_TIMEOUT_MS = 15_000;", "const RECAPTCHA_LOAD_TIMEOUT_MS = 5;");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  });
  const loadedModule = { exports: {} };
  const wrapper = vm.runInThisContext(
    `(function (module, exports) { ${outputText}\n })`,
  );
  wrapper(loadedModule, loadedModule.exports);

  const scripts = [];
  const previousWindow = globalThis.window;
  const previousDocument = globalThis.document;
  const browserWindow = {};
  const browserDocument = {
    getElementById(id) {
      return scripts.find((script) => script.id === id && script.parentNode) ?? null;
    },
    createElement() {
      const listeners = {};
      return {
        id: "",
        src: "",
        async: false,
        defer: false,
        nonce: "",
        parentNode: null,
        listeners,
        addEventListener(name, callback) {
          listeners[name] = callback;
        },
        removeEventListener(name, callback) {
          if (listeners[name] === callback) delete listeners[name];
        },
        remove() {
          this.parentNode = null;
        },
      };
    },
    head: {
      appendChild(script) {
        script.parentNode = this;
        scripts.push(script);
      },
    },
  };

  globalThis.window = browserWindow;
  globalThis.document = browserDocument;
  try {
    await assert.rejects(
      loadedModule.exports.loadRecaptcha("es"),
      /agotó el tiempo de espera/,
    );
    assert.equal(browserDocument.getElementById("google-recaptcha-v2-script"), null);

    const retry = loadedModule.exports.loadRecaptcha("es");
    assert.equal(scripts.length, 2);
    const api = { ready: (callback) => callback(), render: () => 1, reset: () => {} };
    browserWindow.grecaptcha = api;
    scripts[1].listeners.load();
    assert.equal(await retry, api);
  } finally {
    if (previousWindow === undefined) delete globalThis.window;
    else globalThis.window = previousWindow;
    if (previousDocument === undefined) delete globalThis.document;
    else globalThis.document = previousDocument;
  }
});

test("los ejemplos de entorno documentan todos los valores predefinidos", async () => {
  const [frontendEnv, backendEnv] = await Promise.all([
    readSource("../.env.example"),
    readSource("../../backend/.env.example"),
  ]);

  assert.match(frontendEnv, /Valores admitidos: consola \| archivo\.[\s\S]*?FRONTEND_LOG_TARGET=archivo/);
  assert.match(frontendEnv, /Valores admitidos: debug \| info \| warn \| error\.[\s\S]*?FRONTEND_LOG_LEVEL=info/);
  assert.match(backendEnv, /Valores admitidos: starttls \| tls \| none\.[\s\S]*?SMTP_TLS_MODE=starttls/);
  assert.match(backendEnv, /Valores admitidos: development \| production\.[\s\S]*?APP_ENV=production/);
  assert.match(backendEnv, /Valores admitidos: consola \| archivo\.[\s\S]*?BACKEND_LOG_TARGET=archivo/);
  assert.match(backendEnv, /Valores admitidos: DEBUG \| INFO \| WARNING \| ERROR \| CRITICAL\.[\s\S]*?BACKEND_LOG_LEVEL=INFO/);
  assert.equal((backendEnv.match(/Valores admitidos: true \| false\./g) || []).length, 3);
  assert.match(frontendEnv, /^NEXT_PUBLIC_RECAPTCHA_SITE_KEY=/m);
  assert.match(backendEnv, /^RECAPTCHA_SECRET_KEY=/m);
  assert.doesNotMatch(frontendEnv, /^RECAPTCHA_SECRET_KEY=/m);
});
