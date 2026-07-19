import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { generateDefaultSeo, generateNextSeo } from "next-seo/pages";

const testsDirectory = path.dirname(fileURLToPath(import.meta.url));
const frontendDirectory = path.resolve(testsDirectory, "..");
const pagesDirectory = path.join(frontendDirectory, "src", "pages");

const readSource = (relativePath) =>
  readFile(path.join(frontendDirectory, relativePath), "utf8");

const collectPageFiles = async (directory) => {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const absolutePath = path.join(directory, entry.name);
      if (entry.isDirectory()) return collectPageFiles(absolutePath);
      return entry.isFile() && entry.name.endsWith(".tsx") ? [absolutePath] : [];
    })
  );
  return files.flat();
};

const findTags = (tags, type, attributeName, attributeValue) =>
  tags.filter(
    (tag) =>
      tag?.type === type &&
      (attributeName === undefined || tag.props?.[attributeName] === attributeValue)
  );

test("next-seo permite actualizaciones compatibles de la rama 7 en el manifiesto y el lockfile", async () => {
  const [packageJson, packageLock] = await Promise.all([
    readSource("package.json"),
    readSource("package-lock.json"),
  ]);

  const manifest = JSON.parse(packageJson);
  const lock = JSON.parse(packageLock);
  const declaredRange = manifest.dependencies["next-seo"];
  const installedVersion = lock.packages["node_modules/next-seo"].version;
  const [major, minor, patchVersion] = installedVersion.split(".").map(Number);

  assert.match(declaredRange, /^\^7\./);
  assert.equal(lock.packages[""].dependencies["next-seo"], declaredRange);
  assert.equal(major, 7);
  assert.ok(minor > 2 || (minor === 2 && patchVersion >= 0));
});

test("el Pages Router usa los generadores de next-seo 7 sin componentes retirados", async () => {
  const [pageFiles, seoHead, app, config] = await Promise.all([
    collectPageFiles(pagesDirectory),
    readSource("src/components/SeoHead.tsx"),
    readSource("src/pages/_app.tsx"),
    readSource("src/config/next-seo.config.ts"),
  ]);
  const sources = await Promise.all(pageFiles.map((pageFile) => readFile(pageFile, "utf8")));
  const migratedPages = sources.filter((source) => source.includes("<SeoHead"));

  assert.equal(migratedPages.length, 17);
  assert.match(seoHead, /import \{ generateNextSeo, type NextSeoProps \} from "next-seo\/pages"/);
  assert.match(seoHead, /<Head>\{generateNextSeo\(props\)\}<\/Head>/);
  assert.match(app, /import \{ generateDefaultSeo \} from "next-seo\/pages"/);
  assert.match(app, /\{generateDefaultSeo\(getSEOConfig\(/);
  assert.match(config, /import type \{ DefaultSeoProps \} from "next-seo\/pages"/);

  const applicationSource = [seoHead, app, config, ...sources].join("\n");
  assert.doesNotMatch(applicationSource, /\b(?:NextSeo|DefaultSeo)\b/);
  assert.doesNotMatch(applicationSource, /from ["']next-seo["']/);
});

test("los generadores conservan title, canonical, robots, Open Graph, Twitter y hreflang", () => {
  const defaultTags = generateDefaultSeo({
    title: "Título global",
    description: "Descripción global",
    openGraph: {
      type: "website",
      locale: "es_ES",
      url: "https://www.paraisodeljamon.com/",
      siteName: "El Paraíso Del Jamón",
      images: [{ url: "https://www.paraisodeljamon.com/logo.png", width: 1200, height: 700 }],
    },
    twitter: { cardType: "summary_large_image" },
    canonical: "https://www.paraisodeljamon.com/",
    languageAlternates: [
      { hrefLang: "es-ES", href: "https://www.paraisodeljamon.com/" },
      { hrefLang: "en-US", href: "https://www.paraisodeljamon.com/en" },
      { hrefLang: "de-DE", href: "https://www.paraisodeljamon.com/de" },
      { hrefLang: "fr-FR", href: "https://www.paraisodeljamon.com/fr" },
      { hrefLang: "x-default", href: "https://www.paraisodeljamon.com/" },
    ],
  });
  const pageTags = generateNextSeo({
    title: "Título localizado",
    description: "Descripción localizada",
    canonical: "https://www.paraisodeljamon.com/en/contacto",
    noindex: true,
    nofollow: true,
    openGraph: {
      title: "Título localizado",
      description: "Descripción localizada",
      url: "https://www.paraisodeljamon.com/en/contacto",
    },
  });

  assert.equal(findTags(defaultTags, "title").length, 1);
  assert.equal(findTags(defaultTags, "meta", "name", "description").length, 1);
  assert.equal(findTags(defaultTags, "link", "rel", "canonical").length, 1);
  assert.equal(findTags(defaultTags, "meta", "property", "og:url").length, 1);
  assert.equal(findTags(defaultTags, "meta", "name", "twitter:card").length, 1);
  assert.equal(findTags(defaultTags, "link", "rel", "alternate").length, 5);

  assert.equal(findTags(pageTags, "title").length, 1);
  assert.equal(findTags(pageTags, "meta", "name", "description").length, 1);
  assert.equal(findTags(pageTags, "link", "rel", "canonical").length, 1);
  assert.equal(findTags(pageTags, "meta", "property", "og:url").length, 1);
  assert.equal(findTags(pageTags, "meta", "name", "robots")[0].props.content, "noindex,nofollow");

  assert.equal(findTags(defaultTags, "title")[0].key, findTags(pageTags, "title")[0].key);
  assert.equal(
    findTags(defaultTags, "meta", "name", "description")[0].key,
    findTags(pageTags, "meta", "name", "description")[0].key
  );
  assert.equal(
    findTags(defaultTags, "link", "rel", "canonical")[0].key,
    findTags(pageTags, "link", "rel", "canonical")[0].key
  );
});

test("el JSON-LD conserva el renderer con nonce y no depende de los tipos incompatibles de next-seo", async () => {
  const jsonLd = await readSource("src/components/JsonLd.tsx");

  assert.doesNotMatch(jsonLd, /from ["']next-seo["']/);
  assert.match(jsonLd, /interface OrganizationJsonLdProps extends JsonLdBaseProps/);
  assert.match(jsonLd, /interface LocalBusinessJsonLdProps extends JsonLdBaseProps/);
  assert.match(jsonLd, /nonce=\{nonce\}/);
  assert.match(jsonLd, /type="application\/ld\+json"/);
  assert.equal((jsonLd.match(/\["@id", id\]/g) ?? []).length, 2);
  assert.doesNotMatch(jsonLd, /\["id", id\]/);
  assert.match(jsonLd, /\["image", images\]/);
  assert.match(jsonLd, /\["aggregateRating", normalizeRating\(rating\)\]/);
  assert.match(jsonLd, /\["openingHoursSpecification", normalizeOpeningHours\(openingHours\)\]/);
  assert.match(jsonLd, /\.replace\(\/<\/g, "\\\\u003c"\)/);
});
