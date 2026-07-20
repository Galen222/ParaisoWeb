import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const imageSources = [
  "../src/components/Carousel.tsx",
  "../src/components/Navbar.tsx",
  "../src/components/ScrollToTopButton.tsx",
  "../src/components/Transport.tsx",
  "../src/pages/404.tsx",
  "../src/pages/_error.tsx",
  "../src/pages/blog.tsx",
  "../src/pages/blog/[slug].tsx",
  "../src/pages/charcuteria.tsx",
  "../src/pages/gastronomia.tsx",
  "../src/pages/nosotros.tsx",
];

const readSource = async (relativePath) =>
  readFile(new URL(relativePath, import.meta.url), "utf8");

test("las imágenes visibles usan next/image sin conservar etiquetas img directas", async () => {
  for (const relativePath of imageSources) {
    const source = await readSource(relativePath);

    assert.match(source, /import Image from "next\/image";/);
    assert.doesNotMatch(source, /<img(?:\s|>)/);
    assert.match(source, /<Image(?:\s|>)/);
  }
});

test("las imágenes dinámicas reservan espacio y declaran tamaños responsivos", async () => {
  const [blog, blogDetail, charcuteria, blogCss, blogDetailCss] = await Promise.all([
    readSource("../src/pages/blog.tsx"),
    readSource("../src/pages/blog/[slug].tsx"),
    readSource("../src/pages/charcuteria.tsx"),
    readSource("../src/styles/pages/blog.module.css"),
    readSource("../src/styles/pages/slug.module.css"),
  ]);

  assert.match(blog, /<Image[\s\S]*?fill[\s\S]*?sizes=/);
  assert.match(blogDetail, /<Image[\s\S]*?fill[\s\S]*?sizes=/);
  assert.match(charcuteria, /<Image[\s\S]*?fill[\s\S]*?sizes=/);
  assert.match(blogCss, /\.imageContainer\s*\{[\s\S]*?position:\s*relative;/);
  assert.match(blogDetailCss, /\.blogImageContainer\s*\{[\s\S]*?aspect-ratio:\s*3\s*\/\s*2;/);
});
