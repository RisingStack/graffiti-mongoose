/* eslint-disable no-unused-expressions */

import { expect } from 'chai';
import { spy } from 'sinon';

import { getSchema, graphql } from './';
import User from '../fixture/user';

describe('e2e', () => {
  describe('get schema', () => {
    let motherUser;
    let user1;
    let user2;
    let schema;
    let hooks;
    before(() => {
      hooks = {
        viewer: {
          pre: spy(),
          post: spy()
        },
        singular: {
          pre: spy(),
          post: spy()
        },
        plural: {
          pre: spy(),
          post: spy()
        },
        mutation: {
          pre: spy(),
          post: spy()
        }
      };
      schema = getSchema([User], { hooks });
    });

    beforeEach(async function BeforeEach() {
      motherUser = new User({
        name: 'Mother',
        age: 54,
        bools: [true, true]
      });

      await motherUser.save();

      user1 = new User({
        name: 'Foo',
        age: 28
      });

      await user1.save();

      user2 = new User({
        name: 'Bar',
        age: 28,
        mother: motherUser._id,
        friends: [user1._id],
        objectIds: [user1._id],
        sub: {
          subref: motherUser._id
        }
      });

      await user2.save();
    });

    afterEach(async function AfterEach() {
      await [motherUser.remove(), user1.remove(), user2.remove()];
    });

    describe('singular query', () => {
      it('should get data from database by id', async function Test() {
        const result = await graphql(schema, `{
          user(id: "${user2._id}") {
            _id
            name
            age
            mother {
              _id
              name
              bools
            }
            friends {
              edges {
                node {
                  _id
                  name
                }
              }
            }
            objectIds
            sub {
              subref {
                name
              }
            }
          }
        }`);

        expect(result).to.be.eql({
          data: {
            user: {
              _id: user2._id.toString(),
              name: 'Bar',
              age: 28,
              mother: {
                _id: motherUser._id.toString(),
                name: 'Mother',
                bools: [false, false]
              },
              friends: {
                edges: [{
                  node: {
                    _id: user1._id.toString(),
                    name: 'Foo'
                  }
                }]
              },
              objectIds: [user1._id.toString()],
              sub: {
                subref: {
                  name: 'Mother'
                }
              }
            }
          }
        });
      });

      describe('with fragments', () => {
        it('should support fragments', async function Test() {
          const result = await graphql(schema, `
            query GetUser {
              user(id: "${user2._id}") {
                ...UserFragment
                friends {
                  count
                  edges {
                    node {
                      ...UserFragment
                    }
                  }
                }
              }
            }
            fragment UserFragment on User {
              _id
              name
              age
            }
          `);

          expect(result).to.be.eql({
            data: {
              user: {
                _id: user2._id.toString(),
                name: 'Bar',
                age: 28,
                friends: {
                  count: 1,
                  edges: [{
                    node: {
                      _id: user1._id.toString(),
                      name: 'Foo',
                      age: 28
                    }
                  }]
                }
              }
            }
          });
        });

        it('should support inline fragments', async function Test() {
          const result = await graphql(schema, `{
            user(id: "${user2._id}") {
              _id
              name,
              ... on User {
                age
              }
            }
          }`);

          expect(result).to.be.eql({
            data: {
              user: {
                _id: user2._id.toString(),
                name: 'Bar',
                age: 28
              }
            }
          });
        });
      });
    });

    describe('plural query', () => {
      it('should get data from database and filter by number', async function Test() {
        let result = await graphql(schema, `{
          users(age: 28) {
            _id
            name
            age
          }
        }`);

        const expected = [
          {
            _id: user1._id.toString(),
            name: 'Foo',
            age: 28
          }, {
            _id: user2._id.toString(),
            name: 'Bar',
            age: 28
          }
        ];

        expect(result.data.users).to.deep.include.members(expected);

        result = await graphql(schema, `{
          users(id: ["${user1._id.toString()}", "${user2._id.toString()}"]) {
            _id
            name
            age
          }
        }`);

        expect(result.data.users).to.deep.include.members(expected);

        result = await graphql(schema, `{
          users(ids: ["${user1._id.toString()}", "${user2._id.toString()}"]) {
            _id
            name
            age
          }
        }`);

        expect(result.data.users).to.deep.include.members(expected);
      });

      it('should get data from database and filter by array of _id(s)', async function Test() {
        const result = await graphql(schema, `{
          users(id: ["${user1._id}", "${user2._id}"]) {
            _id
          }
        }`);

        expect(result).to.be.eql({
          data: {
            users: [{
              _id: user1._id.toString()
            }, {
              _id: user2._id.toString()
            }]
          }
        });
      });

      it('should support viewer field', async function Test() {
        const result = await graphql(schema, `{
          viewer {
            id
            users {
              count
              edges {
                cursor
                node {
                  name
                }
              }
            }
          }
        }`);

        const { id, users } = result.data.viewer;
        expect(id).to.be.ok;
        expect(users.count).to.be.equal(3);

        expect(users.edges).to.containSubset([
          { node: { name: 'Mother' } },
          { node: { name: 'Foo' } },
          { node: { name: 'Bar' } }
        ]);
      });

      it('should filter connections by arguments', async function Test() {
        const result = await graphql(schema, `{
          viewer {
            users(name: "Foo") {
              count
              edges {
                node {
                  name
                }
              }
            }
          }
        }`);

        const { users } = result.data.viewer;
        expect(users.count).to.be.eql(1);

        expect(users.edges).to.containSubset([
          { node: { name: 'Foo' } }
        ]);
      });

      it('should return results in ascending order', async function Test() {
        let result = await graphql(schema, `{
          viewer {
            users(orderBy: NAME_ASC) {
              edges {
                node {
                  name
                }
              }
            }
          }
       }`);

        expect(result.data.viewer.users.edges).to.be.eql([
          { node: { name: 'Bar' } },
          { node: { name: 'Foo' } },
          { node: { name: 'Mother' } }
        ]);

        result = await graphql(schema, `{
          users(orderBy: NAME_ASC) {
            name
          }
        }`);

        expect(result.data.users).to.be.eql([
          { name: 'Bar' },
          { name: 'Foo' },
          { name: 'Mother' }
        ]);
      });

      it('should return results in descending order', async function Test() {
        let result = await graphql(schema, `{
          viewer {
            users(orderBy: NAME_DESC) {
              edges {
                node {
                  name
                }
              }
            }
          }
       }`);

        expect(result.data.viewer.users.edges).to.be.eql([
          { node: { name: 'Mother' } },
          { node: { name: 'Foo' } },
          { node: { name: 'Bar' } }
        ]);

        result = await graphql(schema, `{
          users(orderBy: NAME_DESC) {
            name
          }
        }`);

        expect(result.data.users).to.be.eql([
          { name: 'Mother' },
          { name: 'Foo' },
          { name: 'Bar' }
        ]);
      });

      it('should be able to limit the ordered results', async function Test() {
        const result = await graphql(schema, `{
          viewer {
            users(orderBy: NAME_DESC, first: 2) {
              edges {
                node {
                  name
                }
              }
            }
          }
        }`);

        expect(result.data.viewer.users.edges).to.be.eql([
          { node: { name: 'Mother' } },
          { node: { name: 'Foo' } }
        ]);
      });

      it('should be able to paginate the ordered results', async function Test() {
        let result = await graphql(schema, `{
          viewer {
            users(orderBy: NAME_DESC) {
              edges {
                cursor
                node {
                  name
                }
              }
            }
          }
        }`);

        const edges1 = result.data.viewer.users.edges;
        const cursor = edges1[0].cursor;

        result = await graphql(schema, `{
          viewer {
            users(orderBy: NAME_DESC, after: "${cursor}", first: 1) {
              edges {
                cursor
                node {
                  name
                }
              }
            }
          }
        }`);

        const edges2 = result.data.viewer.users.edges;
        expect(edges2.length).to.eql(1);
        expect(edges2).to.eql(edges1.slice(1, 2));
      });
    });

    describe('mutations', () => {
      it('should add data to the database', async function Test() {
        let result = await graphql(schema, `
          mutation addUserMutation {
            addUser(input: {name: "Test User", clientMutationId: "1"}) {
              changedUserEdge {
                node {
                  id
                  _id
                  name
                }
              }
            }
          }
        `);

        const node = result.data.addUser.changedUserEdge.node;
        const { id } = node;
        expect(typeof node._id).to.be.equal('string');
        expect(node.name).to.be.equal('Test User');

        result = await graphql(schema, `
          mutation addUserMutation {
            addUser(input: {name: "Test User", friends: ["${id}"], mother: "${id}", clientMutationId: "2"}) {
              changedUserEdge {
                node {
                  id
                }
              }
            }
          }
        `);

        expect(result.errors).not.to.be.ok;
      });

      it('should update data', async function Test() {
        let result = await graphql(schema, `
          mutation addUserMutation {
            addUser(input: {name: "Test User", clientMutationId: "1"}) {
              changedUserEdge {
                node {
                  _id
                }
              }
            }
          }
        `);
        const id = result.data.addUser.changedUserEdge.node._id;

        result = await graphql(schema, `
          mutation updateUserMutation {
            updateUser(input: {id: "${id}", name: "Updated Test User", clientMutationId: "2"}) {
              clientMutationId
              changedUser {
                name
                friends {
                  count
                }
              }
            }
          }
        `);
        expect(result).to.containSubset({
          data: {
            updateUser: {
              clientMutationId: '2',
              changedUser: {
                name: 'Updated Test User',
                friends: {
                  count: 0
                }
              }
            }
          }
        });

        result = await graphql(schema, `
          mutation updateUserMutation {
            updateUser(input: {id: "${id}", friends_add: ["${id}"], clientMutationId: "3"}) {
              clientMutationId
              changedUser {
                name
                friends {
                  count
                }
              }
            }
          }
        `);
        expect(result).to.containSubset({
          data: {
            updateUser: {
              clientMutationId: '3',
              changedUser: {
                friends: {
                  count: 1
                }
              }
            }
          }
        });
      });

      it('should delete data', async function Test() {
        let result = await graphql(schema, `
          mutation addUserMutation {
            addUser(input: {name: "Test User", clientMutationId: "1"}) {
              changedUserEdge {
                node {
                  id
                }
              }
            }
          }
        `);
        const { id } = result.data.addUser.changedUserEdge.node;

        result = await graphql(schema, `
          mutation deleteUserMutation {
            deleteUser(input: {id: "${id}", clientMutationId: "2"}) {
              id
              ok
              clientMutationId
            }
          }
        `);
        expect(result).to.containSubset({
          data: {
            deleteUser: {
              id,
              ok: true,
              clientMutationId: '2'
            }
          }
        });
      });
    });

    describe('hooks', () => {
      it('should call viewer hooks on a viewer query', async function () {
        const { pre, post } = hooks.viewer;
        pre.reset();
        post.reset();

        expect(pre.called).to.be.false;
        expect(post.called).to.be.false;
        await graphql(schema, `{
          viewer {
            users {
              count
            }
          }
        }`);
        expect(pre.called).to.be.true;
        expect(post.called).to.be.true;
      });

      it('should call singular hooks on a singular query', async function () {
        const { pre, post } = hooks.singular;
        pre.reset();
        post.reset();

        expect(pre.called).to.be.false;
        expect(post.called).to.be.false;
        await graphql(schema, `{
          user(id: "${user2._id}") {
            _id
          }
        }`);
        expect(pre.called).to.be.true;
        expect(post.called).to.be.true;
      });

      it('should call plural hooks on a plural query', async function () {
        const { pre, post } = hooks.plural;
        pre.reset();
        post.reset();

        expect(pre.called).to.be.false;
        expect(post.called).to.be.false;
        await graphql(schema, `{
          users(age: 28) {
            _id
          }
        }`);
        expect(pre.called).to.be.true;
        expect(post.called).to.be.true;
      });

      it('should call mutation hooks on a mutation', async function () {
        const { pre, post } = hooks.mutation;
        pre.reset();
        post.reset();

        expect(pre.called).to.be.false;
        expect(post.called).to.be.false;
        await graphql(schema, `
          mutation addUserMutation {
            addUser(input: {name: "Test User", clientMutationId: "1"}) {
              changedUserEdge {
                node {
                  id
                }
              }
            }
          }
        `);
        expect(pre.called).to.be.true;
        expect(post.called).to.be.true;
      });
    });
  });
});
