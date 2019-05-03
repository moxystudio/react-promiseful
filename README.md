# react-promiseful

[![NPM version][npm-image]][npm-url] [![Downloads][downloads-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Coverage Status][codecov-image]][codecov-url] [![Dependency status][david-dm-image]][david-dm-url] [![Dev Dependency status][david-dm-dev-image]][david-dm-dev-url]

[npm-url]:https://npmjs.org/package/react-promiseful
[downloads-image]:http://img.shields.io/npm/dm/react-promiseful.svg
[npm-image]:http://img.shields.io/npm/v/react-promiseful.svg
[travis-url]:https://travis-ci.org/moxystudio/react-promiseful
[travis-image]:http://img.shields.io/travis/moxystudio/react-promiseful/master.svg
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
            <button onSave={ handleSave }>Save</button>
            <PromiseState promise={ savePromise }>
                { (saveState) => (
                    <p>
                        { saveState.status === 'pending' && 'Saving..' }
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
            <button onSave={ handleSave }>Save</button>
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

The promise to use.

##### children

A render prop function with the following signature:

```js
(state) => {}
```

The `state` argument is an object that contains the `status` and the resolved `value`:

- `status` is one of `pending`, `rejected`, `fulfilled`
- `value` is either the fulfillment value or the rejection value

The `state` argument will be `undefined` when reset. Please see [`delayMs`](#delayms), [`resetFulfilledDelayMs`](#resetfulfilleddelayms) and [`resetRejectedDelayMs`](#resetrejecteddelayms) props for more info.

##### statusMap

Type: `object`

An object to map status, useful when you want to use other names:

```js
{
    pending: 'loading',
    fulfilled: 'success',
    rejected: 'error',
}
```

You may omit statuses you don't want to map and the default ones will be used.

##### delayMs

Type: `Number`   
Default: 0 (disabled)

The delay in ms to wait for the promise to settle before changing status to `pending`. Useful if you want to render a loading only when the promise is taking some time.

When a `delayMs` is specified, the state will be unchanged (or `undefined` if there's no current state) until the specified delay is ellapsed or until the promise resolves or rejects.

##### resetFulfilledDelayMs

Type: `Number`   
Default: 0 (disabled)

The delay in ms to reset the state (set it as `undefined`) after the promise fulfills. Useful if you no longer want to render a success message after a certain time.

##### resetRejectedDelayMs

Type: `Number`   
Default: 0 (disabled)

The delay in ms to reset the state (set it as `undefined`) after the promise rejects. Useful if you no longer want to render an error message after a certain time.

### usePromiseState(promise, [options])

The hook version of the `<PromiseState>` component, including its `options`: [`statusMap`](#statusmap), [`delayMs`](#delayms), [`resetFulfilledDelayMs`](#resetfulfilleddelayms) and [`resetRejectedDelayMs`](#resetrejecteddelayms).

```js
const promiseState = usePromiseState(somePromise);
```

The returned value from the hook an object that contains the `status` and the resolved `value`:

- `status` is one of `pending`, `rejected`, `fulfilled`
- `value` is either the fulfillment value or the rejection value

Note that the hook will return `undefined` when reset. Please see [`delayMs`](#delayms), [`resetFulfilledDelayMs`](#resetfulfilleddelayms) and [`resetRejectedDelayMs`](#resetrejecteddelayms) props for more info.

### getPromiseState(promise)

Returns the current promise state, an object with `status` and `value`.

If the `promise` was yet not used in `<PromiseState>` or `usePromiseState()`, the promise state will be `undefined`.


## Tests

```sh
$ npm test
$ npm test -- --watch # during development
```


## License

Released under the [MIT License](http://www.opensource.org/licenses/mit-license.php).
