import { build } from "bun";
import path from "path";
import fs from "fs";

/**
 * @file This Class makes it easier to run Bun's build/bundle command
 * @author Mauritz Nilsson - https://github.com/mauritzn
 * @license MIT
 * @version 0.0.2
 *
 * I wanted to move over a lot of old projects to use Bun,
 * but a lot of code reuse had to occur so the `bundle.ts` file always ended up being massive.
 * As such I decided to create a Class to aid in this, this Class provides a lot of helpful tools as well.
 *
 * Features:
 *  - Old output cleanup
 *  - SASS compiler
 *  - Copy files/folders to output folder
 *  - Generate HTML source links for CSS and JS (with file hashes for better cache support)
 *  - Replace markers in HTML templates, for adding HTML source links, dynamic titles, etc.
 */

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

export class BunBuilder {
  private _entrypoint: string;
  private _outputFolder: string;
  private _prodEnvName: string;
  private _envMode: "production" | "development" | "both" = "both";
  private _sassCompiler;
  private _sassCompileSupported = false;

  constructor(
    entrypoint: string,
    outputFolder: string,
    prodEnvName: string = "NODE_ENV"
  ) {
    this._entrypoint = entrypoint;
    this._outputFolder = outputFolder;
    this._prodEnvName = prodEnvName.trim();
    this._sassCompiler = function (
      path: string,
      options?: SassOptions<"sync">
    ): CompileResult {
      return { css: "", loadedUrls: [] };
    };

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

  public async resolvePath(file: string): Promise<string> {
    return path.join(this._outputFolder, file);
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

  public async addSassCompiler(compiler: any) {
    this._sassCompiler = compiler;
    this._sassCompileSupported = true;
  }

  public async compileSass(
    inputFile: string,
    outputName: string,
    subDir: string = ""
  ) {
    if (!this._sassCompileSupported) {
      throw new Error(
        `Missing SASS compiler (add it using the "addSassCompiler" method)!`
      );
    }

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

    const compileResult = this._sassCompiler(inputFile);
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

  public async generateFileReplacement(
    inputFile: string,
    subDir: string = "",
    marker: string = ""
  ): Promise<string[]> {
    marker = marker.trim();
    const inputFileExt = path
      .extname(inputFile)
      .toLowerCase()
      .replaceAll(".", "")
      .trim();
    const outputDir =
      subDir.length > 0
        ? path.join(this._outputFolder, subDir)
        : this._outputFolder;
    const publicPath = `./${
      subDir.length > 0 ? path.join(subDir, inputFile) : inputFile
    }`;
    const inputFilePath = path.join(outputDir, inputFile);

    if (!fs.existsSync(inputFilePath)) {
      throw new Error(
        `Given input file could not be found (${inputFilePath})!`
      );
    }

    const fileHash = await getFileHash(inputFilePath);
    switch (inputFileExt) {
      case "css":
        return [
          marker.length > 0 ? marker : "css",
          `<link rel="stylesheet" href="${publicPath}?h=${fileHash}" />`,
        ];

      case "js":
        return [
          marker.length > 0 ? marker : "js",
          `<script defer="defer" src="${publicPath}?h=${fileHash}"></script>`,
        ];

      default:
        throw new Error(
          `Only "css, js" files are support currently (input type: ${inputFileExt})!`
        );
    }
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

  // Run at end to get a final build time
  public async end() {
    console.log("");
    console.timeEnd("> Done");
  }
}

// SASS interfaces
type OutputStyle = "expanded" | "compressed";
interface SassOptions<sync extends "sync" | "async"> {
  alertAscii?: boolean;
  alertColor?: boolean;
  charset?: boolean;
  functions?: any;
  importers?: any;
  loadPaths?: string[];
  logger?: any;
  quietDeps?: boolean;
  sourceMap?: boolean;
  sourceMapIncludeSources?: boolean;
  style?: OutputStyle;
  verbose?: boolean;
}
interface CompileResult {
  css: string;
  loadedUrls: URL[];
  sourceMap?: RawSourceMap;
}
interface StartOfSourceMap {
  file?: string;
  sourceRoot?: string;
}
interface RawSourceMap extends StartOfSourceMap {
  version: string;
  sources: string[];
  names: string[];
  sourcesContent?: string[];
  mappings: string;
}
