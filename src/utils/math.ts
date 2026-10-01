import katex from "katex";
import { parseFragment, serialize, type DefaultTreeAdapterMap } from "parse5";

type MathNode = DefaultTreeAdapterMap["node"];
type InlinePart = { type: "text" | "math"; value: string };
const mathCache = new Map<string, { html: string; text: string }>();
const subscript = Object.fromEntries(Array.from("0123456789+-=()in").map((char, index) => [char, Array.from("₀₁₂₃₄₅₆₇₈₉₊₋₌₍₎ᵢₙ")[index]]));
const superscript = Object.fromEntries(Array.from("0123456789+-=()in").map((char, index) => [char, Array.from("⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻⁼⁽⁾ⁱⁿ")[index]]));

function scriptText(text: string, alphabet: Record<string, string>, fallback: string) {
  const chars = Array.from(text);
  return chars.every((char) => char in alphabet)
    ? chars.map((char) => alphabet[char]).join("")
    : `${fallback}(${text})`;
}

function mathToText(node: MathNode): string {
  if ("value" in node) return node.value;
  if (!("childNodes" in node)) return "";
  const parts = node.childNodes.map(mathToText);
  const tag = "tagName" in node ? node.tagName : "";
  switch (tag) {
    case "annotation":
    case "annotation-xml":
      return "";
    case "msub":
      return parts[0] + scriptText(parts[1] ?? "", subscript, "_");
    case "msup":
      return parts[0] + scriptText(parts[1] ?? "", superscript, "^");
    case "msubsup":
      return parts[0] + scriptText(parts[1] ?? "", subscript, "_") + scriptText(parts[2] ?? "", superscript, "^");
    case "mover":
      return /^[¯‾ˉ\u0304]$/.test(parts[1] ?? "") ? parts[0] + "\u0304" : parts.join("");
    case "mfrac":
      return `(${parts[0]}/${parts[1]})`;
    default:
      return parts.join("");
  }
}

function getMath(formula: string) {
  let result = mathCache.get(formula);
  if (!result) {
    const html = katex.renderToString(formula, {
      output: "mathml",
      throwOnError: true,
      trust: false,
      strict: "error",
    });
    const fragment = parseFragment(html);
    const text = mathToText(fragment);
    function labelMath(node: MathNode) {
      if ("tagName" in node && node.tagName === "math") {
        node.attrs.push({ name: "aria-label", value: text });
      }
      if ("childNodes" in node) node.childNodes.forEach(labelMath);
    }
    labelMath(fragment);
    result = { html: serialize(fragment), text };
    mathCache.set(formula, result);
  }
  return result;
}

export function splitInlineMath(text: string): InlinePart[] {
  return text.split(/((?<!\\)\$[^$]+(?<!\\)\$)/g).map((part, index) => ({
    type: index % 2 === 0 ? "text" : "math",
    value: index % 2 === 0 ? part : part.slice(1, -1),
  }));
}

export function renderInlineMath(formula: string) {
  return getMath(formula).html;
}

// Metadata accepts text, so keep mathematical meaning using Unicode notation.
export function toMetadataText(text: string) {
  return splitInlineMath(text).map((part) => part.type === "math" ? getMath(part.value).text : part.value)
    .join("").replace(/\s+/g, " ").trim();
}
