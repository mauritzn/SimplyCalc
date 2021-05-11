const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CleanTerminalPlugin = require("clean-terminal-webpack-plugin");

const webpackMode =
  String(process.env.NODE_ENV).trim() === "production"
    ? "production"
    : "development";

module.exports = {
  target: "web",
  mode: webpackMode === "production" ? "production" : "development",
  entry: "./src/index.ts",
  output: {
    filename: "js/[name]-[contenthash].js",
    chunkFilename: "js/chunk-[chunkhash].js",
    path: path.resolve(__dirname, "dist"),
    publicPath: "./",
    clean: true,
  },
  watch: webpackMode === "production" ? false : true,
  watchOptions: {
    ignored: "**/node_modules",
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          /* // fallback to style-loader in development
          webpackMode !== "production"
            ? "style-loader"
            : MiniCssExtractPlugin.loader, */

          MiniCssExtractPlugin.loader,
          "css-loader", // Translates CSS into CommonJS
          "sass-loader", // Compiles Sass to CSS
        ],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: "asset/resource",
        generator: {
          filename: "static/[hash][ext]",
        },
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: "asset/resource",
        generator: {
          filename: "static/[hash][ext]",
        },
      },
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new CleanTerminalPlugin({ onlyInWatchMode: true }),
    new HtmlWebpackPlugin({
      title: "SimplyCalc",
      favicon: path.resolve(__dirname, "public/favicon.ico"),
      template: path.resolve(__dirname, "public/index.html"), // Load a custom template (lodash by default)
    }),
    new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
      // both options are optional
      filename: "[name]-[contenthash].css",
      chunkFilename: "chunk-[chunkhash].css",
    }),
  ],
};
