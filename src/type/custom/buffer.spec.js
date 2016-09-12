import { expect } from 'chai';
import {
  graphql,
  GraphQLSchema,
  GraphQLObjectType
} from 'graphql';

import GraphQLBuffer from './buffer';

describe('GraphQL buffer type', () => {
  it('should coerse buffer object to string', () => {
    const buffer = new Buffer('foo');
    expect(GraphQLBuffer.serialize(buffer)).to.equal('foo');
  });

  it('should stringifiy buffers', async function () {
    const buffer = new Buffer('bar');

    const schema = new GraphQLSchema({
      query: new GraphQLObjectType({
        name: 'Query',
        fields: {
          foo: {
            type: GraphQLBuffer,
            resolve: () => buffer
          }
        }
      })
    });

    return expect(
      await graphql(schema, '{ foo }')
    ).to.deep.equal({
      data: {
        foo: buffer.toString()
      }
    });
  });

  it('should handle null', async function () {
    const buffer = null;

    const schema = new GraphQLSchema({
      query: new GraphQLObjectType({
        name: 'Query',
        fields: {
          foo: {
            type: GraphQLBuffer,
            resolve: () => buffer
          }
        }
      })
    });

    return expect(
      await graphql(schema, '{ foo }')
    ).to.deep.equal({
      data: {
        foo: null
      }
    });
  });

  it('should handle buffers as input', async function () {
    const schema = new GraphQLSchema({
      query: new GraphQLObjectType({
        name: 'Query',
        fields: {
          foo: {
            type: GraphQLBuffer,
            args: {
              bar: {
                type: GraphQLBuffer
              }
            },
            resolve: (_, { bar }) => new Buffer(`${bar.toString()}-qux`)
          }
        }
      })
    });

    const buffer = 'baz';
    const bufferBar = 'baz-qux';

    return expect(
      await graphql(schema, `{ foo(bar: "${buffer}") }`)
    ).to.deep.equal({
      data: {
        foo: bufferBar
      }
    });
  });
});
