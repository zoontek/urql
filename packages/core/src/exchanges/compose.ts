import { fromValue } from 'wonka';
import { Exchange, ExchangeInput, ExchangeIO } from '../types';

const getSignature = (x: any): string => Object.keys(x).sort().join(',');

export const getExchangeSignature = (exchangeIO: ExchangeIO) => {
  let actualSignature: string | undefined = undefined;

  // Compute a signature from the exchange's Wonka source signals
  exchangeIO(sink => sink({} as any))(event => {
    actualSignature = getSignature(event);
  });

  return actualSignature;
};

const checkExchangeSignature = (exchangeIO: ExchangeIO) => {
  let expectedSignature: string | undefined = undefined;

  // Compute a signature from the expected Wonka source signals
  fromValue(0)(event => {
    expectedSignature = getSignature(event);
  });

  if (expectedSignature) {
    const actualSignature = getExchangeSignature(exchangeIO);
    if (actualSignature && expectedSignature !== actualSignature) {
      const message =
        '[@urql/core] Received an Exchange that uses a different version of Wonka.\n' +
        'Please upgrade your exchanges and deduplicate dependencies to ensure that wonka@^4.1.0 is used.';
      throw new TypeError(message);
    }
  }
};

/** This composes an array of Exchanges into a single ExchangeIO function */
export const composeExchanges = (exchanges: Exchange[]) => ({
  client,
  forward,
  dispatchDebug,
}: ExchangeInput) =>
  exchanges.reduceRight((forward, exchange) => {
    const exchangeIO = exchange({
      client,
      forward,
      dispatchDebug(event) {
        dispatchDebug({
          timestamp: Date.now(),
          source: exchange.name,
          ...event,
        });
      },
    });

    if (process.env.NODE_ENV === 'development') {
      checkExchangeSignature(exchangeIO);
    }

    return exchangeIO;
  }, forward);
