---
title: '@urql/exchange-multipart-fetch'
order: 7
---

# Multipart Fetch Exchange

> **Deprecation**: The `multipartFetchExchange` has been deprecated, and
> `@urql/core` now supports GraphQL Multipart Requests natively. This won't
> break the behaviour of your existing apps, however, it's recommended to remove
> the `multipartFetchExchange` from your apps.

The `@urql/exchange-multipart-fetch` package contains an addon `multipartFetchExchange` for `urql`
that enables file uploads via `multipart/form-data` POST requests.

It follows the unofficial [GraphQL Multipart Request
Spec](https://github.com/jaydenseric/graphql-multipart-request-spec) which is supported by the
[Apollo Sever package](https://www.apollographql.com/docs/apollo-server/data/file-uploads/).

This exchange uses the same fetch logic as the [`fetchExchange`](./core.md#fetchexchange) and by reusing logic from `@urql/core/internal`.
The `multipartFetchExchange` is a drop-in replacement for the default
[`fetchExchange`](./core.md#fetchexchange) and will act exactly like the `fetchExchange` unless the
`variables` that it receives for mutations contain any `File`s as detected by the `extract-files` package.

## Installation and Setup

First install `@urql/exchange-multipart-fetch` alongside `urql`:

```sh
yarn add @urql/exchange-multipart-fetch
# or
npm install --save @urql/exchange-multipart-fetch
```

The `multipartFetchExchange` is a drop-in replacement for the `fetchExchange`, which should be
replaced in the list of `exchanges`:

```js
import { createClient, dedupExchange, cacheExchange } from 'urql';
import { multipartFetchExchange } from '@urql/exchange-multipart-fetch';

const client = createClient({
  url: 'http://localhost:3000/graphql',
  exchanges: [dedupExchange, cacheExchange, multipartFetchExchange],
});
```
