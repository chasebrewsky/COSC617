const path = require('path');
const MiniCSSExtractPlugin = require('mini-css-extract-plugin');


module.exports = env => {
  const prod = env === 'production';

  return {
    mode: prod ? 'production' : 'development',
    devtool: 'inline-source-map',
    entry: path.resolve(__dirname, 'client', 'index.js'),
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'js/app.js',
    },
    plugins: [
      new MiniCSSExtractPlugin({
        filename: 'css/styles.css',
      })
    ],
    module: {
      rules: [
        {
          test: /\.jsx?$/,
          // include: path.resolve(__dirname, 'client'),
          use: [
            {
              loader: 'babel-loader',
              options: {
                presets: [
                  ['@babel/preset-env', {'targets': 'defaults'}],
                  '@babel/preset-react',
                ],
              }
            }
          ],
        },
        {
          test: /\.css$/,
          // include: path.resolve(__dirname, 'client'),
          use: [
            prod ? MiniCSSExtractPlugin.loader : 'style-loader',
            'css-loader',
            {
              loader: 'postcss-loader',
              options: {
                postcssOptions: {
                  plugins: [require('postcss-preset-env')],
                }
              }
            }
          ],
        }
      ],
    }
  }
};
