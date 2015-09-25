import {expect} from 'chai';
import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLNonNull,
  GraphQLID,
  GraphQLSchema
} from 'graphql';
import {
  getField,
  getFields,
  getSchema
} from './';
import query from '../query';
import model from '../model';

describe('field', () => {
  const graffitiModels = {
    Foo: {
      name: 'Foo',
      fields: {
        bar: {
          name: 'bar',
          type: GraphQLString
        },
        baz: {
          name: 'baz',
          type: new GraphQLObjectType({name: 'baz'})
        }
      }
    }
  };

  describe('getField', () => {
    it('should return a singular and a plural query field', function getFieldTest() {
      this.sandbox.stub(query, 'getOneResolver').returns(() => {});
      this.sandbox.stub(query, 'getListResolver').returns(() => {});

      const graffitiModel = {
        name: 'foo'
      };

      const model = Object.assign({}, graffitiModels.Foo);
      model.fields = () => graffitiModels.Foo.fields;
      const graphQLType = new GraphQLObjectType(model);

      const fields = getField(graffitiModel, graphQLType);
      expect(fields).to.containSubset({
        foo: {
          type: graphQLType,
          args: {
            id: {
              type: new GraphQLNonNull(GraphQLID)
            }
          }
        },
        foos: {
          type: new GraphQLList(graphQLType),
          args: {
            bar: {
              name: 'bar',
              type: GraphQLString
            }
          }
        }
      });
    });
  });

  describe('getFields', () => {
    it('should return query fields ; including node(id!)', function getFieldsTest() {
      this.sandbox.stub(model, 'getModels').returns(graffitiModels);
      const fields = getFields([]);
      expect(fields).to.containSubset({
        query: {
          name: 'RootQuery',
          _typeConfig: {
            fields: {
              foo: {},
              foos: {},
              node: {
                name: 'node',
                args: {
                  id: {
                    type: new GraphQLNonNull(GraphQLID)
                  }
                }
              }
            }
          }
        }
      });
    });
  });

  describe('getSchema', () => {
    it('should return a GraphQL schema', function getSchemaTest() {
      this.sandbox.stub(model, 'getModel').returns(graffitiModels);
      const schema = getSchema([]);
      expect(schema).instanceOf(GraphQLSchema);
      expect(schema._schemaConfig.query.name).to.be.equal('RootQuery');
    });
  });
});
