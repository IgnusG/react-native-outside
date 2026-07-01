import { useState, useContext, useMemo, useEffect, useCallback } from 'react';
import { OutsideContext, OutsideRootContext } from './context';

export function OutsideRoot({ children }) {
  const [symbolMap] = useState(() => new Map());

  const getRespondersOutsideSymbols = useCallback(
    (symbols) => {
      return Array.from(symbolMap.keys())
        .filter((symbol) => !symbols?.includes(symbol))
        .map((symbol) => symbolMap.get(symbol));
    },
    [symbolMap]
  );

  const context = useMemo(() => {
    return {
      onTouchStart: ({ nativeEvent, symbols }) => {
        // only fire the event once on the inner most element
        if (nativeEvent._outside_handled) return;
        nativeEvent._outside_handled = true;

        const responders = getRespondersOutsideSymbols(symbols);
        responders.forEach((responder) => responder?.onTouchStart?.(nativeEvent));
      },
      onTouchEnd: ({ nativeEvent, symbols }) => {
        // only fire the event once on the inner most element
        if (nativeEvent._outside_handled) return;
        nativeEvent._outside_handled = true;

        const responders = getRespondersOutsideSymbols(symbols);
        responders.forEach((responder) => responder?.onTouchEnd?.(nativeEvent));
      },
      register: ({ symbols, onTouchEnd, onTouchStart }) => {
        symbols.forEach((symbol) => {
          symbolMap.set(symbol, { onTouchEnd, onTouchStart });
        });

        return () => symbols.forEach((symbol) => symbolMap.delete(symbol));
      },
    };
  }, [symbolMap, getRespondersOutsideSymbols]);

  return <OutsideRootContext.Provider value={context}>{children}</OutsideRootContext.Provider>;
}

export function Outside({
  children,
  onOutsideTouchStart = () => undefined,
  onOutsideTouchEnd = () => undefined,
}) {
  const outsideSymbols = useContext(OutsideContext);
  const outsideRootContext = useContext(OutsideRootContext);

  // set a unique symbol to identify this component
  const [symbol] = useState(() => Symbol());

  // merge outside symbols to keep track of the entire tree
  const symbols = useMemo(() => {
    return outsideSymbols ? [symbol, ...outsideSymbols] : [symbol];
  }, [symbol, outsideSymbols]);

  useEffect(() => {
    if (!outsideRootContext) return;

    // register the symbol and its handlers - returns a cleanup function
    return outsideRootContext.register({
      symbols,
      onTouchStart: onOutsideTouchStart,
      onTouchEnd: onOutsideTouchEnd,
    });
  }, [symbols, onOutsideTouchEnd, onOutsideTouchStart, outsideRootContext]);

  return <OutsideContext.Provider value={symbols}>{children}</OutsideContext.Provider>;
}
