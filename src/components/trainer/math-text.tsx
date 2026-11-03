import katex from "katex";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&" + "amp;")
    .replace(/</g, "&" + "lt;")
    .replace(/>/g, "&" + "gt;");
}

function renderLatex(source: string, display: boolean): string {
  try {
    return katex.renderToString(source, {
      displayMode: display,
      throwOnError: false,
      strict: "ignore",
      trust: false,
    });
  } catch {
    return `<span>${escapeHtml(source)}</span>`;
  }
}

export function renderMixed(source: string): string {
  const blocks = source.split(/(\$\$[\s\S]+?\$\$|\\\[[\s\S]+?\\\]|\$[^$\n]+?\$|\\\([\s\S]+?\\\))/g);
  return blocks
    .map((block) => {
      if (!block) return "";
      if (block.startsWith("$$") && block.endsWith("$$")) {
        return `<div class="math-display">${renderLatex(block.slice(2, -2), true)}</div>`;
      }
      if (block.startsWith("\\[") && block.endsWith("\\]")) {
        return `<div class="math-display">${renderLatex(block.slice(2, -2), true)}</div>`;
      }
      if (block.startsWith("$") && block.endsWith("$")) {
        return `<span class="math-inline">${renderLatex(block.slice(1, -1), false)}</span>`;
      }
      if (block.startsWith("\\(") && block.endsWith("\\)")) {
        return `<span class="math-inline">${renderLatex(block.slice(2, -2), false)}</span>`;
      }
      return escapeHtml(block).replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>").replace(/\n/g, "<br/>");
    })
    .join("");
}

export function MathText({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  return <div className={className} dangerouslySetInnerHTML={{ __html: renderMixed(text) }} />;
}
