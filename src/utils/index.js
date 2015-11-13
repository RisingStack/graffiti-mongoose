import Middleware from './Middleware';

function addHooks(resolver, {pre, post} = {}) {
  return async function resolve(...args) {
    const preMiddleware = new Middleware(pre);
    await preMiddleware.compose(...args);
    const postMiddleware = new Middleware(post);
    const result = await resolver(...args);
    return await postMiddleware.compose(result) || result;
  };
}

export default {
  Middleware,
  addHooks
};
