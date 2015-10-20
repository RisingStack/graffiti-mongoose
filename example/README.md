### Running the example

```shell
cd graffiti-mongoose
npm install # install dependencies in the main folder
cd example
npm install # install dependencies in the example folder
npm start # run the example application and open your browser: http://localhost:8080
```

### Mongoose schema

```javascript
const UserSchema = new mongoose.Schema({
  name: {
    type: String
  },
  age: {
    type: Number,
    index: true
  },
  createdAt: Date,
  friends: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  nums: [Number],
  bools: [Boolean],
  strings: [String],
  removed: Boolean,

  body: {
    eye: String,
    hair: Number
  }
});

const User = mongoose.model('User', UserSchema);
```

### Example queries

##### _Singular query on a type_

* arguments: `id: ID!`

```
query UserQuery {
  user(id: "VXNlcjo1NjI2MzgwZTU2NWQ2Y2E3NGUzNzc3ZmI=") {
    id
    name
    friends(first: 5) {
      count
      edges {
        cursor
        node {
          id
          name
          friends {
            count
          }
        }
      }
      pageInfo {
        startCursor
        endCursor
        hasPreviousPage
        hasNextPage
      }
    }
  }
}
```
```json
{
  "data": {
    "user": {
      "id": "VXNlcjo1NjI2MzgwZTU2NWQ2Y2E3NGUzNzc3ZmI=",
      "name": "User38",
      "friends": {
        "count": 38,
        "edges": [
          {
            "cursor": "Y29ubmVjdGlvbi41NjI2MzgwZTU2NWQ2Y2E3NGUzNzc3ZDU=",
            "node": {
              "id": "VXNlcjo1NjI2MzgwZTU2NWQ2Y2E3NGUzNzc3ZDU=",
              "name": "User0",
              "friends": {
                "count": 0
              }
            }
          },
          {
            "cursor": "Y29ubmVjdGlvbi41NjI2MzgwZTU2NWQ2Y2E3NGUzNzc3ZDY=",
            "node": {
              "id": "VXNlcjo1NjI2MzgwZTU2NWQ2Y2E3NGUzNzc3ZDY=",
              "name": "User1",
              "friends": {
                "count": 1
              }
            }
          },
          {
            "cursor": "Y29ubmVjdGlvbi41NjI2MzgwZTU2NWQ2Y2E3NGUzNzc3ZDc=",
            "node": {
              "id": "VXNlcjo1NjI2MzgwZTU2NWQ2Y2E3NGUzNzc3ZDc=",
              "name": "User2",
              "friends": {
                "count": 2
              }
            }
          },
          {
            "cursor": "Y29ubmVjdGlvbi41NjI2MzgwZTU2NWQ2Y2E3NGUzNzc3ZDg=",
            "node": {
              "id": "VXNlcjo1NjI2MzgwZTU2NWQ2Y2E3NGUzNzc3ZDg=",
              "name": "User3",
              "friends": {
                "count": 3
              }
            }
          },
          {
            "cursor": "Y29ubmVjdGlvbi41NjI2MzgwZTU2NWQ2Y2E3NGUzNzc3ZDk=",
            "node": {
              "id": "VXNlcjo1NjI2MzgwZTU2NWQ2Y2E3NGUzNzc3ZDk=",
              "name": "User4",
              "friends": {
                "count": 4
              }
            }
          }
        ],
        "pageInfo": {
          "startCursor": "Y29ubmVjdGlvbi41NjI2MzgwZTU2NWQ2Y2E3NGUzNzc3ZDU=",
          "endCursor": "Y29ubmVjdGlvbi41NjI2MzgwZTU2NWQ2Y2E3NGUzNzc3ZDk=",
          "hasPreviousPage": true,
          "hasNextPage": true
        }
      }
    }
  }
}
```

##### _Singular query on node_

* arguments: `id: ID!`

