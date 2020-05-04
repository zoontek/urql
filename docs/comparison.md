---
title: Comparison
order: 6
---

# Comparison

This page aims to provide an objective comparison to other popular GraphQL clients.
Specifically, this page uses [Apollo](https://github.com/apollographql/apollo-client), the most
popular GraphQl client, and [Relay](https://github.com/facebook/relay), the second most popular, for
comparison.

## Supported Frameworks

| Framework            | `urql` | Apollo        | Relay  |
| -------------------- | ------ | ------------- | ------ |
| React support        | ✅ Yes | ✅ Yes        | ✅ Yes |
| React Native support | ✅ Yes | ✅ Yes        | ✅ Yes |
| Preact support       | ✅ Yes | 🔷 Partial    | 🔺 No  |
| Svelte support       | ✅ Yes | 🔷 Unofficial | 🔺 No  |
| Vue support          | 🔺 No  | 🔷 Unofficial | 🔺 No  |

`urql`'s lean core allows framework bindings to be smaller and focus on their own idiomatic API
first and foremost. This has allowed the creation of multiple supported framework bindings.
In the Apollo community many other frameworks are supported, however most of the time these bindings
are community-driven, which may slow down their rate of feature adoption or limit their support time.

It's worth mentioning that Apollo maintains
[Android](https://github.com/apollographql/apollo-android) and
[iOS](https://github.com/apollographql/apollo-ios) versions of their client. These don't retain any
shared code to the main JS Apollo Client, but does carry over its main concepts to different native
platforms without going through React Native.

Support for [Preact](https://github.com/preactjs/preact) with Apollo and Relay can likely be
achieved through `preact/compat`, but isn't officially supported. Since Relay is specifically built
against React, problems can be anticipated and it has been marked as "not supported."

## Caching Features

| Feature               | `urql`         | Apollo     | Relay  |
| --------------------- | -------------- | ---------- | ------ |
| Document Caching      | ✅ Yes, opt-in | 🔺 No      | 🔺 No  |
| Normalized Caching    | ✅ Yes, opt-in | ✅ Yes     | ✅ Yes |
| Optimistic Updates    | ✅ Yes         | ✅ Yes     | ✅ Yes |
| Local State           | 🔺 No          | ✅ Yes     | ✅ Yes |
| Unopinionated Caching | ✅ Yes         | ✅ Yes     | 🔺 No  |
| Cache Redirects       | ✅ Yes         | ✅ Yes     | 🔺 No  |
| Cache Resolvers       | ✅ Yes         | 🔷 Limited | 🔺 No  |
| Relay Pagination      | ✅ Yes         | 🔷 Manual  | ✅ Yes |

All clients offer normalized caching, although `urql`'s normalized caching support is provided via
[Graphcache](./graphcache/README.md) and is hence an opt-in feature.

Apollo and Relay support managing **local state**, which isn't reflected on the server. While `urql`
may support this in the future, this wouldn't be included in Graphcache, its normalized caching
implementation. `urql`'s Graphcache aims to inform the user to faithfully represent server-side
GraphQL data, and not diverge from this data.

Relay expects the GraphQL API's schema to follow its
[specification](https://relay.dev/docs/en/graphql-server-specification.html), which means it
actively limits what the GraphQL schema may look like and is opinionated. However, some parts of the
specification aren't always followed by all GraphQL API authors, like the "Object Identification"
part of the specification.

**Cache Redirects** and **Cache Resolvers** are an important tool that allow us to write logic to
manually retrieve data from the cache that has been queried before. Redirects enable the cache to
retrieve data for entities that the cache does know about but hasn't directly queried before via a
specific field. While Apollo does support redirects, `urql`'s Graphcache supports more complex
resolvers.

Relay's [Pagination Specification](https://relay.dev/graphql/connections.htm) is a comprehensive
standard to allow merging paginated lists (for infinite scrolling for instance) to be automated.
`urql`'s Graphcache provides a utility to quickly enable pages following the specification to be
merged. In Apollo, Relay pagination may be implemented manually.
