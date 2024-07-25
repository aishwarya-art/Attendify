const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { GenerateSW } = require('workbox-webpack-plugin');

module.exports = {
  entry: './index.web.js',
  output: {
    path: path.resolve(__dirname, 'web-build'),
    filename: 'bundle.js'
  },
  resolve: {
    alias: {
      'react-native$': 'react-native-web'
    },
    extensions: ['.web.js', '.js', '.ts', '.tsx']
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: /node_modules/,
        use: 'babel-loader'
      },
      
      {
        test: /\.css$/,  // Add this rule for CSS files
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
      filename: 'index.html'
    }),
    new GenerateSW({
      clientsClaim: true,
      skipWaiting: true,
      maximumFileSizeToCacheInBytes: 10 * 1024 * 1024, // 5 MB
    }),
  ],
  devServer: {
    contentBase: path.join(__dirname, 'web-build'),
    compress: true,
    port: 9000,
    historyApiFallback: true
  },
  mode: 'development'
};
