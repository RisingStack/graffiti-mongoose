import { expect } from 'chai';
import {
  graphql,
  GraphQLSchema,
  GraphQLObjectType
} from 'graphql';

import GraphQLGeneric from './generic';

class Unknown {
  constructor(field) {
    this.field = field;
  }
}

describe('GraphQL generic type', () => {
  it('should coerse generic object to string', () => {
    const unknown = new Unknown('foo');
    expect(GraphQLGeneric.serialize(unknown)).to.equal('{\'field\':\'foo\'}');
  });

  it('should stringifiy generic types', async function () {
    const unknown = new Unknown('bar');

    const schema = new GraphQLSchema({
      query: new GraphQLObjectType({
        name: 'Query',
        fields: {
          foo: {
            type: GraphQLGeneric,
            resolve: () => unknown
          }
        }
      })
    });

    return expect(
      await graphql(schema, '{ foo }')
    ).to.deep.equal({
      data: {
        foo: GraphQLGeneric.serialize(unknown)
      }
    });
  });

  it('should handle null', async function () {
    const unknown = null;

    const schema = new GraphQLSchema({
      query: new GraphQLObjectType({
        name: 'Query',
        fields: {
          foo: {
            type: GraphQLGeneric,
            resolve: () => unknown
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

  it('should handle generic types as input', async function () {
    const schema = new GraphQLSchema({
      query: new GraphQLObjectType({
        name: 'Query',
        fields: {
          foo: {
            type: GraphQLGeneric,
            args: {
              bar: {
                type: GraphQLGeneric
              }
            },
            resolve: (_, { bar }) => new Unknown(`${bar.field}-qux`)
          }
        }
      })
    });

    const unknown = GraphQLGeneric.serialize(new Unknown('baz'));

    return expect(
      await graphql(schema, `{ foo(bar: "${unknown}") }`)
    ).to.deep.equal({
      data: {
        foo: unknown.replace('baz', 'baz-qux')
      }
    });
  });
});
