import { expect } from 'chai';
import { getProjection } from './utils';

describe('utils', () => {
  describe('projection', () => {
    it('should provide the mongoose projection object', () => {
      const projection = getProjection({
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

      expect(projection).to.be.eql({
        foo: 1,
        bar: 1
      });
    });

    it('should support inline fragments', () => {
      const projection = getProjection({
        selectionSet: {
          selections: [{
            kind: "InlineFragment",
            selectionSet: {
              selections: [{
                kind: 'Field',
                name: {
                  value: 'foo'
                }
              }]
            }
          }, {
            kind: "Field",
            name: {
              value: 'bar'
            }
          }]
        }
      });

      expect(projection).to.be.eql({
        foo: 1,
        bar: 1
      })
    });
  });
});
