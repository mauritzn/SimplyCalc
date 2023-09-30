import { BunBuilder } from "./BunBuilder";
import { compile as sassCompiler } from "sass";
import { webTitle, description, version } from "../package.json";

const builder = new BunBuilder(`src/index.ts`, "dist");
await builder.cleanup();
await builder.build("app", "js");
await builder.addSassCompiler(sassCompiler);
await builder.compileSass(`src/css/app.scss`, "app", "css");
await builder.copy(
  [`public/fonts`, "static"],
  [`public/favicon.ico`],
  [`public/index.html`],
  [`_server files/*`]
);

await builder.template(
  await builder.resolvePath("index.html"),
  [
    "metadata",
    `<title>${webTitle}</title>

    <meta name="description" content="${description}" />
    <meta name="version" content="${version}" />

    <link rel="icon" href="./favicon.ico">`,
  ],
  await builder.generateFileReplacement("app.css", "css"),
  await builder.generateFileReplacement(
    `app${builder.envMode === "production" ? ".min" : ""}.js`,
    "js"
  )
);

await builder.end();
