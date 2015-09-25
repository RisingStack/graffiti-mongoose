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

    expect(treeChunk).to.be.eql({
      foo: {
        name: 'foo',
        path: 'foo',
        fullPath: 'User.foo',
        indexed: false,
        instance: 'Object',
        caster: {
          fields: {
            bar: {
              name: 'bar',
              path: 'foo.bar',
              fullPath: 'User.foo.bar',
              indexed: false,
              instance: 'Object',
              caster: {
                fields: {
                  so: {
                    name: 'so',
                    path: 'foo.bar.so',
                    instance: 'String',
                    indexed: false
                  }
                }
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
        path: 'foo',
        fullPath: 'User.foo',
        indexed: false,
        instance: 'Object',
        caster: {
          fields: {
            bar: {
              name: 'bar',
              path: 'foo.bar',
              fullPath: 'User.foo.bar',
              indexed: false,
              instance: 'Object',
              caster: {
                fields: {
                  so: {
                    name: 'so',
                    path: 'foo.bar.so',
                    indexed: false
                  },
                  very: {
                    name: 'very',
                    path: 'foo.bar.very',
                    indexed: false
                  }
                }
              }
            },
            grr: {
              name: 'grr',
              path: 'foo.grr',
              indexed: false
            }
          }
        }
      },
      simple: {
        name: 'simple',
        path: 'simple',
        indexed: false
      },
      sub: {
        name: 'sub',
        path: 'sub',
        fullPath: 'User.sub',
        indexed: false,
        instance: 'Object',
        caster: {
          fields: {
            sub: {
              name: 'sub',
              path: 'sub.sub',
              indexed: false
            }
          }
        }
      }
    });
  });
});
