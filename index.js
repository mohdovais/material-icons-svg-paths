#!/usr/bin/env node

const fs = require("fs");
const cheerio = require("cheerio");
const path = require("path");
const EXTENSION_REGEX = /_24px.svg$/;
const CHEERIO_CONFIG = {
    normalizeWhitespace: true,
    xmlMode: true
  };
const CATEGORIES = [
  "action",
  "alert",
  "av",
  "communication",
  "content",
  "device",
  "editor",
  "file",
  "hardware",
  "image",
  "maps",
  "navigation",
  "notification",
  "places",
  "social",
  "toggle"
];

function circleToPath(attr) {
  const { cx, cy, r } = attr;
  return `M ${cx} ${cy}m -${r}, 0a ${r},${r} 0 1,1 ${r *
    2},0a ${r},${r} 0 1,1 -${r * 2},0`;
}

function extractPath($) {
  return $("svg")
    .children()
    .map((i, child) => {
      if (child.tagName === "path") {
        return child.attribs.d;
      }
      if (child.tagName === "circle") {
        return circleToPath(child.attribs);
      }
    })
    .get()
    .join("");
}

CATEGORIES.map(cat => {
  const folder = "./material-design-icons-master/" + cat + "/svg/production";
  const fileContent = fs
    .readdirSync(folder, "utf8")
    .filter(filename => EXTENSION_REGEX.test(filename))
    .reduce((accum, filename) => {
      const content = fs.readFileSync(folder + "/" + filename, "utf8");
      const $ = cheerio.load(content, CHEERIO_CONFIG);
      const name = filename.replace(EXTENSION_REGEX, "");
      const d = extractPath($);
      return accum.concat([`export const ${name}="${d}";\n`]);
    }, [])
    .join("");

  fs.writeFileSync("./dist/" + cat + ".js", fileContent, "utf8");
});
