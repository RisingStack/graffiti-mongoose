## Graffiti Model

```javascript
{
  Name: {
    name: String!,
    description: String?,
    fields: {
      fieldName: {
        name: String? // default: key
        description: String?,
        nonNull: Boolean?, // required?
        hidden: Boolean? // included in the GraphQL schema
        hooks: {
          pre: (Function|Array<Function>)?
          post: (Function|Array<Function>)?
        }?
        type: String('String'|'Number'|'Date'|'Buffer'|'Boolean'|'ObjectID'|'Object'|'Array'),
        // if type == Array
        subtype: String('String'|'Number'|'Date'|'Buffer'|'Boolean'|'ObjectID'|'Object'|'Array'),
        // if type == Object
        fields: {
          // ...
        },
        // if type == ObjectID
        reference: String!
      }
    }
  }
}
```
