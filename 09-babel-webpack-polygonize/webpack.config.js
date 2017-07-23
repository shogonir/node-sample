var HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  context: __dirname + '/src',
  devtool: 'inline-source-map',
  entry: {
    'entry': './entry',
  },
  output: {
    path: __dirname + '/dist',
    filename: 'output.js',
    library: 'library'
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: "babel-loader",
        query: {
          presets: ['es2015', 'es2016', 'es2017'],
          plugins: [
            "transform-class-properties",
            "transform-flow-strip-types"
          ]
        }
      },
      {
        test: /\.json$/,
        loader: 'json-loader'
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      //filename: 'index.html',
      template: '../html/index.html'
    })
  ]
};
