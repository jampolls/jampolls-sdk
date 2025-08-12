const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';
  
  return {
    entry: './src/core/jampolls.js',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: isProduction ? 'jampolls.min.js' : 'jampolls.js',
      library: 'JamPolls',
      libraryTarget: 'umd',
      globalObject: 'this',
      clean: true // Clean dist folder before each build
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
                ['@babel/preset-env', {
                  targets: {
                    browsers: ['> 1%', 'last 2 versions', 'not dead']
                  }
                }]
              ]
            }
          }
        },
        {
          test: /\.css$/,
          use: [
            'style-loader', // Injects CSS into the DOM
            'css-loader'    // Processes CSS imports
          ]
        }
      ]
    },
    resolve: {
      extensions: ['.js', '.css']
    },
    optimization: isProduction ? {
      minimize: true,
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            compress: {
              drop_console: true,        // Remove console.logs in production
              drop_debugger: true        // Remove debugger statements
            },
            mangle: {
              reserved: ['JamPolls']     // Don't mangle the main export
            },
            format: {
              comments: false            // Remove comments
            }
          },
          extractComments: false         // Don't create separate license file
        })
      ]
    } : {},
    devtool: isProduction ? false : 'source-map',
    
    // Development server config (optional)
    devServer: {
      static: {
        directory: path.join(__dirname, '.'),
      },
      compress: true,
      port: 8080,
      open: true,
      hot: true
    }
  };
};