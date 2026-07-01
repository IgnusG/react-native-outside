# react-native-outside

A lightweight library for detecting when a user touches outside of a component in React Native. Perfect for implementing modals, dropdowns, and other UI patterns that need to close when clicking outside.

> This library has been tested only with Expo on React Native running an iOS development client. Let me know if it doesn't work on your setup.

> If this library doesn't work for you, there's another great tool called [react-native-outside-press](https://github.com/dcangulo/react-native-outside-press) that is also designed to solve the same problem - but in a different way. It may fit your needs better.

## Features

- **Simple API** - Just two components: `OutsideRoot` and `Outside`
- **Zero layout impact** - Components don't render extra views or affect layout
- **Nestable** - Support for nested outside listeners
- **Third party library support** - Works with libraries that wrap the native `View` like re-animated etc.
- **Easy setup** - One-line Metro config change

## Installation

```bash
npm install react-native-outside
```

## Setup

### Step 1: Configure Metro

Wrap your Metro config with the `withOutside` function. This enables the library to intercept `View` components and detect touch events.

```js
// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');
const { withOutside } = require('react-native-outside/with-outside');

const config = getDefaultConfig(__dirname);

module.exports = withOutside(config);
```

**Note:** If you're using a custom Metro resolver, the `withOutside` function will preserve your existing configuration.

### Step 2: Add OutsideRoot

Wrap your app with `OutsideRoot`. Place it as high in your component tree as possible to ensure all touch events are captured.

```javascript
import { OutsideRoot } from 'react-native-outside/outside';

function App() {
  return <OutsideRoot>{/* Your app content */}</OutsideRoot>;
}
```

## Usage

### Basic Example

```javascript
import { useState } from 'react';
import { View, Text, Button } from 'react-native';
import { OutsideRoot, Outside } from 'react-native-outside/outside';

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <OutsideRoot>
      <View style={{ flex: 1 }}>
        <Button title="Open Modal" onPress={() => setIsModalOpen(true)} />

        {isModalOpen && (
          <Outside onOutsideTouchStart={() => setIsModalOpen(false)}>
            <View>
              <Text>This is a modal. Touch outside to close.</Text>
            </View>
          </Outside>
        )}
      </View>
    </OutsideRoot>
  );
}
```

### Nested Outside Listeners

You can nest `Outside` components to create complex interactions:

```javascript
function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <OutsideRoot>
      <View>
        <Text>Background Content</Text>
      </View>

      {isModalOpen && (
        <Outside onOutsideTouchStart={() => setIsModalOpen(false)}>
          <View>
            <Text>Modal Content</Text>

            {/* Nested dropdown inside modal */}
            <Outside onOutsideTouchStart={() => setIsDropdownOpen(false)}>
              <View>
                <Text>Dropdown</Text>
              </View>
            </Outside>
          </View>
        </Outside>
      )}
    </OutsideRoot>
  );
}
```

**Behavior:**

- Touching the background closes the modal (and dropdown if open)
- Touching the modal content closes only the dropdown
- Touching the dropdown closes nothing

## API Reference

### `<OutsideRoot>`

The root context provider that manages all outside touch detection.

**Props:** None

**Usage:** Place once at the top of your component tree. Does not render any views or affect layout.

```javascript
<OutsideRoot>{children}</OutsideRoot>
```

### `<Outside>`

Wraps components that need to detect outside touches.

**Props:**

| Prop                  | Type                           | Required | Description                                              |
| --------------------- | ------------------------------ | -------- | -------------------------------------------------------- |
| `onOutsideTouchStart` | `(event: NativeEvent) => void` | No       | Callback fired when a touch starts outside the component |
| `onOutsideTouchEnd`   | `(event: NativeEvent) => void` | No       | Callback fired when a touch ends outside the component   |

**Usage:** Wrap any component where you want to detect outside touches. Does not render any views or affect layout.

```javascript
<Outside
  onOutsideTouchStart={(event) => console.log('Touch started outside')}
  onOutsideTouchEnd={(event) => console.log('Touch ended outside')}>
  {children}
</Outside>
```

## How It Works

Magic 🪄 ... Nah not really, `react-native-outside` intercepts imports of `react-native` and replaces the native `View` component with a lightweight proxy. The proxy:

1. Intercepts touch events on all `View` components
2. Forwards events to the `OutsideRoot` context
3. Passes all props and events through to the original `View`

The `OutsideRoot` maintains a registry of active `Outside` listeners. When a touch occurs, it determines which listeners are "outside" the touch target and triggers their callbacks.

**Key Points:**

- The proxy has no performance impact on the original `View` component
- All touch events are still handled normally by React Native
- The library only adds minimal event forwarding logic

## Common Use Cases

- **Modals** - Close when tapping the backdrop
- **Dropdowns** - Close when selecting an option or tapping outside
- **Popovers** - Dismiss when interacting with other UI
- **Context menus** - Close after selection or outside tap
- **Bottom sheets** - Dismiss on backdrop tap

## Troubleshooting

### Outside listeners not firing

**Problem:** Your `onOutsideTouchStart` callback isn't being called.

**Solutions:**

1. Ensure `OutsideRoot` is placed above the `Outside` component in the tree
2. Verify Metro config is properly wrapped with `withOutside`
3. Check that you're importing from the correct paths:
   - `react-native-outside/outside` for components
   - `react-native-outside/with-outside` for Metro config

### Metro bundler errors

**Problem:** Metro fails to resolve modules after adding `withOutside`.

**Solutions:**

1. Clear Metro cache: `npx react-native start --reset-cache`
2. Ensure the `withOutside` function is called correctly in `metro.config.js`
3. Verify that `react-native-outside` is properly installed in `node_modules`

## License

MIT
