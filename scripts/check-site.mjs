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

function refreshTarget(attrs) {
  return attrs["http-equiv"]?.toLowerCase() === "refresh"
    ? attrs.content?.match(/url\s*=\s*(.+)$/i)?.[1].trim().replace(/^(['"])(.*)\1$/, "$2")
    : undefined;
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
    pages.set(route, { route, file, elements, ids });
  }

  // Directory routes, their slashless form and explicit index.html URLs share a page.
  function pageForPath(pathname) {
    const route = pathname.replace(/\/index\.html$/, "/");
    return pages.get(route) ?? pages.get(`${route}/`);
  }

  for (const [route, { file, elements }] of pages) {
    const redirect = elements.find(({ node, attrs }) => node.tagName === "meta" && attrs["http-equiv"]?.toLowerCase() === "refresh");
    const isRedirect = Boolean(redirect);
    const title = elements.find(({ node }) => node.tagName === "title");
    const description = elements.find(({ attrs }) => attrs.name === "description");
    const canonical = elements.find(({ node, attrs }) => node.tagName === "link" && attrs.rel === "canonical");
    if (!title || !textContent(title.node).trim()) errors.push(`${file}: missing title`);
    if (!canonical?.attrs.href?.trim()) {
      errors.push(`${file}: missing canonical URL`);
    } else {
      const href = canonical.attrs.href;
      try {
        // Resolve redirect aliases to the destination's canonical route, without its fragment.
        const expected = new URL((redirect && refreshTarget(redirect.attrs)) ?? route, base);
        const destination = pageForPath(decodeURIComponent(expected.pathname));
        if (destination) expected.pathname = new URL(destination.route, base).pathname;
        expected.search = "";
        expected.hash = "";
        const url = new URL(href);
        if (url.protocol !== "https:" || url.origin !== base.origin || url.href !== expected.href) {
          errors.push(`${file}: invalid canonical URL ${href} (expected ${expected.href})`);
        }
      } catch {
        errors.push(`${file}: invalid canonical URL ${href}`);
      }
    }
    if (!isRedirect && !description?.attrs.content?.trim()) errors.push(`${file}: missing description`);
    for (const { node, attrs } of elements) {
      const metadata = node.tagName === "title" ? textContent(node) : node.tagName === "meta" ? attrs.content : "";
      if (metadata && /\$[^$]*\\[a-z]+/i.test(metadata)) errors.push(`${file}: raw LaTeX in metadata`);

      const target = refreshTarget(attrs) ?? (["a", "link"].includes(node.tagName) ? attrs.href : attrs.src);
      if (!target) continue;
      let url, pathname, anchor;
      try {
        url = new URL(target, new URL(route, base));
        if (url.origin !== base.origin) continue;
        pathname = decodeURIComponent(url.pathname);
        anchor = decodeURIComponent(url.hash.slice(1));
      } catch { errors.push(`${file}: invalid URL ${target}`); continue; }
      references++;
      const destination = pageForPath(pathname);
      if (destination) {
        if (url.hash && !destination.ids.has(anchor)) {
          errors.push(`${file}: missing anchor ${target}`);
        }
      } else {
        // A directory alone is not a served page: it must have an index.html above.
        const targetFile = path.join(root, pathname);
        if (!fs.existsSync(targetFile) || !fs.statSync(targetFile).isFile()) {
          errors.push(`${file}: missing target ${target}`);
        }
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
