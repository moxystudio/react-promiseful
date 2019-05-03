import React from 'react';
import { render } from 'react-testing-library';
import pDelay from 'delay';
import { PromiseState } from '../src';
import hideGlobalErrors from './util/hide-global-errors';

beforeEach(() => {
    // Hide "An update to null inside a test was not wrapped in act(...)" error
    // This won't be needed in react-dom@^16.9.0 because `act()` will support promises
    // See: https://github.com/facebook/react/issues/14769#issuecomment-479592338
    hideGlobalErrors();
});

it('should render correctly when fullfilled', async () => {
    const promise = Promise.resolve('foo');
    const childrenFn = jest.fn(() => <div>foo</div>);

    render(
        <PromiseState promise={ promise }>
            { childrenFn }
        </PromiseState>
    );

    await pDelay(10);

    expect(childrenFn).toHaveBeenCalledTimes(2);
    expect(childrenFn).toHaveBeenNthCalledWith(1, { status: 'pending', value: undefined });
    expect(childrenFn).toHaveBeenNthCalledWith(2, { status: 'fulfilled', value: 'foo' });
});

it('should render correctly when rejected', async () => {
    const error = new Error('foo');
    const promise = Promise.reject(error);
    const childrenFn = jest.fn(() => <div>foo</div>);

    promise.catch(() => {});

    render(
        <PromiseState promise={ promise }>
            { childrenFn }
        </PromiseState>
    );

    await pDelay(10);

    expect(childrenFn).toHaveBeenCalledTimes(2);
    expect(childrenFn).toHaveBeenNthCalledWith(1, { status: 'pending', value: undefined });
    expect(childrenFn).toHaveBeenNthCalledWith(2, { status: 'rejected', value: error });
});

it('should rerender correctly if promise changes', async () => {
    const promise1 = Promise.resolve('foo');
    const promise2 = Promise.resolve('bar');
    const childrenFn = jest.fn(() => <div>foo</div>);

    const { rerender } = render(
        <PromiseState promise={ promise1 }>
            { childrenFn }
        </PromiseState>
    );

    await pDelay(10);

    rerender(
        <PromiseState promise={ promise2 }>
            { childrenFn }
        </PromiseState>
    );

    await pDelay(10);

    expect(childrenFn).toHaveBeenCalledTimes(4);
    expect(childrenFn).toHaveBeenNthCalledWith(1, { status: 'pending', value: undefined });
    expect(childrenFn).toHaveBeenNthCalledWith(2, { status: 'fulfilled', value: 'foo' });
    expect(childrenFn).toHaveBeenNthCalledWith(3, { status: 'pending', value: undefined });
    expect(childrenFn).toHaveBeenNthCalledWith(4, { status: 'fulfilled', value: 'bar' });
});

describe('props as options', () => {
    it('should pass statusMap prop as an option to the hook', async () => {
        const promise = Promise.resolve('foo');
        const statusMap = { pending: 'loading' };
        const childrenFn = jest.fn(() => <div>foo</div>);

        render(
            <PromiseState promise={ promise } statusMap={ statusMap }>
                { childrenFn }
            </PromiseState>
        );

        await pDelay(10);

        expect(childrenFn).toHaveBeenCalledTimes(2);
        expect(childrenFn).toHaveBeenNthCalledWith(1, { status: 'loading', value: undefined });
        expect(childrenFn).toHaveBeenNthCalledWith(2, { status: 'fulfilled', value: 'foo' });
    });

    it('should pass delayMs prop as an option to the hook', async () => {
        const promise = pDelay(100).then(() => 'foo');
        const childrenFn = jest.fn(() => <div>foo</div>);

        render(
            <PromiseState promise={ promise } delayMs={ 1 }>
                { childrenFn }
            </PromiseState>
        );

        await pDelay(110);

        expect(childrenFn).toHaveBeenCalledTimes(3);
        expect(childrenFn).toHaveBeenNthCalledWith(1, undefined);
        expect(childrenFn).toHaveBeenNthCalledWith(2, { status: 'pending', value: undefined });
        expect(childrenFn).toHaveBeenNthCalledWith(3, { status: 'fulfilled', value: 'foo' });
    });

    it('should pass resetFulfilledDelayMs prop as an option to the hook', async () => {
        const promise = Promise.resolve('foo');
        const childrenFn = jest.fn(() => <div>foo</div>);

        render(
            <PromiseState promise={ promise } resetFulfilledDelayMs={ 100 }>
                { childrenFn }
            </PromiseState>
        );

        await pDelay(110);

        expect(childrenFn).toHaveBeenCalledTimes(3);
        expect(childrenFn).toHaveBeenNthCalledWith(1, { status: 'pending', value: undefined });
        expect(childrenFn).toHaveBeenNthCalledWith(2, { status: 'fulfilled', value: 'foo' });
        expect(childrenFn).toHaveBeenNthCalledWith(3, undefined);
    });

    it('should pass resetRejectedDelayMs prop as an option to the hook', async () => {
        const error = new Error('foo');
        const promise = Promise.reject(error);
        const childrenFn = jest.fn(() => <div>foo</div>);

        promise.catch(() => {});

        render(
            <PromiseState promise={ promise } resetRejectedDelayMs={ 100 }>
                { childrenFn }
            </PromiseState>
        );

        await pDelay(110);

        expect(childrenFn).toHaveBeenCalledTimes(3);
        expect(childrenFn).toHaveBeenNthCalledWith(1, { status: 'pending', value: undefined });
        expect(childrenFn).toHaveBeenNthCalledWith(2, { status: 'rejected', value: error });
        expect(childrenFn).toHaveBeenNthCalledWith(3, undefined);
    });
});
