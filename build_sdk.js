const path = require('path');
const webpack = require('./node_modules/webpack');
const config = {
  entry: './src/core/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'jampolls.min.js',
    library: { name: 'JamPolls', type: 'umd', export: 'default' },
    globalObject: 'this',
    clean: true,
  },
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: { loader: path.resolve(__dirname, 'node_modules/babel-loader'), options: { presets: [[path.resolve(__dirname, 'node_modules/@babel/preset-env'), { targets: '> 1%, last 2 versions' }]] } }
      },
      { test: /\.css$/, use: [path.resolve(__dirname, 'node_modules/style-loader'), path.resolve(__dirname, 'node_modules/css-loader')] },
    ],
  },
  optimization: { minimize: false },
};
webpack(config, (err, stats) => {
  if (err) { process.stderr.write('Fatal: ' + err.message + '\n'); process.exit(1); }
  process.stdout.write(stats.toString({ errors: true, assets: true, modules: false, colors: false }) + '\n');
  process.exit(stats.hasErrors() ? 1 : 0);
});
