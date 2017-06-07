import assert from 'assert';

import stringLength from '../src/sample';

describe('sample', function() {
  describe('searchText', function() {
    it('test', function(done) {
      fetch('base/test.txt')
        .then(function(response) {
          if (!response.ok) {
            throw new Error(response.statusText);
          }
          return response.text();
        })
        .then(function(content) {
          assert.deepEqual(stringLength(content), 6);
          done();
        })
        .catch(function(error) {
          console.log(error.message);
        });
    });
  });
});

