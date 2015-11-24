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

describe('schema', () => {
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
              viewer: {},
              node: {
                name: 'node',
                args: {
                  id: {
                    type: new GraphQLNonNull(GraphQLID)
                  }
                },
                type: {
                  _implementations: [
                    {
                      name: 'Viewer'
                    }
                  ]
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
      expect(fields.query._typeConfig.fields.viewer.type._typeConfig.fields()).to.containSubset({
        qux: {},
        quxs: {}
      });
    });
  });

  describe('getSchema', () => {
    it('should return a GraphQL schema', function getSchemaTest() {
      this.sandbox.stub(model, 'getModels').returns({});
      this.sandbox.stub(type, 'getTypes').returns(types);
      const schema = getSchema([]);
      expect(schema).instanceOf(GraphQLSchema);
      expect(schema._queryType.name).to.be.equal('RootQuery');
      expect(schema._mutationType.name).to.be.equal('RootMutation');
    });

    it('should return a GraphQL schema without mutations', function getSchemaTest() {
      this.sandbox.stub(model, 'getModels').returns({});
      this.sandbox.stub(type, 'getTypes').returns(types);
      const schema = getSchema([], {mutation: false});
      expect(schema).instanceOf(GraphQLSchema);
      expect(schema._queryType.name).to.be.equal('RootQuery');
      expect(schema._mutationType).to.be.equal(undefined);
    });
  });
});
