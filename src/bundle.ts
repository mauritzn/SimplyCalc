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

class Builder {
  public readonly version = "0.0.1";

  private _entrypoint: string;
  private _outputFolder: string;
  private _prodEnvName: string;
  private _envMode: "production" | "development" | "both" = "both";

  constructor(
    entrypoint: string,
    outputFolder: string,
    prodEnvName: string = "NODE_ENV"
  ) {
    this._entrypoint = entrypoint;
    this._outputFolder = outputFolder;
    this._prodEnvName = prodEnvName.trim();

    if (!fs.existsSync(this._entrypoint)) {
      throw new Error(`Missing entrypoint (${this._entrypoint})!`);
    }

    const envValue = Bun.env.hasOwnProperty(this._prodEnvName)
      ? Bun.env[this._prodEnvName]
      : null;
    switch (envValue) {
      case "prod":
      case "production":
        this._envMode = "production";
        break;

      case "dev":
      case "development":
        this._envMode = "development";
        break;

      default:
        this._envMode = "both";
        break;
    }

    // start total time, timer
    console.time("> Done");
  }

  public get outputFolder() {
    return this._outputFolder;
  }
  public get envMode() {
    return this._envMode;
  }

  private async _copyItem(
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
          fs.cpSync(path.join(inputFile, item), outputFile, {
            recursive: true,
          });
        }
      }
    } else {
      const outputFile = path.join(outputFolder, path.basename(inputFile));
      fs.cpSync(inputFile, outputFile, { recursive: true });
    }
  }

  public async cleanup() {
    if (fs.existsSync(this._outputFolder)) {
      console.time(`Cleaned up old output!`);
      console.log(`Cleaning up old output...`);
      fs.rmSync(this._outputFolder, { recursive: true, force: true });
      fs.mkdirSync(this._outputFolder, { recursive: true });
      console.timeEnd(`Cleaned up old output!`);
      console.log("");
    }
  }

  public async build(
    outputName: string,
    subDir: string = "",
    outputMode: "esm" | "iife" = "iife"
  ) {
    let buildProd = false;
    let buildDev = false;

    outputName = outputName.trim();
    subDir = subDir.trim();

    const jsOutputDir =
      subDir.length > 0
        ? path.join(this._outputFolder, subDir)
        : this._outputFolder;

    switch (this._envMode) {
      case "production":
        buildProd = true;
        break;

      case "development":
        buildDev = true;
        break;

      default:
        buildProd = true;
        buildDev = true;
        break;
    }

    if (buildProd) {
      // Build minified version
      console.time(`Built minified version!`);
      console.log(`Building minified version...`);
      await build({
        entrypoints: ["src/index.ts"],
        outdir: jsOutputDir,
        target: "browser",
        format: "esm", // INFO: should be "iife", but that isn't supported yet
        naming: `[dir]/${outputName}.min.[ext]`,
        splitting: false,
        minify: true,
        plugins: [],
      });
      console.timeEnd(`Built minified version!`);
    }

    if (buildDev) {
      if (buildProd) {
        console.log("");
      }

      // Build non-minified version
      console.time(`Built non-minified version!`);
      console.log(`Building non-minified version...`);
      await build({
        entrypoints: ["src/index.ts"],
        outdir: jsOutputDir,
        target: "browser",
        format: "esm", // INFO: should be "iife", but that isn't supported yet
        naming: `[dir]/${outputName}.[ext]`,
        splitting: false,
        minify: false,
        plugins: [],
      });
      console.timeEnd(`Built non-minified version!`);
    }

    if (outputMode === "iife") {
      // Add IIFE
      console.time(`Added IIFE to the built bundle!`);
      console.log(`\nAdding IIFE to the built bundle...`);

      if (buildProd) {
        let bundleMinifiedSrc = fs.readFileSync(
          path.join(jsOutputDir, `${outputName}.min.js`),
          {
            encoding: "utf-8",
          }
        );

        bundleMinifiedSrc = `(function () {${bundleMinifiedSrc.trim()}})();`;

        fs.writeFileSync(
          path.join(jsOutputDir, `${outputName}.min.js`),
          bundleMinifiedSrc,
          {
            encoding: "utf-8",
          }
        );
      }

      if (buildDev) {
        let bundleNonMinifiedSrc = fs.readFileSync(
          path.join(jsOutputDir, `${outputName}.js`),
          {
            encoding: "utf-8",
          }
        );

        bundleNonMinifiedSrc = `(function () {\n${bundleNonMinifiedSrc.trim()}\n})();`;

        fs.writeFileSync(
          path.join(jsOutputDir, `${outputName}.js`),
          bundleNonMinifiedSrc,
          {
            encoding: "utf-8",
          }
        );
      }

      console.timeEnd(`Added IIFE to the built bundle!`);
    }
  }

  public async compileSass(
    inputFile: string,
    outputName: string,
    subDir: string = ""
  ) {
    outputName = outputName.trim();
    subDir = subDir.trim();

    const cssOutputDir =
      subDir.length > 0
        ? path.join(this._outputFolder, subDir)
        : this._outputFolder;

    if (!fs.existsSync(inputFile)) {
      throw new Error(`Missing input file (${inputFile})!`);
    }

    // Compile SCSS
    console.time(`Compiled ${outputName} SCSS to CSS!`);
    console.log(`\nCompiling ${outputName} SCSS to CSS...`);
    fs.mkdirSync(cssOutputDir, { recursive: true });

    const compileResult = sass.compile(inputFile);
    fs.writeFileSync(
      path.join(cssOutputDir, `${outputName}.css`),
      compileResult.css,
      {
        encoding: "utf-8",
      }
    );
    console.timeEnd(`Compiled ${outputName} SCSS to CSS!`);
  }

  public async copy(...toCopy: string[][]) {
    // Copy relevant files
    console.time(`Copied relevant files to "${this._outputFolder}" directory!`);
    console.log(
      `\nCopying relevant files to "${this._outputFolder}" directory...`
    );

    toCopy = toCopy.filter((item) => item.length > 0);
    for await (const item of toCopy) {
      let inputFile = item[0];
      const subDir = item.length > 1 ? item[1].trim() : "";
      const outputDir =
        subDir.length > 0
          ? path.join(this._outputFolder, subDir)
          : this._outputFolder;
      let ignoreParentFolder = false;

      if (inputFile.endsWith("/*")) {
        inputFile = inputFile.replace(/\/\*$/i, "");
        ignoreParentFolder = true;
      }

      if (!fs.existsSync(inputFile)) {
        throw new Error(`Missing item to copy (${inputFile})!`);
      }

      await this._copyItem(inputFile, outputDir, ignoreParentFolder);
    }
    console.timeEnd(
      `Copied relevant files to "${this._outputFolder}" directory!`
    );
  }

  public async template(inputFile: string, ...replacements: string[][]) {
    // Add data to HTML file
    console.time(`Added data to HTML file!`);
    console.log(`\nAdding data to HTML file...`);

    if (inputFile.trim().toLowerCase().endsWith(".html") === false) {
      throw new Error(
        `Only HTML files can be used as template files (${inputFile})!`
      );
    }

    if (!fs.existsSync(inputFile)) {
      throw new Error(`Missing input file (${inputFile})!`);
    }

    let htmlSrc = fs.readFileSync(inputFile, {
      encoding: "utf-8",
    });

    replacements = replacements.filter((item) => item.length > 0);
    for (const replacement of replacements) {
      if (replacement.length < 2) {
        throw new Error(`Missing replacement value (${replacement[0]})!`);
      }

      htmlSrc = htmlSrc.replace(
        `<!-- BUN:${replacement[0].trim().toUpperCase()} -->`,
        replacement[1].trim()
      );
    }

    fs.writeFileSync(
      path.join(this._outputFolder, path.basename(inputFile)),
      htmlSrc,
      {
        encoding: "utf-8",
      }
    );

    console.timeEnd(`Added data to HTML file!`);
  }

  public async end() {
    console.log("");
    console.timeEnd("> Done");
  }
}

