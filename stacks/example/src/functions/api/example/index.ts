import { createApiFunctionFactory } from '@custom-repo/libs';

const defineApi = createApiFunctionFactory(__dirname);

export const APIS_EXAMPLE = {
  getExampleTableDesc: defineApi({
    fnName: 'getExampleTableDesc',
    http: {
      method: 'GET',
      path: '/v1/example/table-desc',
    },
  }),
  getExampleItemById: defineApi({
    fnName: 'getExampleItemById',
    http: {
      method: 'GET',
      path: '/v1/example/item/{id}',
    },
  }),
  getExampleItemsByQuery: defineApi({
    fnName: 'getExampleItemsByQuery',
    http: {
      method: 'GET',
      path: '/v1/example/items',
    },
  }),
  postCreateExampleItem: defineApi({
    fnName: 'postCreateExampleItem',
    http: {
      method: 'POST',
      path: '/api/v1/example/item',
    },
  }),
  putUpdateExampleItem: defineApi({
    fnName: 'putUpdateExampleItem',
    http: {
      method: 'PUT',
      path: '/api/v1/example/item',
    },
  }),
};
