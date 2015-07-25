import {getProjection} from './utils';
import {expect} from 'chai';

describe('utils', () => {
  describe('projection', () => {
    it('should provide the mongoose projection object', () => {
      var projection = getProjection({
        selectionSet: {
          selections: [{
            name: {
              value: 'foo'
            }
          }, {
            name: {
              value: 'bar'
            }
          }]
        }
      });

      expect(projection).to.be.eql({
        foo: 1,
        bar: 1
      });
    });
  });
});
