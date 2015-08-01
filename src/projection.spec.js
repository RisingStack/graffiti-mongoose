import {expect} from 'chai';
import {getProjection} from './projection';

describe('utils', () => {
  describe('projection', () => {
    it('should provide the mongoose projection object', () => {
      const projectionResult = getProjection({
        selectionSet: {
          selections: [{
            kind: 'Field',
            name: {
              value: 'foo'
            }
          }, {
            kind: 'Field',
            name: {
              value: 'bar'
            }
          }]
        }
      });

      expect(projectionResult).to.be.eql({
        foo: 1,
        bar: 1
      });
    });

    // TODO: see related method
    it('should support fragments');

    it('should support inline fragments', () => {
      const projectionResult = getProjection({
        selectionSet: {
          selections: [{
            kind: 'InlineFragment',
            selectionSet: {
              selections: [{
                kind: 'Field',
                name: {
                  value: 'foo'
                }
              }]
            }
          }, {
            kind: 'Field',
            name: {
              value: 'bar'
            }
          }]
        }
      });

      expect(projectionResult).to.be.eql({
        foo: 1,
        bar: 1
      });
    });
  });
});
