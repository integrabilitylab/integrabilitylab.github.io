import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import { checkSite } from "../scripts/check-site.mjs";

test("site validation catches a stale redirect anchor and raw formula metadata", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "integrabilitylab-site-test-"));
  const newsDir = path.join(root, "news");
  fs.mkdirSync(newsDir);
  try {
    fs.writeFileSync(path.join(root, "index.html"), '<title>Events</title><link rel="canonical" href="https://example.com/news/"><meta http-equiv="refresh" content="0;url=/news/#events">');
    fs.writeFileSync(path.join(newsDir, "index.html"), '<title>$T\\overline{T}$</title><meta name="description" content="Updates"><link rel="canonical" href="https://example.com/news/"><main id="updates"></main>');
    const broken = checkSite(root, "https://example.com");
    assert.ok(broken.errors.some((error) => error.includes("missing anchor")));
    assert.ok(broken.errors.some((error) => error.includes("raw LaTeX")));
    fs.writeFileSync(path.join(root, "index.html"), '<title>Events</title><link rel="canonical" href="https://example.com/news/"><meta http-equiv="refresh" content="0;url=/news/#updates">');
    fs.writeFileSync(path.join(newsDir, "index.html"), '<title>TT̄</title><meta name="description" content="Updates"><link rel="canonical" href="https://example.com/news/"><main id="updates"></main>');
    assert.deepEqual(checkSite(root, "https://example.com").errors, []);
  } finally {
    // Delete only the fixture files created above; no recursive filesystem removal.
    fs.unlinkSync(path.join(root, "index.html"));
    fs.unlinkSync(path.join(newsDir, "index.html"));
    fs.rmdirSync(newsDir);
    fs.rmdirSync(root);
  }
});

const metadata = '<title>Page</title><meta name="description" content="Page">';
const canonicalLink = (href) => `<link rel="canonical" href="${href}">`;

function siteFixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "integrabilitylab-site-test-"));
  fs.mkdirSync(path.join(root, "news"));
  fs.mkdirSync(path.join(root, "empty"));
  fs.writeFileSync(path.join(root, "news/index.html"), metadata + canonicalLink("https://example.com/news/") + '<main id="updates"></main>');
  fs.writeFileSync(path.join(root, "asset.svg"), '<svg xmlns="http://www.w3.org/2000/svg"></svg>');
  const writeIndex = (body, canonical = canonicalLink("https://example.com/")) => {
    fs.writeFileSync(path.join(root, "index.html"), metadata + canonical + body);
  };
  writeIndex("");
  t.after(() => {
    fs.unlinkSync(path.join(root, "index.html"));
    fs.unlinkSync(path.join(root, "news/index.html"));
    fs.unlinkSync(path.join(root, "asset.svg"));
    fs.rmdirSync(path.join(root, "news"));
    fs.rmdirSync(path.join(root, "empty"));
    fs.rmdirSync(root);
  });
  return { root, writeIndex };
}

test("site validation checks anchors through all index page URLs", (t) => {
  const { root, writeIndex } = siteFixture(t);
  const targets = ["/#home", "/index.html#home", "/news#updates", "/news/#updates", "/news/index.html#updates", "/news?view=all#updates"];
  const links = (urls) => '<main id="home"></main>' + urls.map((url) => `<a href="${url}">Go</a>`).join("");
  writeIndex(links(targets));
  assert.deepEqual(checkSite(root, "https://example.com").errors, []);

  const brokenTargets = targets.map((url) => url.replace(/#.*$/, "#missing-anchor"));
  writeIndex(links(brokenTargets));
  const { errors } = checkSite(root, "https://example.com");
  assert.equal(errors.length, brokenTargets.length);
  for (const target of brokenTargets) assert.ok(errors.includes(`index.html: missing anchor ${target}`));
});

test("site validation rejects directories without an index while accepting asset files", (t) => {
  const { root, writeIndex } = siteFixture(t);
  writeIndex('<a href="/empty/">Empty</a><a href="/empty">Empty</a><img src="/asset.svg"><a href="/missing.svg">Missing</a>');
  assert.deepEqual(checkSite(root, "https://example.com").errors, [
    "index.html: missing target /empty/",
    "index.html: missing target /empty",
    "index.html: missing target /missing.svg",
  ]);
});

test("site validation rejects missing, malformed and incorrect canonical URLs", (t) => {
  const { root, writeIndex } = siteFixture(t);
  const invalidLinks = [
    "",
    '<link rel="canonical">',
    canonicalLink(""),
    canonicalLink("   "),
    canonicalLink("https://["),
    canonicalLink("/"),
    canonicalLink("//example.com/"),
    canonicalLink("http://example.com/"),
    canonicalLink("https://other.example/"),
    canonicalLink("https://example.com/news/"),
    canonicalLink("https://example.com/index.html"),
    canonicalLink("https://example.com/?view=all"),
    canonicalLink("https://example.com/#home"),
    canonicalLink("https://user:password@example.com/"),
    '<a rel="canonical" href="https://example.com/">Wrong element</a>',
  ];
  for (const canonical of invalidLinks) {
    writeIndex("", canonical);
    assert.ok(checkSite(root, "https://example.com").errors.some((error) => /index\.html: (missing|invalid) canonical URL/.test(error)), canonical);
  }
  writeIndex("");
  assert.deepEqual(checkSite(root, "https://example.com").errors, []);
});

test("redirect canonical URLs match the destination route and its aliases", (t) => {
  const { root, writeIndex } = siteFixture(t);
  for (const target of ["/news#updates", "/news/#updates", "/news/index.html#updates"]) {
    writeIndex(`<meta http-equiv="refresh" content="0;url=${target}">`, canonicalLink("https://example.com/news/"));
    assert.deepEqual(checkSite(root, "https://example.com").errors, []);
    writeIndex(`<meta http-equiv="refresh" content="0;url=${target}">`);
    assert.ok(checkSite(root, "https://example.com").errors.some((error) => error.includes("invalid canonical URL")));
    writeIndex(`<meta http-equiv="refresh" content="0;url=${target.replace(/#.*$/, "#missing-anchor")}">`, canonicalLink("https://example.com/news/"));
    assert.ok(checkSite(root, "https://example.com").errors.some((error) => error.includes("missing anchor")));
  }
});

test("malformed URL encoding is reported without aborting site validation", (t) => {
  const { root, writeIndex } = siteFixture(t);
  writeIndex('<a href="/news/#%ZZ">Bad anchor</a><a href="/bad%ZZ">Bad path</a>');
  assert.deepEqual(checkSite(root, "https://example.com").errors, [
    "index.html: invalid URL /news/#%ZZ",
    "index.html: invalid URL /bad%ZZ",
  ]);
});
