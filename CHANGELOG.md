<a name="3.0.0"></a>
# 3.0.0 (2015-10-07)


### chore

* chore(relay): major refactor and basic Relay support: node(id), pagination ([89dc30a](https://github.com/RisingStack/graffiti-mongoose/commit/89dc30a))



<a name="2.0.0"></a>
# 2.0.0 (2015-09-29)


### fix

* fix(package): require graphql to be installed alongside graffiti ([71e2c85](https://github.com/RisingStack/graffiti-mongoose/commit/71e2c85))


### BREAKING CHANGE

* move graphql to peerDependencies


<a name="1.6.3"></a>
## 1.6.3 (2015-09-23)


### chore

* chore(package): update graphql-js to latest ([0cef077](https://github.com/RisingStack/graffiti-mongoose/commit/0cef077))



<a name="1.6.2"></a>
## 1.6.2 (2015-09-22)


### docs

* docs(readme): fix minor typo in example ([5a2813d](https://github.com/RisingStack/graffiti-mongoose/commit/5a2813d))

### refactor

* refactor(objectid): remove bson-objectid from project ([c4e7ad1](https://github.com/RisingStack/graffiti-mongoose/commit/c4e7ad1))



<a name="1.6.1"></a>
## 1.6.1 (2015-08-03)


### chore

* chore(package): bump version to 1.6.1
 ([b37e64a](https://github.com/RisingStack/graffiti-mongoose/commit/b37e64a))

### fix

* fix(type): fix array of ObjectId without ref
 ([e5575f3](https://github.com/RisingStack/graffiti-mongoose/commit/e5575f3))

### refactor

* refactor(model): improve internal model for sub-documents
 ([95cf81f](https://github.com/RisingStack/graffiti-mongoose/commit/95cf81f))



<a name="1.6.0"></a>
# 1.6.0 (2015-08-02)


### chore

* chore(changelog): fix git commit links
 ([044f311](https://github.com/RisingStack/graffiti-mongoose/commit/044f311))
* chore(package): add git links
 ([2602415](https://github.com/RisingStack/graffiti-mongoose/commit/2602415))
* chore(package): bump version to 1.6.0
 ([08677e6](https://github.com/RisingStack/graffiti-mongoose/commit/08677e6))

### feat

* feat(model): extract sub-documents to tree
 ([ddba1d3](https://github.com/RisingStack/graffiti-mongoose/commit/ddba1d3))
* feat(type): ObjectID with reference
 ([653e1d1](https://github.com/RisingStack/graffiti-mongoose/commit/653e1d1))

### refactor

* refactor(field): separate date resolve fn
 ([5731f50](https://github.com/RisingStack/graffiti-mongoose/commit/5731f50))



<a name="1.5.0"></a>
# 1.5.0 (2015-08-01)


### chore

* chore(changelog): update CHANGELOG.md
 ([fa3bf6c](https://github.com/RisingStack/graffiti-mongoose/commit/fa3bf6c))
* chore(package): bump version to 1.5.0
 ([4cc15c7](https://github.com/RisingStack/graffiti-mongoose/commit/4cc15c7))

### docs

* docs(readme): add ES6 explanation to readme
 ([ceb9aa8](https://github.com/RisingStack/graffiti-mongoose/commit/ceb9aa8))
* docs(readme): fix example typo
 ([4b56823](https://github.com/RisingStack/graffiti-mongoose/commit/4b56823))
* docs(readme): fix typo in ES6 explanation
 ([a287183](https://github.com/RisingStack/graffiti-mongoose/commit/a287183))
* docs(readme): fix usage link
 ([ac31470](https://github.com/RisingStack/graffiti-mongoose/commit/ac31470))
* docs(readme): improve README
 ([2ee943c](https://github.com/RisingStack/graffiti-mongoose/commit/2ee943c))
* docs(readme): improve README
 ([24569aa](https://github.com/RisingStack/graffiti-mongoose/commit/24569aa))
* docs(readme): improve usage example
 ([afdf24e](https://github.com/RisingStack/graffiti-mongoose/commit/afdf24e))
* docs(readme): improve usage section
 ([0486ce7](https://github.com/RisingStack/graffiti-mongoose/commit/0486ce7))
* docs(readme): separate description better
 ([5feca41](https://github.com/RisingStack/graffiti-mongoose/commit/5feca41))

### feat

* feat(fragment): add fragment support with broken projection
 ([25fc49c](https://github.com/RisingStack/graffiti-mongoose/commit/25fc49c))



<a name="1.4.1"></a>
## 1.4.1 (2015-07-31)


### chore

* chore(changelog): update changelog
 ([89a2a89](https://github.com/RisingStack/graffiti-mongoose/commit/89a2a89))
* chore(package): bump version to 1.4.1
 ([a106290](https://github.com/RisingStack/graffiti-mongoose/commit/a106290))
* chore(package): update graphql version
 ([e99623e](https://github.com/RisingStack/graffiti-mongoose/commit/e99623e))



<a name="1.4.0"></a>
# 1.4.0 (2015-07-31)


### chore

* chore(package): bump version to 1.4.0
 ([efe3a4b](https://github.com/RisingStack/graffiti-mongoose/commit/efe3a4b))

### fix

* fix(model): handle mongoose models without caster option
 ([5a52ef2](https://github.com/RisingStack/graffiti-mongoose/commit/5a52ef2))

### refactor

* refactor(export): refactor export to support ES6 impots better
 ([f3912d4](https://github.com/RisingStack/graffiti-mongoose/commit/f3912d4))
* refactor(interface): use ES6 exports
 ([7b5ea46](https://github.com/RisingStack/graffiti-mongoose/commit/7b5ea46))
* refactor(type): graffiti level models
 ([d7bb657](https://github.com/RisingStack/graffiti-mongoose/commit/d7bb657))

### style

* style(imports): refactor imports to ES6 style
 ([ebdabd2](https://github.com/RisingStack/graffiti-mongoose/commit/ebdabd2))

### test

* test(e2e): improve test coverage
 ([b751814](https://github.com/RisingStack/graffiti-mongoose/commit/b751814))
* test(query): cover with unit tests
 ([d4635eb](https://github.com/RisingStack/graffiti-mongoose/commit/d4635eb))
* test(schema): add new prefix to ObjectId creation
 ([50d7df4](https://github.com/RisingStack/graffiti-mongoose/commit/50d7df4))
* test(schema): write test skeletons
 ([2cfa589](https://github.com/RisingStack/graffiti-mongoose/commit/2cfa589))
* test(type): cover type resolves with tests
 ([c37d5bf](https://github.com/RisingStack/graffiti-mongoose/commit/c37d5bf))
* test(type): cover type with tests
 ([c64a248](https://github.com/RisingStack/graffiti-mongoose/commit/c64a248))



<a name="1.3.0"></a>
# 1.3.0 (2015-07-30)


### chore

* chore(package): bump version to 1.3.0
 ([ef362a2](https://github.com/RisingStack/graffiti-mongoose/commit/ef362a2))

### feat

* feat(types): expose types
 ([b0ef6ff](https://github.com/RisingStack/graffiti-mongoose/commit/b0ef6ff))



<a name="1.2.0"></a>
# 1.2.0 (2015-07-29)


### chore

* chore(package): bump version to 1.2.0
 ([ac26a30](https://github.com/RisingStack/graffiti-mongoose/commit/ac26a30))

### docs

* docs(readme): fix example in README
 ([2015908](https://github.com/RisingStack/graffiti-mongoose/commit/2015908))
* docs(readme): fix typo
 ([02e6fe1](https://github.com/RisingStack/graffiti-mongoose/commit/02e6fe1))
* docs(readme): use promise instead of yield
 ([0ec8290](https://github.com/RisingStack/graffiti-mongoose/commit/0ec8290))

### feat

* feat(schema): support inline fragments
 ([184ffed](https://github.com/RisingStack/graffiti-mongoose/commit/184ffed))



<a name="1.1.1"></a>
## 1.1.1 (2015-07-28)


### chore

* chore(changelog): update changelog
 ([dfc28de](https://github.com/RisingStack/graffiti-mongoose/commit/dfc28de))
* chore(npmignore): add src to npmignore
 ([7c01e31](https://github.com/RisingStack/graffiti-mongoose/commit/7c01e31))
* chore(package): bump version to 1.1.0
 ([8f6e97f](https://github.com/RisingStack/graffiti-mongoose/commit/8f6e97f))
* chore(package): bump version to 1.1.1
 ([827be8c](https://github.com/RisingStack/graffiti-mongoose/commit/827be8c))

### feat

* feat(schema): expose graphql
 ([65d1893](https://github.com/RisingStack/graffiti-mongoose/commit/65d1893))

### test

* test(schema): use exposed graphql in tests
 ([6690b6c](https://github.com/RisingStack/graffiti-mongoose/commit/6690b6c))



<a name="1.1.0"></a>
# 1.1.0 (2015-07-28)


### chore

* chore(package): bump version to 1.1.0
 ([8f6e97f](https://github.com/RisingStack/graffiti-mongoose/commit/8f6e97f))

### feat

* feat(schema): expose graphql
 ([65d1893](https://github.com/RisingStack/graffiti-mongoose/commit/65d1893))



<a name="1.0.5"></a>
## 1.0.5 (2015-07-28)


### chore

* chore(package): bump version to 1.0.5
 ([cbbd650](https://github.com/RisingStack/graffiti-mongoose/commit/cbbd650))
* chore(package): udpdate dependencies
 ([b3987fb](https://github.com/RisingStack/graffiti-mongoose/commit/b3987fb))



<a name="1.0.4"></a>
## 1.0.4 (2015-07-27)


### chore

* chore(package): bump version to 1.0.4
 ([09ddbbc](https://github.com/RisingStack/graffiti-mongoose/commit/09ddbbc))
* chore(package): remove unused dependencies
 ([42fa4ac](https://github.com/RisingStack/graffiti-mongoose/commit/42fa4ac))



<a name="1.0.3"></a>
## 1.0.3 (2015-07-27)


### chore

* chore(package): bump version to 1.0.3
 ([5971779](https://github.com/RisingStack/graffiti-mongoose/commit/5971779))

### refactor

* refactor(schema): remove mongoose from schema to avoid conflicts
 ([8a37235](https://github.com/RisingStack/graffiti-mongoose/commit/8a37235))



<a name="1.0.2"></a>
## 1.0.2 (2015-07-27)


### chore

* chore(build): publish built version to npm
 ([77769dc](https://github.com/RisingStack/graffiti-mongoose/commit/77769dc))
* chore(package): bumping version to 1.0.2
 ([9137431](https://github.com/RisingStack/graffiti-mongoose/commit/9137431))
* chore(package): update description
 ([0f929df](https://github.com/RisingStack/graffiti-mongoose/commit/0f929df))



<a name="1.0.1"></a>
## 1.0.1 (2015-07-27)


### chore

* chore(changelog): update CHANGELOG.md
 ([b106ae1](https://github.com/RisingStack/graffiti-mongoose/commit/b106ae1))
* chore(ci): integrate TravisCI via config file
 ([833833d](https://github.com/RisingStack/graffiti-mongoose/commit/833833d))
* chore(npmignore): add .npmignore file to project
 ([fd76552](https://github.com/RisingStack/graffiti-mongoose/commit/fd76552))
* chore(package): add keywords and fix license
 ([71713ad](https://github.com/RisingStack/graffiti-mongoose/commit/71713ad))
* chore(package): bump version to 1.0.1
 ([ee6448c](https://github.com/RisingStack/graffiti-mongoose/commit/ee6448c))



<a name="1.0.0"></a>
# 1.0.0 (2015-07-27)


### chore

* chore(changelog): add CHANGELOG file
 ([2550e0b](https://github.com/RisingStack/graffiti-mongoose/commit/2550e0b))
* chore(changelog): update CHANGELOG
 ([3cc3e48](https://github.com/RisingStack/graffiti-mongoose/commit/3cc3e48))
* chore(changelog): update changelog
 ([c002cad](https://github.com/RisingStack/graffiti-mongoose/commit/c002cad))
* chore(ci): integrate TravisCI via config file
 ([833833d](https://github.com/RisingStack/graffiti-mongoose/commit/833833d))
* chore(gitignore): add .gitignore file to the project
 ([2a487bc](https://github.com/RisingStack/graffiti-mongoose/commit/2a487bc))
* chore(guidelines): add CONTRIBUTING guideline to the project
 ([88837cf](https://github.com/RisingStack/graffiti-mongoose/commit/88837cf))
* chore(license): add LICENSE file to the project
 ([d97609e](https://github.com/RisingStack/graffiti-mongoose/commit/d97609e))
* chore(listing): add ESLint to the project
 ([6068476](https://github.com/RisingStack/graffiti-mongoose/commit/6068476))
* chore(pre-commit): add tests to pre-commit hooks
 ([e498710](https://github.com/RisingStack/graffiti-mongoose/commit/e498710))
* chore(project): rename project to "graffiti-mongo"
 ([7c9141a](https://github.com/RisingStack/graffiti-mongoose/commit/7c9141a))
* chore(project): rename project to "graffiti-mongoose"
 ([b5e1e3e](https://github.com/RisingStack/graffiti-mongoose/commit/b5e1e3e))

### docs

* docs(read): add JavaScript style to README example
 ([880fdcd](https://github.com/RisingStack/graffiti-mongoose/commit/880fdcd))
* docs(read): improve model style in README
 ([c57d83e](https://github.com/RisingStack/graffiti-mongoose/commit/c57d83e))
* docs(readme): Add supported types and queries to the README
 ([c1ff505](https://github.com/RisingStack/graffiti-mongoose/commit/c1ff505))
* docs(readme): add example to the README
 ([bb49bda](https://github.com/RisingStack/graffiti-mongoose/commit/bb49bda))
* docs(readme): add mongoose link to the README
 ([61dcfb3](https://github.com/RisingStack/graffiti-mongoose/commit/61dcfb3))
* docs(readme): add ref example to the README
 ([ff12c36](https://github.com/RisingStack/graffiti-mongoose/commit/ff12c36))
* docs(readme): add test section to the README
 ([6d5b04d](https://github.com/RisingStack/graffiti-mongoose/commit/6d5b04d))

### feat

* feat(schema): add schema file to project
 ([ab94cba](https://github.com/RisingStack/graffiti-mongoose/commit/ab94cba))
* feat(schema): add support for Number, Boolean and Date types
 ([a07767c](https://github.com/RisingStack/graffiti-mongoose/commit/a07767c))
* feat(schema): add support for filtering plural resource by indexed fields
 ([1debcdd](https://github.com/RisingStack/graffiti-mongoose/commit/1debcdd))
* feat(schema): add support for filtering singular resource by indexed fields
 ([805753a](https://github.com/RisingStack/graffiti-mongoose/commit/805753a))
* feat(schema): change getSchema's interface to handle array of mongoose models
 ([2b62c48](https://github.com/RisingStack/graffiti-mongoose/commit/2b62c48))
* feat(schema): filter plural resource by array of _id -s
 ([26e642f](https://github.com/RisingStack/graffiti-mongoose/commit/26e642f))
* feat(schema): support array of dates type
 ([787b640](https://github.com/RisingStack/graffiti-mongoose/commit/787b640))
* feat(schema): support array of primitives
 ([9e6a439](https://github.com/RisingStack/graffiti-mongoose/commit/9e6a439))
* feat(schema): support plural queries
 ([edca7e0](https://github.com/RisingStack/graffiti-mongoose/commit/edca7e0))

### fix

* fix(schema): change query interface for singular resource
 ([3de8b59](https://github.com/RisingStack/graffiti-mongoose/commit/3de8b59))
* fix(schema): handle float like numbers
 ([5fcc91a](https://github.com/RisingStack/graffiti-mongoose/commit/5fcc91a))
* fix(schema): rename query argument "id" to "_id"
 ([9f83ff7](https://github.com/RisingStack/graffiti-mongoose/commit/9f83ff7))

### style

* style(schema): add TODO comments
 ([e71a187](https://github.com/RisingStack/graffiti-mongoose/commit/e71a187))

### test

* test(schema): add test skeleton
 ([3b962d6](https://github.com/RisingStack/graffiti-mongoose/commit/3b962d6))
* test(schema): add unit tests for simple queries
 ([28d7ee6](https://github.com/RisingStack/graffiti-mongoose/commit/28d7ee6))
* test(schema): cover Date, String, Number and Boolean types with tests
 ([fa67a21](https://github.com/RisingStack/graffiti-mongoose/commit/fa67a21))
* test(schema): cover projection with unit tests
 ([12a0c4c](https://github.com/RisingStack/graffiti-mongoose/commit/12a0c4c))


### BREAKING CHANGE

* array of models instead of objects

* project name changed to "graffiti-mongo"

* project name changed to "graffiti-mongoose"

* query argument "id" rename to "_id"

* user resource name instead of "findOneResource"
