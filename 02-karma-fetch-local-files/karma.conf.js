module.exports = function(config) {
  config.set({
    frameworks: ['mocha'],
    browsers: ['Chrome'],
    concurrency: 1,
    singleRun: true,
    logLevel: config.LOG_INFO,
    
    plugins: [
      'karma-chrome-launcher',
      'karma-mocha',
      'karma-webpack'
    ],
    
    files: [
      './test/**/*.js',
      { pattern: 'test.txt', watched: false, included: false, served: true, nocache: false }
    ],
    preprocessors: {
      './test/**/*.js': ['webpack']
    },
    reporters: ['progress']
  });
};

