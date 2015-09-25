#!/bin/sh

rm -rf dist/ && mkdir -p dist/ &&
cp node_modules/graphiql/graphiql.css dist/graphiql.css &&
cp node_modules/graphiql/graphiql.min.js dist/graphiql.min.js &&
cp node_modules/react/dist/react.min.js dist/react.min.js &&
cat index.html > dist/index.html
