import assert from "node:assert/strict";
import { test } from "node:test";
import { matchesSearch } from "../src/utils/search.ts";
import { publicationDescription } from "../src/utils/publication.ts";

test("publication search combines words across fields and ignores accents and punctuation", () => {
  const paper = "Rational Q-systems — Charlotte Fløe Kristjansen, Yunfeng Jiang (2026)";
  assert.ok(matchesSearch(paper, "JIANG 2026 q systems"));
  assert.ok(matchesSearch("Benoît: Spin-s Q-system", "benoit spin s"));
  assert.ok(matchesSearch(paper, "  "));
  assert.ok(!matchesSearch(paper, "Jiang 2025"));
  assert.ok(!matchesSearch(paper, "missingtopic"));
});

test("search supports readable mathematical notation", () => {
  assert.ok(matchesSearch("Beyond TT̄ deformation (2026)", "ttbar 2026"));
  assert.ok(matchesSearch("Beyond TT̄ deformation", "TT̄"));
  assert.ok(matchesSearch("Emergent D₈⁽¹⁾ spectrum", "D8 1"));
});

test("publication metadata includes identity and summary, with a venue fallback", () => {
  const paper = { title: "Beyond $T\\bar{T}$", authors: ["Jie Gu", "Yunfeng Jiang"], year: 2026 };
  assert.equal(publicationDescription({ ...paper, summary: "A harmonic approach." }),
    "Beyond TT̄. Jie Gu, Yunfeng Jiang (2026). A harmonic approach.");
  assert.equal(publicationDescription({ ...paper, venue: "Physical Review Letters" }),
    "Beyond TT̄. Jie Gu, Yunfeng Jiang (2026). Physical Review Letters");
  assert.equal(publicationDescription(paper), "Beyond TT̄. Jie Gu, Yunfeng Jiang (2026)");
});
