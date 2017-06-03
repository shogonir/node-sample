module.exports = function(config) {
  config.set({
    frameworks: ['mocha'],
    browsers: ['Chrome'],
    singleRun: true,
    logLevel: config.LOG_INFO,
    
    plugins: [
      'karma-chrome-launcher',
      'karma-mocha',
      'karma-webpack'
    ],
    
    files: [
      './test/**/*.js'
    ],
    preprocessors: {
      './test/**/*.js': ['webpack']
    },
    
    webpack: {
      module: {
        loaders: [
          {
            loader: 'babel-loader',
            exclude: /node_modules/,
            query: {
              presets: ['es2015', 'es2016']
            }
          }
        ]
      }
    },
    
    reporters: ['progress']
  });
};

