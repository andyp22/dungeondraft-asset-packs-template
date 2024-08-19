/* eslint-disable */
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const ESLintPlugin = require("eslint-webpack-plugin");
const path = require("path");

module.exports = (env) => {
  const defaults = {
    watch: false,
    mode: "development",
  };

  const environment = { ...defaults, ...env };
  const isDevelopment = environment.mode === "development";

  const config = {
    entry: "./src/index.ts",
    watch: environment.watch,
    devtool: "inline-source-map",
    stats: "minimal",
    mode: environment.mode,
    resolve: {
      extensions: [".wasm", ".mjs", ".ts", ".js", ".json"],
      fallback: { path: require.resolve("path-browserify") },
    },
    output: {
      filename: "dd_object_tagger.js",
      path: path.resolve(__dirname, "dist"),
      publicPath: "",
    },
    devServer: {
      hot: true,
      writeToDisk: true,
      proxy: [
        {
          context: (pathname) => {
            return !pathname.match("^/sockjs");
          },
          target: "http://localhost:30000",
          ws: true,
        },
      ],
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          use: ["ts-loader", "webpack-import-glob-loader", "source-map-loader"],
        },
      ],
    },
    target: "node",
    plugins: [
      new CleanWebpackPlugin(),
      new ESLintPlugin({
        extensions: ["ts"],
      }),
      new CopyPlugin({
        patterns: [
          {
            from: "static",
            noErrorOnMissing: true,
          },
        ],
      }),
    ],
  };

  if (!isDevelopment) {
    delete config.devtool;
  }

  return config;
};
