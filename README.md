# react-promise-status

[![NPM version][npm-image]][npm-url] [![Downloads][downloads-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Coverage Status][codecov-image]][codecov-url] [![Dependency status][david-dm-image]][david-dm-url] [![Dev Dependency status][david-dm-dev-image]][david-dm-dev-url]

[npm-url]:https://npmjs.org/package/react-promise-status
[downloads-image]:http://img.shields.io/npm/dm/react-promise-status.svg
[npm-image]:http://img.shields.io/npm/v/react-promise-status.svg
[travis-url]:https://travis-ci.org/moxystudio/react-promise-status
[travis-image]:http://img.shields.io/travis/moxystudio/react-promise-status/master.svg
[codecov-url]:https://codecov.io/gh/moxystudio/react-promise-status
[codecov-image]:https://img.shields.io/codecov/c/github/moxystudio/react-promise-status/master.svg
[david-dm-url]:https://david-dm.org/moxystudio/react-promise-status
[david-dm-image]:https://img.shields.io/david/moxystudio/react-promise-status.svg
[david-dm-dev-url]:https://david-dm.org/moxystudio/react-promise-status?type=dev
[david-dm-dev-image]:https://img.shields.io/david/dev/moxystudio/react-promise-status.svg

A React component and hook to render children conditionally based on a promise status.


## Installation

```sh
$ npm install react-promise-status
```

This library is written in modern JavaScript and is published in both CommonJS and ES module transpiled variants. If you target older browsers please make sure to transpile accordingly.


## Usage

**With `<PromiseStatus>` component**:

```js
import React, { useMemo, useState } from 'react';
import { PromiseStatus } from 'react-promise-status';

const SomeComponent = (props) => {
    const [savePromise, setSavePromise] = useState();
    const handleSave = useMemo(
        () => () => setSavePromise(props.save()),
        [props.save]
    );

    return (
        <div>
            <button onSave={ handleSave }>Save</button>
            <PromiseStatus promise={ savePromise }>
                { (status) => (
                    <p>
                        { status === 'pending' && 'Saving..' }
                        { status === 'fulfilled' && 'Saved!' }
                        { status === 'rejected' && 'Oops, failed to save' }
                    </p>
                ) }
            </PromiseStatus>
        </div>
    );
}
```

**With `usePromiseStatus()` hook**:

```js
import React, { useMemo, useState } from 'react';
import { usePromiseStatus } from 'react-promise-status';

const SomeComponent = (props) => {
    const [savePromise, setSavePromise] = useState();
    const [saveStatus] = usePromiseStatus(savePromise);
    const handleSave = useMemo(
        () => () => setSavePromise(props.save()),
        [props.save]
    );

    return (
        <div>
            <button onSave={ handleSave }>Save</button>
            <p>
                { saveStatus === 'pending' && 'Saving..' }
                { saveStatus === 'fulfilled' && 'Saved!' }
                { saveStatus === 'rejected' && 'Oops, failed to save' }
            </p>
        </div>
    );
}
```

## API

- [`<PromiseStatus>`](#promisestatus)
- [`usePromiseStatus(promise, [options])`](#usepromisestatuspromise-options)

### PromiseStatus

The `<PromiseStatus>` component allows you to conditionally render children based on the promise status and fulfillment/rejection value. It leverages the [render props](https://reactjs.org/docs/render-props.html) technique to know what to render.

#### Props

##### promise

Type: `Promise`

The promise to use.

##### children

A render prop function with the following signature:

```js
(status, value) => {}
```

The status argument is one of `none`, `pending`, `rejected`, `fulfilled`. The value argument is either the fulfillment value or the rejection value.

The `none` status only happens when there's no promise or when reset. Please see [`delayMs`](#delayms) or [`resetDelayMs`](#resetdelayms) props for more info.

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

When a `delayMs` is specified an when the `promise` prop changes from `undefined` to a promise, the status will be `none` during the specified delay and changes to `pending` afterwards.

##### resetDelayMs

Type: `Number`   
Default: 0 (disabled)

The delay in ms to change the status to `none` after the promise settles. Useful if you no longer want to render a success or error message after a certain time.


### usePromiseStatus(promise, [options])

The hook version of the `<PromiseStatus>` component.

Returns an array with `[status, value]`.

The options are the same as the `<PromiseStatus>`'s props counterparts: [`statusMap`](#statusmap), [`delayMs`](#delayms) or [`resetDelayMs`](#resetdelayms)


## Tests

```sh
$ npm test
$ npm test -- --watch # during development
```


## License

Released under the [MIT License](http://www.opensource.org/licenses/mit-license.php).