```
query NodeQuery {
  user(id: "VXNlcjo1NjI2MzgwZTU2NWQ2Y2E3NGUzNzc3ZmI=") {
    id
    ... on User {
      name
      friends(first: 5) {
        count
        edges {
          cursor
          node {
            id
            name
            friends {
              count
            }
          }
        }
        pageInfo {
          startCursor
          endCursor
          hasPreviousPage
          hasNextPage
        }
      }
    }
  }
}
```
```json
{
  "data": {
    "node": {
      "id": "VXNlcjo1NjI2MzgwZTU2NWQ2Y2E3NGUzNzc3ZmI=",
      "name": "User38",
      "friends": {
        "count": 38,
        "edges": [
          {
            "cursor": "Y29ubmVjdGlvbi41NjI2MzgwZTU2NWQ2Y2E3NGUzNzc3ZDU=",
            "node": {
              "id": "VXNlcjo1NjI2MzgwZTU2NWQ2Y2E3NGUzNzc3ZDU=",
              "name": "User0",
              "friends": {
                "count": 0
              }
            }
          },
          {
            "cursor": "Y29ubmVjdGlvbi41NjI2MzgwZTU2NWQ2Y2E3NGUzNzc3ZDY=",
            "node": {
              "id": "VXNlcjo1NjI2MzgwZTU2NWQ2Y2E3NGUzNzc3ZDY=",
              "name": "User1",
              "friends": {
                "count": 1
              }
            }
          },
          {
            "cursor": "Y29ubmVjdGlvbi41NjI2MzgwZTU2NWQ2Y2E3NGUzNzc3ZDc=",
            "node": {
              "id": "VXNlcjo1NjI2MzgwZTU2NWQ2Y2E3NGUzNzc3ZDc=",
              "name": "User2",
              "friends": {
                "count": 2
              }
            }
          },
          {
            "cursor": "Y29ubmVjdGlvbi41NjI2MzgwZTU2NWQ2Y2E3NGUzNzc3ZDg=",
            "node": {
              "id": "VXNlcjo1NjI2MzgwZTU2NWQ2Y2E3NGUzNzc3ZDg=",
              "name": "User3",
              "friends": {
                "count": 3
              }
            }
          },
          {
            "cursor": "Y29ubmVjdGlvbi41NjI2MzgwZTU2NWQ2Y2E3NGUzNzc3ZDk=",
            "node": {
              "id": "VXNlcjo1NjI2MzgwZTU2NWQ2Y2E3NGUzNzc3ZDk=",
              "name": "User4",
              "friends": {
                "count": 4
              }
            }
          }
        ],
        "pageInfo": {
          "startCursor": "Y29ubmVjdGlvbi41NjI2MzgwZTU2NWQ2Y2E3NGUzNzc3ZDU=",
          "endCursor": "Y29ubmVjdGlvbi41NjI2MzgwZTU2NWQ2Y2E3NGUzNzc3ZDk=",
          "hasPreviousPage": true,
          "hasNextPage": true
        }
      }
    }
  }
}
```

___

##### _Plural query on a type_

* arguments: `id: [ID], ids: [ID], name: String, age: Float, createdAt: Date, removed: Boolean, _id: ID`

```
query UsersQuery {
  users {
    id
    name
    age
    body {
      eye
    }
    createdAt
  }
}
```
```json
{
  "data": {
    "users": [
      {
        "id": "VXNlcjo1NjI0Zjg3Y2ZmZTZmZDMwMzM1NjQ1NDM=",
        "name": "User0",
        "age": 0,
        "body": {
          "eye": "blue"
        },
        "createdAt": "2015-10-19T14:04:44.000Z"
      },
      {
        "id": "VXNlcjo1NjI0Zjg3Y2ZmZTZmZDMwMzM1NjQ1NDQ=",
        "name": "User1",
        "age": 1,
        "body": {
          "eye": "blue"
        },
        "createdAt": "2015-10-19T14:04:44.000Z"
      },
      {
        "id": "VXNlcjo1NjI0Zjg3Y2ZmZTZmZDMwMzM1NjQ1NDU=",
        "name": "User2",
        "age": 2,
        "body": {
          "eye": "blue"
        },
        "createdAt": "2015-10-19T14:04:44.000Z"
      },
      {
        "id": "VXNlcjo1NjI0Zjg3Y2ZmZTZmZDMwMzM1NjQ1NDY=",
        "name": "User3",
        "age": 3,
        "body": {
          "eye": "blue"
        },
        "createdAt": "2015-10-19T14:04:44.000Z"
      },
      {
        "id": "VXNlcjo1NjI0Zjg3Y2ZmZTZmZDMwMzM1NjQ1NDc=",
        "name": "User4",
        "age": 4,
        "body": {
          "eye": "blue"
        },
        "createdAt": "2015-10-19T14:04:44.000Z"
      }
    ]
  }
}
```

##### _Singular query on viewer_

```
query ViewerUserQuery {
	viewer {
    user(id: "VXNlcjo1NjI2MzgwZTU2NWQ2Y2E3NGUzNzc3ZGM=") {
      name
      age
      friends {
        count
      }
    }
  }
}
```
```json
{
  "data": {
    "viewer": {
      "user": {
        "name": "User7",
        "age": 7,
        "friends": {
          "count": 7
        }
      }
    }
  }
}
```

##### _Plural query on viewer_

