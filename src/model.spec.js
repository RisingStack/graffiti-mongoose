import {expect} from 'chai';
import {extractPath, extractPaths} from './model';

describe('model', () => {
  it('should extract tree chunk from path', () => {
    var treeChunk = extractPath({
      path: 'foo.bar.so',
      instance: 'String'
    });

    expect(treeChunk).to.be.eql({
      foo: {
        path: 'foo',
        indexed: false,
        name: 'foo',
        instance: 'Object',
        caster: {
          bar: {
            path: 'foo.bar',
            indexed: false,
            name: 'bar',
            instance: 'Object',
            caster: {
              so: {
                path: 'foo.bar.so',
                indexed: false,
                name: 'so',
                instance: 'String'
              }
            }
          }
        }
      }
    });
  });

  it('should extract tree from paths', () => {
    var tree = extractPaths({
      'foo.bar.so': {
        path: 'foo.bar.so'
      },
      'foo.bar.very': {
        path: 'foo.bar.very'
      },
      'foo.grr': {
        path: 'foo.grr'
      },
      'simple': {
        path: 'simple'
      },
      'sub.sub': {
        path: 'sub.sub'
      },
    });

    expect(tree).to.containSubset({
      foo: {
        caster: {
          bar: {
            caster: {
              so: {
                path: 'foo.bar.so',
                indexed: false,
                name: 'so'
              },
              very: {
                path: 'foo.bar.very',
                indexed: false,
                name: 'very'
              }
            }
          },
          grr: {
            path: 'foo.grr',
            indexed: false,
            name: 'grr'
          }
        },
      },
      simple: {
        path: 'simple',
        indexed: false,
        name: 'simple'
      },
      sub: {
        caster: {
          sub: {
            path: 'sub.sub',
            indexed: false,
            name: 'sub'
          }
        }
      }
    });
  });
});
