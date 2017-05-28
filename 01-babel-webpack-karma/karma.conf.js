module.exports = function(config) {
  config.set({
    frameworks: ['mocha'],
    browsers: ['Chrome'],
    singleRun: true,
    logLevel: config.LOG_INFO,
    
    plugins: [
      'karma-chrome-launcher',
      'karma-coverage-istanbul-reporter',
      'karma-mocha',
      'karma-webpack',
      'istanbul-instrumenter-loader'
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
          },
          {
            loader: 'istanbul-instrumenter-loader',
            exclude: /node_modules/,
            include: /src/,
            enforce: 'post'
          }
        ]
      }
    },
    
    reporters: ['progress', 'coverage-istanbul'],
    coverageIstanbulReporter: {
      reports: ['text-summary']
    }
  });
};

