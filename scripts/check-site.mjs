import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { parse } from "parse5";

function walk(node, visit) {
  visit(node);
  for (const child of node.childNodes ?? []) walk(child, visit);
}

function textContent(node) {
  if (node.nodeName === "#text") return node.value;
  return (node.childNodes ?? []).map(textContent).join("");
}

export function checkSite(root, site) {
  const base = new URL(site);
  const files = fs.readdirSync(root, { recursive: true }).filter((file) => file.endsWith(".html"));
  const pages = new Map();
  const errors = [];
  let references = 0;

  for (const file of files) {
    const route = "/" + file.split(path.sep).join("/").replace(/index\.html$/, "");
    const elements = [];
    const ids = new Set();
    walk(parse(fs.readFileSync(path.join(root, file), "utf8")), (node) => {
      if (!node.tagName) return;
      const attrs = Object.fromEntries(node.attrs.map(({ name, value }) => [name, value]));
      if (attrs.id) {
        if (ids.has(attrs.id)) errors.push(`${file}: duplicate id #${attrs.id}`);
        ids.add(attrs.id);
      }
      elements.push({ node, attrs });
    });
    pages.set(route, { file, elements, ids });
  }

  for (const [route, { file, elements }] of pages) {
    const isRedirect = elements.some(({ attrs }) => attrs["http-equiv"]?.toLowerCase() === "refresh");
    const title = elements.find(({ node }) => node.tagName === "title");
    const description = elements.find(({ attrs }) => attrs.name === "description");
    const canonical = elements.find(({ attrs }) => attrs.rel === "canonical");
    if (!title || !textContent(title.node).trim()) errors.push(`${file}: missing title`);
    if (!canonical) errors.push(`${file}: missing canonical URL`);
    if (!isRedirect && !description?.attrs.content?.trim()) errors.push(`${file}: missing description`);
    for (const { node, attrs } of elements) {
      const metadata = node.tagName === "title" ? textContent(node) : node.tagName === "meta" ? attrs.content : "";
      if (metadata && /\$[^$]*\\[a-z]+/i.test(metadata)) errors.push(`${file}: raw LaTeX in metadata`);

      const refreshTarget = attrs["http-equiv"]?.toLowerCase() === "refresh"
        ? attrs.content?.match(/url\s*=\s*(.+)$/i)?.[1]
        : undefined;
      const target = refreshTarget ?? (["a", "link"].includes(node.tagName) ? attrs.href : attrs.src);
      if (!target) continue;
      let url;
      try { url = new URL(target, new URL(route, base)); }
      catch { errors.push(`${file}: invalid URL ${target}`); continue; }
      if (url.origin !== base.origin) continue;
      references++;
      const destination = pages.get(url.pathname);
      if (destination) {
        if (url.hash && !destination.ids.has(decodeURIComponent(url.hash.slice(1)))) {
          errors.push(`${file}: missing anchor ${target}`);
        }
      } else if (!fs.existsSync(path.join(root, decodeURIComponent(url.pathname)))) {
        errors.push(`${file}: missing target ${target}`);
      }
    }
  }
  return { pages: pages.size, references, errors };
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const { default: config } = await import("../astro.config.mjs");
  const result = checkSite(fileURLToPath(new URL("../dist/", import.meta.url)), config.site);
  if (result.errors.length) {
    console.error(result.errors.join("\n"));
    process.exitCode = 1;
  } else {
    console.log(`Checked ${result.pages} pages and ${result.references} local references: no broken targets or metadata errors.`);
  }
}
