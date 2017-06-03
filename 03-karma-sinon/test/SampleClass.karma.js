import assert from 'assert';
import sinon from 'sinon';

import SampleClass from '../src/SampleClass';

describe('SampleClass', () => {
  describe('sumAppleAndOrange', () => {
    it('jsonにappleとorangeのキーがあれば、sumArrayが2回呼ばれる', done => {
      let sample = new SampleClass();
      
      let stub = sinon.stub(sample, 'fetchJson');
      stub.returns(Promise.resolve('{ "apple": [1, 2], "orange": [3, 4] }'));
      
      let spy = sinon.spy(sample, 'sumArray');

      sample.sumAppleAndOrange()
        .then(sumValue => {
          assert(spy.calledTwice);
          done();
        })
        .catch(() => {
          // if failed to assert, do nothing -> timeout and fail test
        });
    });
  });
});

