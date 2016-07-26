import { expect } from 'chai';
import {
  graphql,
  GraphQLSchema,
  GraphQLObjectType
} from 'graphql';

import GraphQlDate from './date';

describe('GraphQL date type', () => {
  it('should coerse date object to string', () => {
    const aDateStr = '2015-07-24T10:56:42.744Z';
    const aDateObj = new Date(aDateStr);

    expect(
      GraphQlDate.serialize(aDateObj)
    ).to.equal(aDateStr);
  });

  it('should stringifiy dates', async () => {
    const now = new Date();

    const schema = new GraphQLSchema({
      query: new GraphQLObjectType({
        name: 'Query',
        fields: {
          now: {
            type: GraphQlDate,
            resolve: () => now
          }
        }
      })
    });

    return expect(
      await graphql(schema, '{ now }')
    ).to.deep.equal({
      data: {
        now: now.toJSON()
      }
    });
  });

  it('should handle null', async () => {
    const now = null;

    const schema = new GraphQLSchema({
      query: new GraphQLObjectType({
        name: 'Query',
        fields: {
          now: {
            type: GraphQlDate,
            resolve: () => now
          }
        }
      })
    });

    return expect(
      await graphql(schema, '{ now }')
    ).to.deep.equal({
      data: {
        now: null
      }
    });
  });

  it('should fail when now is not a date', async () => {
    const now = 'invalid date';

    const schema = new GraphQLSchema({
      query: new GraphQLObjectType({
        name: 'Query',
        fields: {
          now: {
            type: GraphQlDate,
            resolve: () => now
          }
        }
      })
    });

    return expect(
      await graphql(schema, '{ now }')
    ).to.containSubset({
      errors: [
        {
          message: 'Field error: value is not an instance of Date'
        }
      ]
    });
  });

  describe('input', () => {
    const schema = new GraphQLSchema({
      query: new GraphQLObjectType({
        name: 'Query',
        fields: {
          nextDay: {
            type: GraphQlDate,
            args: {
              date: {
                type: GraphQlDate
              }
            },
            resolve: (_, { date }) => new Date(date.getTime() + (24 * 3600 * 1000))
          }
        }
      })
    });

    it('should handle dates as input', async () => {
      const someday = '2015-07-24T10:56:42.744Z';
      const nextDay = '2015-07-25T10:56:42.744Z';

      return expect(
        await graphql(schema, `{ nextDay(date: "${someday}") }`)
      ).to.deep.equal({
        data: {
          nextDay
        }
      });
    });

    it('should not accept alternative date formats', async () => {
      const someday = 'Fri Jul 24 2015 12:56:42 GMT+0200 (CEST)';

      return expect(
        await graphql(schema, `{ nextDay(date: "${someday}") }`)
      ).to.containSubset({
        errors: [
          {
            locations: [],
            message: 'Query error: Invalid date format, only accepts: YYYY-MM-DDTHH:MM:SS.SSSZ'
          }
        ]
      });
    });

    it('should choke on invalid dates as input', async () => {
      const invalidDate = 'invalid data';

      return expect(
        await graphql(schema, `{ nextDay(date: "${invalidDate}") }`)
      ).to.containSubset({
        errors: [
          {
            locations: [],
            message: 'Query error: Invalid date'
          }
        ]
      });
    });
  });
});
