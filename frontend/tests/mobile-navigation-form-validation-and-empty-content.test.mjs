import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const readSource = async (relativePath) =>
  readFile(new URL(relativePath, import.meta.url), "utf8");

const readLocale = async (locale) =>
  JSON.parse(await readSource(`../src/locales/${locale}/common.json`));

test("la navegación móvil limita el landmark nav a los enlaces del menú", async () => {
  const navbar = await readSource("../src/components/Navbar.tsx");

  assert.match(
    navbar,
    /<header className=\{styles\.navbar\} onKeyDown=\{handleMobileMenuKeyDown\}>/,
  );
  assert.match(
    navbar,
    /<nav\s+id="navbar-mobile-menu"[\s\S]*?aria-label=\{intl\.formatMessage\(\{ id: "navbar_menu" \}\)\}/,
  );
  assert.doesNotMatch(navbar, /<nav className=\{styles\.navbar\}>/);
});

test("la navegación móvil se cierra con Escape y devuelve el foco al botón", async () => {
  const navbar = await readSource("../src/components/Navbar.tsx");

  assert.match(navbar, /const mobileMenuButtonRef = useRef<HTMLButtonElement>\(null\)/);
  assert.match(navbar, /if \(event\.key === "Escape" && mobileMenu\)/);
  assert.match(navbar, /closeMobileMenu\(\);\s*mobileMenuButtonRef\.current\?\.focus\(\)/);
  assert.match(navbar, /ref=\{mobileMenuButtonRef\}/);
});

test("los menús persistentes se cierran también ante navegaciones externas a la barra", async () => {
  const navbar = await readSource("../src/components/Navbar.tsx");

  assert.match(navbar, /router\.events\.on\("routeChangeStart", handleLinkClick\)/);
  assert.match(navbar, /handleLinkClick[\s\S]*?closeMobileMenu\(\);[\s\S]*?closeRestaurantsMenuImmediately\(\)/);
  assert.match(navbar, /router\.events\.off\("routeChangeStart", handleLinkClick\)/);
});

test("el foco sale del menú antes de ocultar sus enlaces", async () => {
  const navbar = await readSource("../src/components/Navbar.tsx");

  assert.match(navbar, /const moveFocusOutsideClosingMenus = useCallback/);
  assert.match(
    navbar,
    /restaurantsMenuElement\?\.contains\(activeElement\)[\s\S]*?restaurantsButtonRef\.current\?\.focus\(\)/,
  );
  assert.match(
    navbar,
    /mobileMenuElement\?\.contains\(activeElement\)[\s\S]*?mobileMenuButtonRef\.current\?\.focus\(\)/,
  );
  assert.match(
    navbar,
    /const handleLinkClick = useCallback[\s\S]*?moveFocusOutsideClosingMenus\(\);[\s\S]*?closeMobileMenu\(\);[\s\S]*?closeRestaurantsMenuImmediately\(\)/,
  );
  assert.doesNotMatch(navbar, /aria-hidden=\{!mobileMenu\}/);
  assert.doesNotMatch(navbar, /aria-hidden=\{!restaurantsMenu\}/);
});

test("el correo se valida localmente y expone también los valores compuestos solo por espacios", async () => {
  const [form, ...locales] = await Promise.all([
    readSource("../src/components/Form.tsx"),
    ...["es", "en", "de", "fr"].map(readLocale),
  ]);

  assert.match(form, /formData\.email !== "" && !isValidEmail/);
  assert.match(form, /isValidContactEmail\(formData\.email\)/);
  assert.match(form, /aria-invalid=\{hasEmailValidationError\}/);
  assert.match(form, /id="emailValidationError"[\s\S]*?role="alert"/);
  assert.doesNotMatch(form, /aria-busy|emailValidationPending|EmailValidando|EmailValidacionNoDisponible/);

  for (const locale of locales) {
    assert.equal(typeof locale.contacto_EmailInvalido, "string");
    assert.notEqual(locale.contacto_EmailInvalido.trim(), "");
  }
});

test("el adjunto obligatorio se comunica y se refleja en el input de archivo", async () => {
  const [form, ...locales] = await Promise.all([
    readSource("../src/components/Form.tsx"),
    ...["es", "en", "de", "fr"].map(readLocale),
  ]);

  assert.match(form, /const isFileRequired = formData\.reason === "factura" \|\| formData\.reason === "curriculum"/);
  assert.doesNotMatch(form, /\srequired=\{isFileRequired\}/);
  assert.match(
    form,
    /aria-required=\{formData\.reason === "factura" \|\| formData\.reason === "curriculum"\}/,
  );
  assert.match(form, /id: "contacto_ArchivoObligatorio"/);

  for (const locale of locales) {
    assert.equal(typeof locale.contacto_ArchivoObligatorio, "string");
    assert.notEqual(locale.contacto_ArchivoObligatorio.trim(), "");
  }
});

test("el blog informa cuando la API devuelve una lista vacía", async () => {
  const [blog, ...locales] = await Promise.all([
    readSource("../src/pages/blog.tsx"),
    ...["es", "en", "de", "fr"].map(readLocale),
  ]);

  assert.match(blog, /safeBlogs\.length === 0 \? \(/);
  assert.match(blog, /id: "blog_SinArticulos"/);

  for (const locale of locales) {
    assert.equal(typeof locale.blog_SinArticulos, "string");
    assert.notEqual(locale.blog_SinArticulos.trim(), "");
  }
});

test("la charcutería informa cuando la API devuelve una lista vacía", async () => {
  const [charcuteria, ...locales] = await Promise.all([
    readSource("../src/pages/charcuteria.tsx"),
    ...["es", "en", "de", "fr"].map(readLocale),
  ]);

  assert.match(charcuteria, /safeProducts\.length === 0 \? \(/);
  assert.match(charcuteria, /id: "charcuteria_SinProductos"/);

  for (const locale of locales) {
    assert.equal(typeof locale.charcuteria_SinProductos, "string");
    assert.notEqual(locale.charcuteria_SinProductos.trim(), "");
  }
});

test("el mensaje español de error de charcutería usa inténtelo correctamente", async () => {
  const locale = await readLocale("es");

  assert.match(locale.charcuteria_Error, /por favor inténtelo más tarde/);
  assert.doesNotMatch(locale.charcuteria_Error, /intentelo/);
});