```
query ViewerUsersQuery {
	viewer {
    users(first: 5, after: "Y29ubmVjdGlvbi41NjI0Zjg3Y2ZmZTZmZDMwMzM1NjQ1NDU=") {
			edges {
        cursor
        node {
          id
          name
          friends {
            count
          }
        }
      }
      pageInfo {
        startCursor
        endCursor
        hasPreviousPage
        hasNextPage
      }
    }
  }
}
```
```json
{
  "data": {
    "viewer": {
      "users": {
        "edges": [
          {
            "cursor": "Y29ubmVjdGlvbi41NjI0Zjg3Y2ZmZTZmZDMwMzM1NjQ1NDY=",
            "node": {
              "id": "VXNlcjo1NjI0Zjg3Y2ZmZTZmZDMwMzM1NjQ1NDY=",
              "name": "User3",
              "friends": {
                "count": 3
              }
            }
          },
          {
            "cursor": "Y29ubmVjdGlvbi41NjI0Zjg3Y2ZmZTZmZDMwMzM1NjQ1NDc=",
            "node": {
              "id": "VXNlcjo1NjI0Zjg3Y2ZmZTZmZDMwMzM1NjQ1NDc=",
              "name": "User4",
              "friends": {
                "count": 4
              }
            }
          },
          {
            "cursor": "Y29ubmVjdGlvbi41NjI0Zjg3Y2ZmZTZmZDMwMzM1NjQ1NDg=",
            "node": {
              "id": "VXNlcjo1NjI0Zjg3Y2ZmZTZmZDMwMzM1NjQ1NDg=",
              "name": "User5",
              "friends": {
                "count": 5
              }
            }
          },
          {
            "cursor": "Y29ubmVjdGlvbi41NjI0Zjg3Y2ZmZTZmZDMwMzM1NjQ1NDk=",
            "node": {
              "id": "VXNlcjo1NjI0Zjg3Y2ZmZTZmZDMwMzM1NjQ1NDk=",
              "name": "User6",
              "friends": {
                "count": 6
              }
            }
          },
          {
            "cursor": "Y29ubmVjdGlvbi41NjI0Zjg3Y2ZmZTZmZDMwMzM1NjQ1NGE=",
            "node": {
              "id": "VXNlcjo1NjI0Zjg3Y2ZmZTZmZDMwMzM1NjQ1NGE=",
              "name": "User7",
              "friends": {
                "count": 7
              }
            }
          }
        ],
        "pageInfo": {
          "startCursor": "Y29ubmVjdGlvbi41NjI0Zjg3Y2ZmZTZmZDMwMzM1NjQ1NDY=",
          "endCursor": "Y29ubmVjdGlvbi41NjI0Zjg3Y2ZmZTZmZDMwMzM1NjQ1NGE=",
          "hasPreviousPage": true,
          "hasNextPage": true
        }
      }
    }
  }
}
```

##### _Add mutation_

* arguments: `input: addUserInput!{
  name: String,
  age: Float,
  createdAt: Date,
  friends: [ID],
  nums: [Float],
  bools: [Boolean],
  strings: [String],
  removed: Boolean,
  clientMutationId: String!
  }`

```
mutation AddUser {
  addUser(input: {clientMutationId: "1", name: "Test", bools: [true, false], friends: ["56264133565d6ca74e377841"]}) {
    changedUserEdge {
      cursor
      node {
        _id
        id
        name
        bools
        friends {
          count
        }
      }
    }
  }
}
```
```json
{
  "data": {
    "addUser": {
      "changedUserEdge": {
        "cursor": "Y29ubmVjdGlvbi51bmRlZmluZWQ=",
        "node": {
          "_id": "56264152565d6ca74e377843",
          "id": "VXNlcjo1NjI2NDE1MjU2NWQ2Y2E3NGUzNzc4NDM=",
          "name": "Test",
          "bools": [
            true,
            false
          ],
          "friends": {
            "count": 1
          }
        }
      }
    }
  }
}
```

##### _Update mutation_

* arguments: `input: updateUserInput!{
  name: String,
  age: Float,
  createdAt: Date,
  friends: [ID],
  nums: [Float],
  bools: [Boolean],
  strings: [String],
  removed: Boolean,
  id: ID!,
  clientMutationId: String!
  }`

```
mutation UpdateUser {
	updateUser(input: {clientMutationId: "1", id: "VXNlcjo1NjI2NDE1MjU2NWQ2Y2E3NGUzNzc4NDM=", name: "New Name"}) {
    changedUser {
      id
      name
      createdAt
    }
  }
}
```
```json
{
  "data": {
    "updateUser": {
      "changedUser": {
        "id": "VXNlcjo1NjI2NDE1MjU2NWQ2Y2E3NGUzNzc4NDM=",
        "name": "New Name",
        "createdAt": null
      }
    }
  }
}
```

##### _Delete mutation_

* arguments: `input: deleteUserInput!{
  id: ID!,
  clientMutationId: String!
  }`

```
mutation DeleteUser {
  deleteUser(input: {clientMutationId: "3", id: "VXNlcjo1NjI2NDE1MjU2NWQ2Y2E3NGUzNzc4NDM="}) {
    id
    viewer {
      users {
        count
      }
    }
  }
}
```
```json
{
  "data": {
    "deleteUser": {
      "id": "VXNlcjo1NjI2NDE1MjU2NWQ2Y2E3NGUzNzc4NDM=",
      "viewer": {
        "users": {
          "count": 206
        }
      }
    }
  }
}
```
