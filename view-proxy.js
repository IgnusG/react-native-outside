const ReactNativeModule = require('react-native');

const React = require('react');
const { useContext, useCallback } = React;

const { OutsideContext, OutsideRootContext } = require('./context');

let OriginalView = null;

const OutsideViewProxy = ({ children, ref, ...props }) => {
  const symbols = useContext(OutsideContext);
  const outsideRootContext = useContext(OutsideRootContext);

  const handleTouchStart = useCallback(
    (event) => {
      if (outsideRootContext) {
        outsideRootContext.onTouchStart({ nativeEvent: event.nativeEvent, symbols });
      }

      if (props.onTouchStart) return props.onTouchStart(event);
    },
    [outsideRootContext, symbols, props.onTouchStart]
  );

  const handleTouchEnd = useCallback(
    (event) => {
      if (outsideRootContext) {
        outsideRootContext.onTouchEnd({ nativeEvent: event.nativeEvent, symbols });
      }

      if (props.onTouchEnd) return props.onTouchEnd(event);
    },
    [outsideRootContext, symbols, props.onTouchEnd]
  );

  return (
    <OriginalView ref={ref} {...props} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      {children}
    </OriginalView>
  );
};

module.exports = new Proxy(ReactNativeModule, {
  get(target, prop, receiver) {
    if (prop === 'View') {
      if (!OriginalView) {
        OriginalView = Reflect.get(target, prop, receiver);
      }

      return OutsideViewProxy;
    }
    return Reflect.get(target, prop, receiver);
  },
});
