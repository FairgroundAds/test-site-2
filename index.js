import fs from "fs";
import path from "path";

const outDir = "./dist";

const placements = {
  NAVIGATION: `<nav><a href="/">Home</a> | <a href="/about">About</a></nav>`,
  INCONTENT: `<div><strong>Injected content</strong></div>`,
  SUBFOOTER: `<small>Injected footer links</small>`
};

function walk(dir) {
  return fs.readdirSync(dir).flatMap(file => {
    const full = path.join(dir, file);
    return fs.statSync(full).isDirectory() ? walk(full) : full;
  });
}

for (const file of walk(outDir)) {
  if (!file.endsWith(".html")) continue;

  let html = fs.readFileSync(file, "utf8");

  for (const [key, value] of Object.entries(placements)) {
    html = html.replaceAll(`__${key}__`, value);
  }

  fs.writeFileSync(file, html);
}
