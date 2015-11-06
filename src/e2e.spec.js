import {expect} from 'chai';

import {getSchema, graphql} from './';
import User from '../fixture/user';

describe('e2e', () => {
  describe('get schema', () => {
    let motherUser;
    let user1;
    let user2;
    const schema = getSchema([User]);

    beforeEach(async function BeforeEach() {
      motherUser = new User({
        name: 'Mother',
        age: 54
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
        objectIds: [user1._id]
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
                name: 'Mother'
              },
              friends: {
                edges: [{
                  node: {
                    _id: user1._id.toString(),
                    name: 'Foo'
                  }
                }]
              },
              objectIds: [user1._id.toString()]
            }
          }
        });
      });

      describe('with fragments', () => {
        it('should support fragments', async function Test() {
          // FIXME it fails in node {}
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
        const result = await graphql(schema, `{
          users(age: 28) {
            _id
            name
            age
          }
        }`);

        expect(result.data.users).to.deep.include.members([
          {
            _id: user1._id.toString(),
            name: 'Foo',
            age: 28
          }, {
            _id: user2._id.toString(),
            name: 'Bar',
            age: 28
          }
        ]);
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

        const {id, users} = result.data.viewer;
        expect(id).to.be.ok; // eslint-disable-line
        expect(users.count).to.be.equal(3);

        expect(users.edges).to.containSubset([
          {node: {name: 'Mother'}},
          {node: {name: 'Foo'}},
          {node: {name: 'Bar'}}
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

        const {users} = result.data.viewer;
        expect(users.count).to.be.eql(1);

        expect(users.edges).to.containSubset([
          {node: {name: 'Foo'}}
        ]);
      });
    });

    describe('mutations', () => {
      it('should add data to the database', async function Test() {
        const result = await graphql(schema, `
          mutation addUserMutation {
            addUser(input: {name: "Test User", clientMutationId: "1"}) {
              changedUserEdge {
                node {
                  _id
                  name
                }
              }
            }
          }
        `);

        const node = result.data.addUser.changedUserEdge.node;
        expect(typeof node._id).to.be.equal('string');
        expect(node.name).to.be.equal('Test User');
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
              changedUser {
                name
              }
            }
          }
        `);
        expect(result).to.containSubset({
          data: {
            updateUser: {
              changedUser: {
                name: 'Updated Test User'
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
        const {id} = result.data.addUser.changedUserEdge.node;

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
  });
});
