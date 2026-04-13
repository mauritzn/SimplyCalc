import { BunBuilder } from "./BunBuilder";
import { webTitle, description, version } from "../package.json";

const builder = new BunBuilder(`src/index.ts`, "dist");
await builder.cleanup();
await builder.build("app", "js");
await builder.copy(
  [`public/fonts`, "static"],
  [`public/favicon.ico`],
  [`public/index.html`],
  [`src/css`],
  [`_server files/*`],
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
  await builder.generateFileReplacement("css"),
  await builder.generateFileReplacement(
    `app${builder.envMode === "production" ? ".min" : ""}.js`,
    "js",
  ),
);

await builder.end();
