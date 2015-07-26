<a name="1.0.0"></a>
# 1.0.0 (2015-07-26)


### chore

* chore(gitignore): add .gitignore file to the project
 2a487bc
* chore(guidelines): add CONTRIBUTING guideline to the project
 2454eaf
* chore(listing): add ESLint to the project
 af7b481
* chore(pre-commit): add tests to pre-commit hooks
 9cb77df
* chore(project): rename project to "graffiti-mongoose"
 f32eef0
* chore(project): rename project to "graffiti-mongoose"
 4595266

### docs

* docs(read): add JavaScript style to README example
 7ccacf3
* docs(read): improve model style in README
 26cc456
* docs(readme): add example to the README
 9ac02ef
* docs(readme): add mongoose link to the README
 b13621e
* docs(readme): add ref example to the README
 270feec
* docs(readme): add test section to the README
 a469f40

### feat

* feat(schema): add schema file to project
 ab94cba
* feat(schema): add support for Number, Boolean and Date types
 a07767c
* feat(schema): change getSchema's interface to handle array of mongoose models
 2b62c48
* feat(schema): filter plural resource by array of _id -s
 bf0a94d
* feat(schema): support array of dates type
 2ba9738
* feat(schema): support array of primitives
 9e6a439
* feat(schema): support plural queries
 edca7e0

### fix

* fix(schema): change query interface for singular resource
 3de8b59
* fix(schema): handle float like numbers
 f40f5d9
* fix(schema): rename query argument "id" to "_id"
 fc4350c

### style

* style(schema): add TODO comments
 e71a187

### test

* test(schema): add test skeleton
 16e0fa0
* test(schema): add unit tests for simple queries
 d3a652a
* test(schema): cover Date, String, Number and Boolean types with tests
 00ec7d9
* test(schema): cover projection with unit tests
 f5fb7d4


### BREAKING CHANGE

* array of models instead of objects

* query argument "id" rename to "_id"

* user resource name instead of "findOneResource"



