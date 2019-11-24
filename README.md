# react-promiseful

[![NPM version][npm-image]][npm-url] [![Downloads][downloads-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Coverage Status][codecov-image]][codecov-url] [![Dependency status][david-dm-image]][david-dm-url] [![Dev Dependency status][david-dm-dev-image]][david-dm-dev-url]

[npm-url]:https://npmjs.org/package/react-promiseful
[downloads-image]:https://img.shields.io/npm/dm/react-promiseful.svg
[npm-image]:https://img.shields.io/npm/v/react-promiseful.svg
[travis-url]:https://travis-ci.org/moxystudio/react-promiseful
[travis-image]:https://img.shields.io/travis/moxystudio/react-promiseful/master.svg
[codecov-url]:https://codecov.io/gh/moxystudio/react-promiseful
[codecov-image]:https://img.shields.io/codecov/c/github/moxystudio/react-promiseful/master.svg
[david-dm-url]:https://david-dm.org/moxystudio/react-promiseful
[david-dm-image]:https://img.shields.io/david/moxystudio/react-promiseful.svg
[david-dm-dev-url]:https://david-dm.org/moxystudio/react-promiseful?type=dev
[david-dm-dev-image]:https://img.shields.io/david/dev/moxystudio/react-promiseful.svg

A React component and hook to render children conditionally based on a promise status.


## Installation

```sh
$ npm install react-promiseful
```

This library is written in modern JavaScript and is published in both CommonJS and ES module transpiled variants. If you target older browsers please make sure to transpile accordingly.


## Demo

You may see a simple demo of `react-promiseful` in [https://moxystudio.github.io/react-promiseful](https://moxystudio.github.io/react-promiseful/).


## Usage

**With `<PromiseState>` component**:

```js
import React, { useMemo, useState } from 'react';
import { PromiseState } from 'react-promiseful';

const SomeComponent = (props) => {
    const [savePromise, setSavePromise] = useState();
    const handleSave = useMemo(
        () => () => setSavePromise(props.save()),
        [props.save]
    );

    return (
        <div>
            <button disabled={ saveState.status === 'pending' } onSave={ handleSave }>
                Save
            </button>

            <PromiseState promise={ savePromise }>
                { (saveState) => (
                    <p>
                        { saveState.status === 'pending' && 'Saving...' }
                        { saveState.status === 'fulfilled' && 'Saved!' }
                        { saveState.status === 'rejected' && 'Oops, failed to save' }
                    </p>
                ) }
            </PromiseState>
        </div>
    );
}
```

**With `usePromiseState()` hook**:

```js
import React, { useMemo, useState } from 'react';
import { usePromiseState } from 'react-promiseful';

const SomeComponent = (props) => {
    const [savePromise, setSavePromise] = useState();
    const saveState = usePromiseState(savePromise);
    const handleSave = useMemo(
        () => () => setSavePromise(props.save()),
        [props.save]
    );

    return (
        <div>
             <button disabled={ saveState.status === 'pending' } onSave={ handleSave }>
                Save
            </button>

            <p>
                { saveState.status === 'pending' && 'Saving..' }
                { saveState.status === 'fulfilled' && 'Saved!' }
                { saveState.status === 'rejected' && 'Oops, failed to save' }
            </p>
        </div>
    );
}
```

## API

- [`<PromiseState>`](#promisestate)
- [`usePromiseState(promise, [options])`](#usepromisestatepromise-options)
- [`getPromiseState(promise)`](#getpromisestatepromise)

### PromiseState

The `<PromiseState>` component allows you to conditionally render children based on the promise status and fulfillment/rejection value. It leverages the [render props](https://reactjs.org/docs/render-props.html) technique to know what to render.

#### Props

##### promise

Type: `Promise`

The promise to observe.

##### children

A render prop function with the following signature:

```js
(state) => {}
```

The `state` argument is an object that contains the following properties:

- `status` is one of `none` (when there's no promise), `pending`, `rejected`, `fulfilled`
- `value` is either the fulfillment value or the rejection value
- `withinThreshold` indicating if we are still within the configured [`thresholdMs`](#thresholdms)

##### thresholdMs

Type: `number`   
Default: 0

The timespan in ms to consider the promise within the threshold. Useful if you want to render a loading only when the promise is taking some time.

The state will contain a `withinThreshold` boolean property for you to use in the `children` render prop. Moreover, you may also use "withinThreshold" variants in the [statusMap](#statusmap) and [onSettleDelay](#onsettledelay) props.

##### statusMap

Type: `Object`

An object to map statuses, useful when you want to use other names:

```js
{
    pending: 'loading',
    fulfilled: 'success',
    rejected: 'error',
}
```

When the [`thresholdMs`](#thresholdms) prop is used, you are also able to map the "withinThreshold" variants. This is useful if you want to hide visual feedback that is too quick. For instance, to avoid having any spinners and success feedback within the threshold:

```js
{
    pendingWithinThreshold: 'none',
    fulfilledWithinThreshold: 'none',
    pending: 'loading',
    fulfilled: 'success',
    rejected: 'error',
}
```

You may omit statuses you don't want to map and the default ones will be used. Moreover, if no "withinThreshold" statuses are defined, their normal counterparts will be used.

### onSettle

Type: `Function`

A callback to be called whenever the promise fulfills or rejects. It receives the `state` as argument:

```js
(state) => {}
```

This is useful to trigger a change in a user-interface after the promise resolves:

```js
const handleSettle = ({ status }) => {
    if (status === 'fulfilled') {
        complete(); // Imaginary function that completes the operation in the UI
    }
};
```

### onSettleDelayMs

Type: `number`, `Object`   
Default: 0

The delay before calling `onSettle`. This is useful if you have success animations that must complete before triggering a change in the user-interface.

You may either specify a number to signal the same delay for both `fulfilled` and `rejected` statuses or an object containing the granular delays:

```js
{
    fulfilled: 2000,
    rejected: 2000,
}
```

When the [`thresholdMs`](#thresholdms) prop is used, you are also able to also map the "withinThreshold" variants. For instance, you may want the callback to be called with a delay, except when there is no visual-feedback:

```js
{
    fulfilledWithinThreshold: 0,
    fulfilled: 2000,
    rejected: 2000,
}
```

You may omit delays you don't want to map and the default ones will be used. Moreover, if no "withinThreshold" statuses are defined, their normal counterparts will be used.

### usePromiseState(promise, [options])

The hook version of the `<PromiseState>` component. The `options` available to both are exactly the same.

```js
const promiseState = usePromiseState(somePromise);
```

The returned value from the hook is the promise state, an object that contains the following properties:

- `status` is one of `none` (when there's no promise), `pending`, `rejected`, `fulfilled`
- `value` is either the fulfillment value or the rejection value
- `withinThreshold` indicating if we are still within the configured [`thresholdMs`](#thresholdms)

### getPromiseState(promise)

Returns the current promise state, an object with `status` and `value`.

If the `promise` was yet not used in `<PromiseState>` or `usePromiseState()`, the promise state will be `pending`.


## Tests

```sh
$ npm test
$ npm test -- --watch # during development
```


## License

Released under the [MIT License](https://www.opensource.org/licenses/mit-license.php).
