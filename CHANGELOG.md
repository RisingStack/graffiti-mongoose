<a name="1.0.4"></a>
## 1.0.4 (2015-07-27)


### chore

* chore(package): bump version to 1.0.4
 09ddbbc
* chore(package): remove unused dependencies
 42fa4ac



<a name="1.0.3"></a>
## 1.0.3 (2015-07-27)


### chore

* chore(package): bump version to 1.0.3
 5971779

### refactor

* refactor(schema): remove mongoose from schema to avoid conflicts
 8a37235



<a name="1.0.2"></a>
## 1.0.2 (2015-07-27)


### chore

* chore(build): publish built version to npm
 77769dc
* chore(package): bumping version to 1.0.2
 9137431
* chore(package): update description
 0f929df



<a name="1.0.1"></a>
## 1.0.1 (2015-07-27)


### chore

* chore(changelog): update CHANGELOG.md
 b106ae1
* chore(ci): integrate TravisCI via config file
 833833d
* chore(npmignore): add .npmignore file to project
 fd76552
* chore(package): add keywords and fix license
 71713ad
* chore(package): bump version to 1.0.1
 ee6448c



<a name="1.0.0"></a>
# 1.0.0 (2015-07-27)


### chore

* chore(changelog): add CHANGELOG file
 2550e0b
* chore(changelog): update CHANGELOG
 3cc3e48
* chore(changelog): update changelog
 c002cad
* chore(ci): integrate TravisCI via config file
 833833d
* chore(gitignore): add .gitignore file to the project
 2a487bc
* chore(guidelines): add CONTRIBUTING guideline to the project
 88837cf
* chore(license): add LICENSE file to the project
 d97609e
* chore(listing): add ESLint to the project
 6068476
* chore(pre-commit): add tests to pre-commit hooks
 e498710
* chore(project): rename project to "graffiti-mongo"
 7c9141a
* chore(project): rename project to "graffiti-mongoose"
 b5e1e3e

### docs

* docs(read): add JavaScript style to README example
 880fdcd
* docs(read): improve model style in README
 c57d83e
* docs(readme): Add supported types and queries to the README
 c1ff505
* docs(readme): add example to the README
 bb49bda
* docs(readme): add mongoose link to the README
 61dcfb3
* docs(readme): add ref example to the README
 ff12c36
* docs(readme): add test section to the README
 6d5b04d

### feat

* feat(schema): add schema file to project
 ab94cba
* feat(schema): add support for Number, Boolean and Date types
 a07767c
* feat(schema): add support for filtering plural resource by indexed fields
 1debcdd
* feat(schema): add support for filtering singular resource by indexed fields
 805753a
* feat(schema): change getSchema's interface to handle array of mongoose models
 2b62c48
* feat(schema): filter plural resource by array of _id -s
 26e642f
* feat(schema): support array of dates type
 787b640
* feat(schema): support array of primitives
 9e6a439
* feat(schema): support plural queries
 edca7e0

### fix

* fix(schema): change query interface for singular resource
 3de8b59
* fix(schema): handle float like numbers
 5fcc91a
* fix(schema): rename query argument "id" to "_id"
 9f83ff7

### style

* style(schema): add TODO comments
 e71a187

### test

* test(schema): add test skeleton
 3b962d6
* test(schema): add unit tests for simple queries
 28d7ee6
* test(schema): cover Date, String, Number and Boolean types with tests
 fa67a21
* test(schema): cover projection with unit tests
 12a0c4c


### BREAKING CHANGE

* array of models instead of objects

* project name changed to "graffiti-mongo"

* project name changed to "graffiti-mongoose"

* query argument "id" rename to "_id"

* user resource name instead of "findOneResource"



