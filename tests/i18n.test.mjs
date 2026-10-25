import assert from "node:assert/strict";
import fs from "node:fs";
import { test } from "node:test";
import { load } from "js-yaml";
import { collectionPath, localeFromPath, localizedPath, localizedSite } from "../src/utils/i18n.ts";
import { formatDate } from "../src/utils/date.ts";

test("language switching keeps the same nested page, query, and anchor", () => {
  const english = "/people/qian-xin/?from=directory&topic=quantum#research";
  const chinese = "/zh-CN/people/qian-xin/?from=directory&topic=quantum#research";
  assert.equal(localizedPath(english, "zh-CN"), chinese);
  assert.equal(localizedPath(chinese, "en"), english);
  assert.equal(localizedPath(chinese, "zh-CN"), chinese);
  assert.equal(localizedPath(english, "en"), english);
  assert.equal(localizedPath("/lectures/course/#lecture-notes", "zh-CN"), "/zh-CN/lectures/course/#lecture-notes");
});

test("locale roots normalize without confusing similarly named paths", () => {
  assert.equal(localeFromPath("/zh-CN"), "zh-CN");
  assert.equal(localeFromPath("/zh-CN/"), "zh-CN");
  assert.equal(localeFromPath("/zh-CN/news/example/"), "zh-CN");
  for (const pathname of ["/", "/people/", "/zh-CN-example/", "/zh/", "/people/zh-CN/"]) {
    assert.equal(localeFromPath(pathname), "en", pathname);
  }
  assert.equal(localizedPath("/", "zh-CN"), "/zh-CN/");
  assert.equal(localizedPath("/zh-CN", "en"), "/");
  assert.equal(localizedPath("/zh-CN/", "en"), "/");
  assert.equal(localizedPath("/zh-CN?topic=physics#updates", "en"), "/?topic=physics#updates");
  assert.equal(localizedPath("/zh-CN?topic=physics#updates", "zh-CN"), "/zh-CN/?topic=physics#updates");
  assert.equal(localizedPath("/zh-CN-example/", "zh-CN"), "/zh-CN/zh-CN-example/");
});

test("localization leaves external, protocol-relative, and fragment links intact", () => {
  const links = [
    "https://superqx.github.io/zh-CN/?view=research#papers",
    "http://staff.ustc.edu.cn/~yzhphy/index.html",
    "//doi.org/10.1000/example",
    "mailto:xinqian@seu.edu.cn",
    "#research",
    "?query=physics",
    "people/qian-xin/",
  ];
  for (const link of links) {
    assert.equal(localizedPath(link, "en"), link);
    assert.equal(localizedPath(link, "zh-CN"), link);
  }
});

test("translated collection names produce canonical route segments", () => {
  for (const collection of ["people", "publications", "news", "events", "lectures"]) {
    assert.equal(collectionPath(collection), collection);
    assert.equal(collectionPath(`${collection}Zh`), collection);
  }
  assert.equal(collectionPath("ZhExamples"), "ZhExamples");
});

test("site navigation keeps matching destinations in both languages", () => {
  const english = localizedSite("en");
  const chinese = localizedSite("zh-CN");
  assert.deepEqual(chinese.nav.map((item) => item.href), english.nav.map((item) => item.href));
  assert.deepEqual(chinese.footer.map((item) => item.href), english.footer.map((item) => item.href));
  assert.notEqual(chinese.name, english.name);
  assert.match(chinese.name, /\p{Script=Han}/u);
  for (const item of chinese.nav) assert.match(item.label, /\p{Script=Han}/u);
});

test("Chinese dates roll over at Beijing midnight independently of the host timezone", () => {
  const originalTimeZone = process.env.TZ;
  try {
    for (const timeZone of ["UTC", "America/Los_Angeles", "Asia/Shanghai"]) {
      process.env.TZ = timeZone;
      assert.equal(formatDate(new Date("2026-12-31T15:59:59Z"), "short", "zh-CN"), "2026年12月31日");
      assert.equal(formatDate(new Date("2026-12-31T16:00:00Z"), "long", "zh-CN"), "2027年1月1日");
      assert.equal(formatDate(new Date("2026-12-31T16:00:00Z"), "short", "en"), "Jan 1, 2027");
    }
  } finally {
    if (originalTimeZone === undefined) delete process.env.TZ;
    else process.env.TZ = originalTimeZone;
  }
});

function contentFiles(collection) {
  const directory = new URL(`../src/content/${collection}/`, import.meta.url);
  return {
    directory,
    names: fs.readdirSync(directory).filter((name) => name.endsWith(".md")).sort(),
  };
}

function frontmatter(directory, name) {
  const source = fs.readFileSync(new URL(name, directory), "utf8");
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  assert.ok(match, `${name} has no YAML frontmatter`);
  return load(match[1]);
}

for (const collection of ["people", "publications", "news", "events", "lectures"]) {
  test(`${collection} translations cover every source entry and preserve reference metadata`, () => {
    const source = contentFiles(collection);
    const chinese = contentFiles(`${collection}-zh`);
    assert.deepEqual(chinese.names, source.names, `${collection} translation coverage differs`);

    const sharedKeys = collection === "people"
      ? ["avatar", "email", "website", "category", "order"]
      : collection === "publications"
        ? ["authors", "year", "venue", "arxiv", "doi", "inspireId", "order"]
        : ["date", "image", "video", "slides"];

    for (const name of source.names) {
      const original = frontmatter(source.directory, name);
      const translated = frontmatter(chinese.directory, name);
      for (const key of sharedKeys) {
        assert.deepEqual(translated[key], original[key], `${collection}/${name}: ${key} changed`);
      }
      if (collection === "publications") {
        assert.equal(translated.originalTitle, original.title, `${name}: original citation title changed`);
      }
      if (collection !== "people") {
        assert.equal(typeof translated.title, "string", `${name}: translated title missing`);
        assert.ok(translated.title.trim(), `${name}: translated title empty`);
        if (original.summary) assert.ok(translated.summary?.trim(), `${name}: translated summary missing`);
      }
      if (original.videos) {
        assert.deepEqual(
          translated.videos?.map((video) => video.url),
          original.videos.map((video) => video.url),
          `${name}: recording URLs or their order changed`,
        );
      }
    }
  });
}
