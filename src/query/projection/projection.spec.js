import { expect } from 'chai';
import getFieldList from './';

describe('projection', () => {
  it('should return an object of fields (\'Field\' fragment)', () => {
    const info = {
      fieldNodes: {
        kind: 'Field',
        name: { value: 'foo' },
        selectionSet: {
          selections: [{
            kind: 'Field',
            name: { value: 'bar' },
            selectionSet: {
              selections: [{
                kind: 'Field',
                name: { value: 'baz' }
              }]
            }
          }]
        }
      }
    };
    const fields = getFieldList(info);
    expect(fields).to.be.eql({
      bar: true,
      baz: true
    });
  });

  it('should return an object of fields (\'InlineFragment\' fragment)');
  it('should return an object of fields (\'FragmentSpread\' fragment)');
});
