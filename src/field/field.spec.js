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
  getQueryField,
  getMutationField,
  getFields,
  getSchema
} from './';
import query from '../query';
import model from '../model';
import type from '../type';

describe('field', () => {
  const types = {
    Qux: new GraphQLObjectType({
      name: 'Qux',
      fields: () => ({
        bar: {
          name: 'bar',
          type: GraphQLString
        },
        baz: {
          name: 'baz',
          type: GraphQLID
        }
      })
    })
  };

  describe('getQueryField', () => {
    it('should return a singular and a plural query field', function getQueryFieldTest() {
      this.sandbox.stub(query, 'getOneResolver').returns(() => {});
      this.sandbox.stub(query, 'getListResolver').returns(() => {});

      const graphQLType = types.Qux;
      const fields = getQueryField({Qux: {model: {}}}, graphQLType);
      expect(fields).to.containSubset({
        qux: {
          type: graphQLType,
          args: {
            id: {
              type: new GraphQLNonNull(GraphQLID)
            }
          }
        },
        quxs: {
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

  describe('getMutationField', () => {
    it('should return an addXyz and an updateXyz field', function getMutationFieldTest() {
      this.sandbox.stub(query, 'getAddOneMutateHandler').returns(() => {});
      this.sandbox.stub(query, 'getUpdateOneMutateHandler').returns(() => {});
      const graphQLType = types.Qux;
      const fields = getMutationField({Qux: {model: {}}}, graphQLType);
      const args = {
        input: {}
      };
      expect(fields).to.containSubset({
        addQux: {
          args
        },
        updateQux: {
          args
        }
      });
      expect(fields.addQux.args.input.type.ofType._typeConfig.fields).to.containSubset({
        bar: {
          name: 'bar',
          type: GraphQLString
        },
        baz: {
          name: 'baz',
          type: GraphQLID
        }
      });
    });
  });

  describe('getFields', () => {
    it('should return query fields ; including node(id!)', function getFieldsTest() {
      this.sandbox.stub(type, 'getTypes').returns(types);
      const fields = getFields({});
      expect(fields).to.containSubset({
        query: {
          name: 'RootQuery',
          _typeConfig: {
            fields: {
              qux: {},
              quxs: {},
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
        },
        mutation: {
          name: 'RootMutation',
          _typeConfig: {
            fields: {
              addQux: {},
              updateQux: {}
            }
          }
        }
      });
    });
  });

  describe('getSchema', () => {
    it('should return a GraphQL schema', function getSchemaTest() {
      this.sandbox.stub(model, 'getModels').returns({});
      this.sandbox.stub(type, 'getTypes').returns(types);
      const schema = getSchema([]);
      expect(schema).instanceOf(GraphQLSchema);
      expect(schema._schemaConfig.query.name).to.be.equal('RootQuery');
      expect(schema._schemaConfig.mutation.name).to.be.equal('RootMutation');
    });
  });
});
