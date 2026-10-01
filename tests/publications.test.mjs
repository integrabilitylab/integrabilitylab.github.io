import assert from "node:assert/strict";
import fs from "node:fs";
import { test } from "node:test";
import { load } from "js-yaml";
import { toMetadataText } from "../src/utils/math.ts";

test("publications contain no duplicate papers or repeated authors", () => {
  const directory = new URL("../src/content/publications/", import.meta.url);
  const identifiers = new Map();
  for (const file of fs.readdirSync(directory).filter((name) => name.endsWith(".md"))) {
    const source = fs.readFileSync(new URL(file, directory), "utf8");
    const publication = load(source.match(/^---\r?\n([\s\S]*?)\r?\n---/)[1]);
    const title = toMetadataText(publication.title).normalize("NFKD").toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");
    const keys = [`title:${title}`];
    if (publication.doi) keys.push(`doi:${publication.doi.toLowerCase()}`);
    if (publication.arxiv) keys.push(`arxiv:${new URL(publication.arxiv).pathname.replace(/v\d+$/, "")}`);
    if (publication.inspireId) keys.push(`inspire:${publication.inspireId}`);
    for (const key of keys) {
      assert.ok(!identifiers.has(key), `${file} duplicates ${identifiers.get(key)} (${key})`);
      identifiers.set(key, file);
    }
    assert.ok(publication.venue, `${file} has no publication venue`);
    assert.ok(Number.isInteger(publication.year), `${file} has no publication year`);
    const authors = publication.authors.map((author) => author.normalize("NFKD").toLowerCase());
    assert.equal(new Set(authors).size, authors.length, `${file} repeats an author`);
    if (publication.inspireId) assert.ok(source.includes(`/literature/${publication.inspireId}`), `${file} links to a different INSPIRE record`);
  }
});
