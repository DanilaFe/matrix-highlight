const path = require('path');
const webpack = require('webpack');
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const WebextensionPlugin = require("@webextension-toolbox/webpack-webextension-plugin").default;
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  entry: {
    content: './src/content/index.tsx',
    background: './src/background/background.ts',
    standalone: {
      import: './src/standalone/standalone.tsx',
      library: { name: 'matrixHighlight', type: 'window' },
    },
  },
  // https://stackoverflow.com/questions/54542737/webpack-4-build-bricks-csp-with-unsafe-eval
  devtool: "source-map",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
          test: /\.css$/i,
          use: 'css-loader',
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          // Creates `style` nodes from JS strings
          {
            loader: "style-loader",
            options: {
              styleTagTransform: function (css, style) {
                style.innerHTML = css;
                if (!window._matrixHighlightStyleNodes) {
                  window._matrixHighlightStyleNodes = [];
                }
                window._matrixHighlightStyleNodes.unshift(style);
              },
              injectType: "styleTag",
            }
          },
          // Translates CSS into CommonJS
          "css-loader",
          // Compiles Sass to CSS
          "sass-loader",
        ],
      },
    ],
  },
  plugins: [
    new NodePolyfillPlugin(),
    new CopyPlugin({ patterns: [ { from: "public", to: "." }]}),
    new webpack.ProvidePlugin({
      XMLHttpRequest: 'xhr-shim'
    }),
    new WebextensionPlugin({
      vendor: 'chrome',
    })
  ],
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
  },
  optimization: {
    // Replacing default minification because of https://stackoverflow.com/questions/49979397/chrome-says-my-content-script-isnt-utf-8
    minimize: true,
    minimizer: [
      new TerserPlugin({
        parallel: true,
        terserOptions: {
          ecma: 6,
          output: {
            ascii_only: true
          },
        },
      }),
    ],
  },
};
