module.exports = {
  context: __dirname + '/src',
  entry: {
    'application': './application',
  },
  output: {
    path: __dirname + '/dist',
    filename: 'app.js'
  },
  module: {
    loaders: [
      { 
        test: /\.js$/, 
        exclude: /node_modules/, 
        loader: "babel-loader", 
        query:{
          presets: ['es2015', 'es2016']
        }
      }
    ]
  }
};

