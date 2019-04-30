import React, { useMemo } from 'react';
import { render } from 'react-testing-library';
import pDelay from 'delay';
import { PromiseStatus } from '../src';
import hideGlobalErrors from './util/hide-global-errors';

beforeEach(() => {
    // Hide "An update to null inside a test was not wrapped in act(...)" error
    // This won't be needed in react-dom@^16.9.0 because `act()` will support promises
    // See: https://github.com/facebook/react/issues/14769#issuecomment-479592338
    hideGlobalErrors();
});

it('should render correctly when fullfilled', async () => {
    const childrenFn = jest.fn(() => <div>foo</div>);
    const promise = Promise.resolve('foo');

    render(
        <PromiseStatus promise={ promise }>
            { childrenFn }
        </PromiseStatus>
    );

    await pDelay(10);

    expect(childrenFn).toHaveBeenCalledTimes(2);
    expect(childrenFn).toHaveBeenNthCalledWith(1, 'pending', undefined);
    expect(childrenFn).toHaveBeenNthCalledWith(2, 'fulfilled', 'foo');
});

it('should render correctly when rejected', async () => {
    const error = new Error('foo');
    const promise = Promise.reject(error);
    const childrenFn = jest.fn(() => <div>foo</div>);

    render(
        <PromiseStatus promise={ promise }>
            { childrenFn }
        </PromiseStatus>
    );

    await pDelay(10);

    expect(childrenFn).toHaveBeenCalledTimes(2);
    expect(childrenFn).toHaveBeenNthCalledWith(1, 'pending', undefined);
    expect(childrenFn).toHaveBeenNthCalledWith(2, 'rejected', error);
});

it('should rerender correctly if promise changes', async () => {
    const promise1 = Promise.resolve('foo');
    const promise2 = Promise.resolve('bar');
    const childrenFn = jest.fn(() => <div>foo</div>);

    const { rerender } = render(
        <PromiseStatus promise={ promise1 }>
            { childrenFn }
        </PromiseStatus>
    );

    await pDelay(10);

    rerender(
        <PromiseStatus promise={ promise2 }>
            { childrenFn }
        </PromiseStatus>
    );

    await pDelay(10);

    expect(childrenFn).toHaveBeenCalledTimes(4);
    expect(childrenFn).toHaveBeenNthCalledWith(1, 'pending', undefined);
    expect(childrenFn).toHaveBeenNthCalledWith(2, 'fulfilled', 'foo');
    expect(childrenFn).toHaveBeenNthCalledWith(3, 'pending', undefined);
    expect(childrenFn).toHaveBeenNthCalledWith(4, 'fulfilled', 'bar');
});

describe('props as options', () => {
    it('should pass statusMap prop as an option to the hook', async () => {
        const promise = Promise.resolve('foo');
        const statusMap = { pending: 'loading' };
        const childrenFn = jest.fn(() => <div>foo</div>);

        render(
            <PromiseStatus promise={ promise } statusMap={ statusMap }>
                { childrenFn }
            </PromiseStatus>
        );

        await pDelay(10);

        expect(childrenFn).toHaveBeenCalledTimes(2);
        expect(childrenFn).toHaveBeenNthCalledWith(1, 'loading', undefined);
        expect(childrenFn).toHaveBeenNthCalledWith(2, 'fulfilled', 'foo');
    });

    it('should pass delayMs prop as an option to the hook', async () => {
        const promise = pDelay(100).then(() => 'foo');
        const childrenFn = jest.fn(() => <div>foo</div>);

        render(
            <PromiseStatus promise={ promise } delayMs={ 1 }>
                { childrenFn }
            </PromiseStatus>
        );

        await pDelay(110);

        expect(childrenFn).toHaveBeenCalledTimes(3);
        expect(childrenFn).toHaveBeenNthCalledWith(1, 'none', undefined);
        expect(childrenFn).toHaveBeenNthCalledWith(2, 'pending', undefined);
        expect(childrenFn).toHaveBeenNthCalledWith(3, 'fulfilled', 'foo');
    });

    it('should pass resetDelayMs prop as an option to the hook', async () => {
        const promise = Promise.resolve('foo');
        const childrenFn = jest.fn(() => <div>foo</div>);

        render(
            <PromiseStatus promise={ promise } resetDelayMs={ 100 }>
                { childrenFn }
            </PromiseStatus>
        );

        await pDelay(110);

        expect(childrenFn).toHaveBeenCalledTimes(3);
        expect(childrenFn).toHaveBeenNthCalledWith(1, 'pending', undefined);
        expect(childrenFn).toHaveBeenNthCalledWith(2, 'fulfilled', 'foo');
        expect(childrenFn).toHaveBeenNthCalledWith(3, 'none', undefined);
    });
});
