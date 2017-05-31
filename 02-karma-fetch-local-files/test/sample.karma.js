import assert from 'assert';

import stringLength from '../src/sample';

describe('sample', function() {
  describe('searchText', function() {
    it('test', function(done) {
      var len = -1;
      fetch('../base/test.txt')
        .then(function(response) {
          response
            .text()
            .then(function(content) {
              len = stringLength(content);
            });
        });
      setTimeout(function() {
        assert.deepEqual(len, 6);
        done();
      }, 1900);
    });
  });
});

