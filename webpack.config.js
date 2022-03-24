const path = require('path');
const webpack = require('webpack');
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  entry: {
    content: './src/content/index.tsx',
    background: './src/background/background.ts',
    // background: './src/background/index.tsx',
    // popup: './src/popup/index.tsx'
  },
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
  ],
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
  },
  optimization: {
      minimize: false
  },
};
