import React from 'react';
import { render } from '@testing-library/react';
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
    expect(childrenFn).toHaveBeenNthCalledWith(1, { status: 'pending', value: undefined, withinThreshold: false });
    expect(childrenFn).toHaveBeenNthCalledWith(2, { status: 'fulfilled', value: 'foo', withinThreshold: false });
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
    expect(childrenFn).toHaveBeenNthCalledWith(1, { status: 'pending', value: undefined, withinThreshold: false });
    expect(childrenFn).toHaveBeenNthCalledWith(2, { status: 'rejected', value: error, withinThreshold: false });
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
    expect(childrenFn).toHaveBeenNthCalledWith(1, { status: 'pending', value: undefined, withinThreshold: false });
    expect(childrenFn).toHaveBeenNthCalledWith(2, { status: 'fulfilled', value: 'foo', withinThreshold: false });
    expect(childrenFn).toHaveBeenNthCalledWith(3, { status: 'pending', value: undefined, withinThreshold: false });
    expect(childrenFn).toHaveBeenNthCalledWith(4, { status: 'fulfilled', value: 'bar', withinThreshold: false });
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
        expect(childrenFn).toHaveBeenNthCalledWith(1, { status: 'loading', value: undefined, withinThreshold: false });
        expect(childrenFn).toHaveBeenNthCalledWith(2, { status: 'fulfilled', value: 'foo', withinThreshold: false });
    });

    it('should pass threshold prop as an option to the hook', async () => {
        const promise = pDelay(50).then(() => 'foo');
        const childrenFn = jest.fn(() => <div>foo</div>);

        render(
            <PromiseState promise={ promise } thresholdMs={ 1 }>
                { childrenFn }
            </PromiseState>
        );

        await pDelay(60);

        expect(childrenFn).toHaveBeenCalledTimes(3);
        expect(childrenFn).toHaveBeenNthCalledWith(1, { status: 'pending', value: undefined, withinThreshold: true });
        expect(childrenFn).toHaveBeenNthCalledWith(2, { status: 'pending', value: undefined, withinThreshold: false });
        expect(childrenFn).toHaveBeenNthCalledWith(3, { status: 'fulfilled', value: 'foo', withinThreshold: false });
    });

    it('should pass onSettle prop as an option to the hook', async () => {
        const promise = Promise.resolve('foo');
        const onSettle = jest.fn();

        render(
            <PromiseState promise={ promise } onSettle={ onSettle }>
                { () => <div>foo</div> }
            </PromiseState>
        );

        await pDelay(10);

        expect(onSettle).toHaveBeenCalledTimes(1);
        expect(onSettle).toHaveBeenNthCalledWith(1, { status: 'fulfilled', value: 'foo', withinThreshold: false });
    });

    it('should pass onSettleDelayMs prop as an option to the hook', async () => {
        const promise = Promise.resolve('foo');
        const onSettle = jest.fn();

        render(
            <PromiseState promise={ promise } onSettle={ onSettle } onSettleDelayMs={ 20 }>
                { () => <div>foo</div> }
            </PromiseState>
        );

        await pDelay(10);

        expect(onSettle).toHaveBeenCalledTimes(0);

        await pDelay(20);

        expect(onSettle).toHaveBeenCalledTimes(1);
        expect(onSettle).toHaveBeenNthCalledWith(1, { status: 'fulfilled', value: 'foo', withinThreshold: false });
    });
});
