const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = (env, argv) => {
  const isProd = argv.mode === 'production';

  return {
    entry: './src/core/index.js',

    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: isProd ? 'jampolls.min.js' : 'jampolls.js',
      library: {
        name: 'JamPolls',
        type: 'umd',
        export: 'default',
      },
      globalObject: 'this',
      clean: true,
    },

    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                ['@babel/preset-env', { targets: '> 1%, last 2 versions, not IE 11' }],
              ],
            },
          },
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader'],
        },
      ],
    },

    optimization: isProd
      ? {
          minimize: true,
          minimizer: [
            new TerserPlugin({
              terserOptions: {
                compress: { drop_console: true, drop_debugger: true },
                mangle: { reserved: ['JamPolls'] },
                format: { comments: false },
              },
              extractComments: false,
            }),
          ],
        }
      : {},

    devtool: isProd ? false : 'source-map',

    devServer: {
      static: { directory: path.join(__dirname, '.') },
      compress: true,
      port: 8080,
      open: true,
    },
  };
};