const builder = new Builder(`src/index.ts`, "dist");
await builder.cleanup();
await builder.build("app", "js");
await builder.compileSass(`src/css/app.scss`, "app", "css");
await builder.copy(
  [`public/fonts`, "static"],
  [`public/favicon.ico`],
  [`public/index.html`],
  [`_server files/*`]
);

const cssFile = path.join(builder.outputFolder, "css", "app.css");
const cssFileHash = await getFileHash(cssFile);
let replacements = [
  [
    "metadata",
    `<title>${webTitle}</title>

    <meta name="description" content="${description}" />
    <meta name="version" content="${version}" />

    <link rel="icon" href="./favicon.ico">`,
  ],
  ["css", `<link rel="stylesheet" href="./css/app.css?h=${cssFileHash}" />`],
];

const jsFileProd = path.join(builder.outputFolder, "js", "app.min.js");
const jsFileDev = path.join(builder.outputFolder, "js", "app.js");
const jsFileProdHash = fs.existsSync(jsFileProd)
  ? await getFileHash(jsFileProd)
  : "";
const jsFileDevHash = fs.existsSync(jsFileDev)
  ? await getFileHash(jsFileDev)
  : "";

switch (builder.envMode) {
  case "production":
    replacements.push([
      "js",
      `<script defer="defer" src="./js/${path.basename(
        jsFileProd
      )}?h=${jsFileProdHash}"></script>`,
    ]);
    break;

  case "development":
    replacements.push([
      "js",
      `<script defer="defer" src="./js/${path.basename(
        jsFileDev
      )}?h=${jsFileDevHash}"></script>`,
    ]);
    break;

  default:
    replacements.push([
      "js",
      `<script defer="defer" src="./js/${path.basename(
        jsFileProd
      )}?h=${jsFileProdHash}"></script>`,
    ]);
    replacements.push([
      "js",
      `<script defer="defer" src="./js/${path.basename(
        jsFileDev
      )}?h=${jsFileDevHash}"></script>`,
    ]);
    break;
}

await builder.template(
  path.join(builder.outputFolder, "index.html"),
  ...replacements
);
await builder.end();
