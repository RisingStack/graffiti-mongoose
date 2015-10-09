import {expect} from 'chai';
import {extractPath, extractPaths} from './';

describe('model', () => {
  it('should extract tree chunk from path', () => {
    const treeChunk = extractPath({
      path: 'foo.bar.so',
      instance: 'String'
    }, {
      name: 'User'
    });

    expect(treeChunk).to.containSubset({
      foo: {
        name: 'foo',
        nonNull: false,
        type: 'Object',
        fields: {
          bar: {
            name: 'bar',
            nonNull: false,
            type: 'Object',
            fields: {
              so: {
                name: 'so',
                type: 'String',
                nonNull: false
              }
            }
          }
        }
      }
    });
  });

  it('should extract tree from paths', () => {
    const tree = extractPaths({
      'foo.bar.so': {
        path: 'foo.bar.so'
      },
      'foo.bar.very': {
        path: 'foo.bar.very'
      },
      'foo.grr': {
        path: 'foo.grr'
      },
      simple: {
        path: 'simple'
      },
      'sub.sub': {
        path: 'sub.sub'
      }
    }, {
      name: 'User'
    });

    expect(tree).to.containSubset({
      foo: {
        name: 'foo',
        nonNull: false,
        type: 'Object',
        fields: {
          bar: {
            name: 'bar',
            nonNull: false,
            type: 'Object',
            fields: {
              so: {
                name: 'so',
                nonNull: false
              },
              very: {
                name: 'very',
                nonNull: false
              }
            }
          },
          grr: {
            name: 'grr',
            nonNull: false
          }
        }
      },
      simple: {
        name: 'simple',
        nonNull: false
      },
      sub: {
        name: 'sub',
        nonNull: false,
        type: 'Object',
        fields: {
          sub: {
            name: 'sub',
            nonNull: false
          }
        }
      }
    });
  });
});
