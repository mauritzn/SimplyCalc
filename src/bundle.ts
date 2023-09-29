import { build } from "bun";
import path from "path";
import fs from "fs";
import * as sass from "sass";
import { webTitle, description, version } from "../package.json";

const OUTPUT_DIR = `dist`;
const OUTPUT_DIR_JS = path.join(OUTPUT_DIR, "js");
const OUTPUT_DIR_CSS = path.join(OUTPUT_DIR, "css");
const OUTPUT_DIR_STATIC = path.join(OUTPUT_DIR, "static");

type HashAlgo =
  | "blake2b256"
  | "md4"
  | "md5"
  | "ripemd160"
  | "sha1"
  | "sha224"
  | "sha256"
  | "sha384"
  | "sha512"
  | "sha512-256";

async function copy(
  inputFile: string,
  outputFolder: string,
  ignoreParentFolder: boolean = false
) {
  if (!fs.existsSync(outputFolder)) {
    fs.mkdirSync(outputFolder, { recursive: true });
  }

  if (!fs.existsSync(inputFile)) {
    throw new Error(`Missing input (${inputFile})!`);
  }

  const inputStats = fs.statSync(inputFile);

  if (ignoreParentFolder === true && inputStats.isDirectory() === true) {
    const items = fs.readdirSync(inputFile);
    for (const item of items) {
      if ([".", ".."].includes(item) === false) {
        const outputFile = path.join(outputFolder, path.basename(item));
        fs.cpSync(path.join(inputFile, item), outputFile, { recursive: true });
      }
    }
  } else {
    const outputFile = path.join(outputFolder, path.basename(inputFile));
    fs.cpSync(inputFile, outputFile, { recursive: true });
  }
}

async function getFileHash(filePath: string, algo: HashAlgo = "sha256") {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing file at provided path (${filePath})!`);
  }

  const fileData = fs.readFileSync(filePath, {
    encoding: "utf-8",
  });

  const hasher = new Bun.CryptoHasher(algo);
  hasher.update(fileData);
  return hasher.digest("hex");
}

// start total time, timer
console.time("> Done");

// Clean-up
if (fs.existsSync(OUTPUT_DIR)) {
  console.time(`Cleaned up old bundle!`);
  console.log(`Cleaning up old bundle...`);
  fs.rmSync(OUTPUT_DIR, { recursive: true, force: true });
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  console.timeEnd(`Cleaned up old bundle!`);
  console.log("");
}

if (Bun.env?.NODE_ENV === "production") {
  // Build minified version
  console.time(`Built minified version!`);
  console.log(`Building minified version...`);
  await build({
    entrypoints: ["src/index.ts"],
    outdir: OUTPUT_DIR_JS,
    target: "browser",
    format: "esm", // INFO: should be "iife", but that isn't supported yet
    naming: "[dir]/app.min.[ext]",
    splitting: false,
    minify: true,
    plugins: [],
  });
  console.timeEnd(`Built minified version!`);
} else {
  // Build non-minified version
  console.time(`Built non-minified version!`);
  console.log(`Building non-minified version...`);
  await build({
    entrypoints: ["src/index.ts"],
    outdir: OUTPUT_DIR_JS,
    target: "browser",
    format: "esm", // INFO: should be "iife", but that isn't supported yet
    naming: "[dir]/app.[ext]",
    splitting: false,
    minify: false,
    plugins: [],
  });
  console.timeEnd(`Built non-minified version!`);
}

// Add IIFE
console.time(`Added IIFE to the built bundle!`);
console.log(`\nAdding IIFE to the built bundle...`);

if (Bun.env?.NODE_ENV === "production") {
  let bundleMinifiedSrc = fs.readFileSync(`${OUTPUT_DIR_JS}/app.min.js`, {
    encoding: "utf-8",
  });

  bundleMinifiedSrc = `(function () {${bundleMinifiedSrc.trim()}})();`;

  fs.writeFileSync(`${OUTPUT_DIR_JS}/app.min.js`, bundleMinifiedSrc, {
    encoding: "utf-8",
  });
} else {
  let bundleNonMinifiedSrc = fs.readFileSync(`${OUTPUT_DIR_JS}/app.js`, {
    encoding: "utf-8",
  });

  bundleNonMinifiedSrc = `(function () {\n${bundleNonMinifiedSrc.trim()}\n})();`;

  fs.writeFileSync(`${OUTPUT_DIR_JS}/app.js`, bundleNonMinifiedSrc, {
    encoding: "utf-8",
  });
}

console.timeEnd(`Added IIFE to the built bundle!`);

// Copy relevant files
console.time(`Copied relevant files to "${OUTPUT_DIR}" directory!`);
console.log(`\nCopying relevant files to "${OUTPUT_DIR}" directory...`);
await copy(`public/fonts`, OUTPUT_DIR_STATIC);
await copy(`public/favicon.ico`, OUTPUT_DIR);
await copy(`public/index.html`, OUTPUT_DIR);
await copy(`_server files`, OUTPUT_DIR, true);
console.timeEnd(`Copied relevant files to "${OUTPUT_DIR}" directory!`);

// Compile SCSS
console.time(`Compiled app SCSS to CSS!`);
console.log(`\nCompiling app SCSS to CSS...`);
fs.mkdirSync(OUTPUT_DIR_CSS, { recursive: true });

const compileResult = sass.compile("src/css/app.scss");
fs.writeFileSync(`${OUTPUT_DIR_CSS}/app.css`, compileResult.css, {
  encoding: "utf-8",
});
console.timeEnd(`Compiled app SCSS to CSS!`);

// Add files to HTML file
console.time(`Added files to HTML file!`);
console.log(`\nAdding files to HTML file...`);

let htmlSrc = fs.readFileSync(`${OUTPUT_DIR}/index.html`, {
  encoding: "utf-8",
});

htmlSrc = htmlSrc.replace(
  `<!-- BUN:METADATA -->`,
  `<title>${webTitle}</title>

    <meta name="description" content="${description}" />
    <meta name="version" content="${version}" />

    <link rel="icon" href="./favicon.ico">`
);

const cssFileHash = await getFileHash(`${OUTPUT_DIR_CSS}/app.css`);
htmlSrc = htmlSrc.replace(
  `<!-- BUN:CSS -->`,
  `<link rel="stylesheet" href="./css/app.css?h=${cssFileHash}" />`
);

const jsFile = `app${Bun.env?.NODE_ENV === "production" ? ".min" : ""}.js`;
const jsFileHash = await getFileHash(`${OUTPUT_DIR_JS}/${jsFile}`);
htmlSrc = htmlSrc.replace(
  `<!-- BUN:JS -->`,
  `<script defer="defer" src="./js/${jsFile}?h=${jsFileHash}"></script>`
);

fs.writeFileSync(`${OUTPUT_DIR}/index.html`, htmlSrc, {
  encoding: "utf-8",
});

console.timeEnd(`Added files to HTML file!`);

console.log("");
console.timeEnd("> Done");
