import { readFileSync } from "node:fs";
import { join } from "node:path";

// Browser-external surfaces such as the web manifest need literal colors.
// Both these routes render statically from the default palette.
export function siteColors() {
  const css = readFileSync(join(process.cwd(), "src", "app", "globals.css"), "utf8");
  function color(name: "canvas" | "ink" | "muted" | "action") {
    const value = css.match(new RegExp(`--color-${name}:\\s*(#[0-9a-f]{6});`, "i"))?.[1];
    if (!value) throw new Error(`Missing color token: ${name}`);
    return value;
  }
  return { canvas: color("canvas"), ink: color("ink"), muted: color("muted"), action: color("action") };
}
