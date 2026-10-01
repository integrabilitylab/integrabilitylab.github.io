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
