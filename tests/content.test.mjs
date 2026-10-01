import assert from "node:assert/strict";
import { test } from "node:test";
import { formatDate, formatYear } from "../src/utils/date.ts";
import { renderInlineMath, toMetadataText } from "../src/utils/math.ts";

test("content dates use Beijing time regardless of the build machine", () => {
  const originalTimeZone = process.env.TZ;
  try {
    for (const timeZone of ["UTC", "America/Los_Angeles", "Asia/Shanghai"]) {
      process.env.TZ = timeZone;
      const date = new Date("2026-08-27T00:00:00Z");
      assert.equal(formatDate(date), "Aug 27, 2026");
      assert.equal(formatDate(date, "long"), "August 27, 2026");
    }
  } finally {
    if (originalTimeZone === undefined) delete process.env.TZ;
    else process.env.TZ = originalTimeZone;
  }
});

test("dates and copyright years roll over at midnight in Beijing", () => {
  assert.equal(formatDate(new Date("2026-08-26T15:59:59Z")), "Aug 26, 2026");
  assert.equal(formatDate(new Date("2026-08-26T16:00:00Z")), "Aug 27, 2026");
  assert.equal(formatYear(new Date("2026-12-31T15:59:59Z")), "2026");
  assert.equal(formatYear(new Date("2026-12-31T16:00:00Z")), "2027");
});

test("both TT-bar spellings yield readable metadata", () => {
  const title = "Beyond $T\\overline{T}$ and $T\\bar{T}$ Deformations";
  assert.equal(toMetadataText(title), "Beyond TT̄ and TT̄ Deformations");
  assert.equal(toMetadataText("  Quantum\n  Integrability  "), "Quantum Integrability");
  assert.equal(toMetadataText("AdS/CFT & U(1)"), "AdS/CFT & U(1)");
});

test("publication math keeps subscripts, superscripts and bars in metadata", () => {
  assert.equal(toMetadataText("Emergent $D_8^{(1)}$ spectrum in CoNb$_2$O$_6$"), "Emergent D₈⁽¹⁾ spectrum in CoNb₂O₆");
  assert.equal(toMetadataText("Modular covariance of $J\\bar{T}$"), "Modular covariance of JT̄");
  assert.equal(toMetadataText("Spin-$s$ rational $Q$-system"), "Spin-s rational Q-system");
  assert.equal(toMetadataText("$\\mathrm{T}\\overline{\\mathrm{T}}$-deformed gas"), "TT̄-deformed gas");
  assert.match(renderInlineMath("D_8^{(1)}"), /<msubsup>/);
  assert.match(renderInlineMath("D_8^{(1)}"), /aria-label="D₈⁽¹⁾"/);
  assert.doesNotMatch(renderInlineMath("\\href{javascript:alert(1)}{x}"), /<a\b|href=/);
});
