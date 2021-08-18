import { print } from 'graphql';
import {
  empty,
  publish,
  fromValue,
  pipe,
  Source,
  take,
  toPromise,
  scan,
} from 'wonka';
import { Client } from '../client';
import { gql } from '../gql';
import { makeOperation } from '../utils';
import {
  context,
  subscriptionOperation,
  subscriptionResult,
} from '../test-utils';
import { Operation, OperationResult } from '../types';
import { subscriptionExchange, SubscriptionForwarder } from './subscription';

it('should return response data from forwardSubscription observable', async () => {
  const exchangeArgs = {
    dispatchDebug: jest.fn(),
    forward: () => empty as Source<OperationResult>,
    client: {} as Client,
  };

  const unsubscribe = jest.fn();
  const forwardSubscription: SubscriptionForwarder = operation => {
    expect(operation.query).toBe(print(subscriptionOperation.query));
    expect(operation.variables).toBe(subscriptionOperation.variables);
    expect(operation.context).toEqual(subscriptionOperation.context);

    return {
      subscribe(observer) {
        Promise.resolve().then(() => {
          observer.next(subscriptionResult);
        });

        return { unsubscribe };
      },
    };
  };

  const data = await pipe(
    fromValue(subscriptionOperation),
    subscriptionExchange({ forwardSubscription })(exchangeArgs),
    take(1),
    toPromise
  );

  expect(data).toMatchSnapshot();
  expect(unsubscribe).toHaveBeenCalled();
});

it('should tear down the operation if the source subscription ends', async () => {
  const reexecuteOperation = jest.fn();
  const unsubscribe = jest.fn();

  const exchangeArgs = {
    dispatchDebug: jest.fn(),
    forward: () => empty as Source<OperationResult>,
    client: { reexecuteOperation: reexecuteOperation as any } as Client,
  };

  const forwardSubscription: SubscriptionForwarder = () => ({
    subscribe(observer) {
      observer.complete();
      return { unsubscribe };
    },
  });

  pipe(
    fromValue(subscriptionOperation),
    subscriptionExchange({ forwardSubscription })(exchangeArgs),
    publish
  );

  await Promise.resolve();

  expect(unsubscribe).not.toHaveBeenCalled();
  expect(reexecuteOperation).toHaveBeenCalled();
});

it('should support deferred operations coming in', async () => {
  const exchangeArgs = {
    dispatchDebug: jest.fn(),
    forward: () => empty as Source<OperationResult>,
    client: {} as Client,
  };

  const unsubscribe = jest.fn();
  const forwardSubscription: SubscriptionForwarder = () => {
    return {
      subscribe(observer) {
        Promise.resolve().then(() => {
          observer.next({
            hasNext: true,
            data: {
              author: {
                id: '1',
                name: 'Steve',
                __typename: 'Author',
                todos: [{ id: '1', text: 'stream', __typename: 'Todo' }],
              },
            },
          });

          observer.next({
            path: ['author', 'todos', 1],
            data: { id: '2', text: 'defer', __typename: 'Todo' },
            hasNext: false,
          });

          observer.complete();
        });

        return { unsubscribe };
      },
    };
  };

  const streamedQueryOperation: Operation = makeOperation(
    'query',
    {
      query: gql`
        query {
          author {
            id
            name
            todos @stream {
              id
              text
            }
          }
        }
      `,
      variables: {},
      key: 1,
    },
    context
  );

  const chunks: OperationResult[] = await pipe(
    fromValue(streamedQueryOperation),
    subscriptionExchange({ forwardSubscription, enableAllOperations: true })(
      exchangeArgs
    ),
    scan((prev: OperationResult[], item) => [...prev, item], []),
    toPromise
  );

  expect(chunks).toMatchSnapshot();
});

it('should support streamed operations coming in', async () => {
  const exchangeArgs = {
    dispatchDebug: jest.fn(),
    forward: () => empty as Source<OperationResult>,
    client: {} as Client,
  };

  const unsubscribe = jest.fn();
  const forwardSubscription: SubscriptionForwarder = () => {
    return {
      subscribe(observer) {
        Promise.resolve().then(() => {
          observer.next({
            hasNext: true,
            data: {
              author: {
                id: '1',
                __typename: 'Author',
              },
            },
          });

          observer.next({
            path: ['author'],
            data: { name: 'Steve' },
            hasNext: true,
          });
          observer.complete();
        });

        return { unsubscribe };
      },
    };
  };
  const AuthorFragment = gql`
    fragment authorFields on Author {
      name
    }
  `;

  const streamedQueryOperation: Operation = makeOperation(
    'query',
    {
      query: gql`
        query {
          author {
            id
            ...authorFields @defer
          }
        }

        ${AuthorFragment}
      `,
      variables: {},
      key: 1,
    },
    context
  );
  const chunks: OperationResult[] = await pipe(
    fromValue(streamedQueryOperation),
    subscriptionExchange({ forwardSubscription, enableAllOperations: true })(
      exchangeArgs
    ),
    scan((prev: OperationResult[], item) => [...prev, item], []),
    toPromise
  );

  expect(chunks).toMatchSnapshot();
});
