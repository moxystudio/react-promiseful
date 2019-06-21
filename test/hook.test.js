import React, { Fragment } from 'react';
import { render } from '@testing-library/react';
import pDelay from 'delay';
import { usePromiseState } from '../src';
import hideGlobalErrors from './util/hide-global-errors';

const PromiseState = ({ promise, children, ...options }) => {
    const promiseState = usePromiseState(promise, options);

    return children(promiseState);
};

beforeEach(() => {
    // Hide "An update to null inside a test was not wrapped in act(...)" error
    // This won't be needed in react-dom@^16.9.0 because `act()` will support promises
    // See: https://github.com/facebook/react/issues/14769#issuecomment-479592338
    hideGlobalErrors();
});

it('should return the correct status and value when fullfilled', async () => {
    const childrenFn = jest.fn(() => <div>foo</div>);
    const promise = Promise.resolve('foo');

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

it('should return the correct status and value when rejected', async () => {
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

it('should return the correct status if there\'s no promise', async () => {
    const childrenFn = jest.fn(() => <div>foo</div>);

    render(
        <PromiseState>
            { childrenFn }
        </PromiseState>
    );

    await pDelay(10);

    expect(childrenFn).toHaveBeenCalledTimes(1);
    expect(childrenFn).toHaveBeenNthCalledWith(1, { status: 'none', value: undefined, withinThreshold: undefined });
});

it('should behave correctly if promise changes', async () => {
    const promise1 = Promise.resolve('foo');
    const promise2 = Promise.resolve('bar');
    const childrenFn = jest.fn(() => <div>foo</div>);

    const { rerender } = render(
        <PromiseState promise={ promise1 }>
            { childrenFn }
        </PromiseState>
    );

    await pDelay(10);

    expect(childrenFn).toHaveBeenCalledTimes(2);
    expect(childrenFn).toHaveBeenNthCalledWith(1, { status: 'pending', value: undefined, withinThreshold: false });
    expect(childrenFn).toHaveBeenNthCalledWith(2, { status: 'fulfilled', value: 'foo', withinThreshold: false });
    childrenFn.mockClear();

    rerender(
        <PromiseState promise={ promise2 }>
            { childrenFn }
        </PromiseState>
    );

    await pDelay(10);

    expect(childrenFn).toHaveBeenCalledTimes(3);
    expect(childrenFn).toHaveBeenNthCalledWith(1, { status: 'fulfilled', value: 'foo', withinThreshold: false });
    expect(childrenFn).toHaveBeenNthCalledWith(2, { status: 'pending', value: undefined, withinThreshold: false });
    expect(childrenFn).toHaveBeenNthCalledWith(3, { status: 'fulfilled', value: 'bar', withinThreshold: false });
});

it('should cleanup correctly if a fulfilled promise changes', async () => {
    const promise1 = Promise.resolve('foo');
    const promise2 = Promise.resolve('bar');
    const childrenFn = jest.fn(() => <div>foo</div>);

    const { rerender } = render(
        <PromiseState promise={ promise1 }>
            { childrenFn }
        </PromiseState>
    );

    expect(childrenFn).toHaveBeenCalledTimes(1);
    expect(childrenFn).toHaveBeenNthCalledWith(1, { status: 'pending', value: undefined, withinThreshold: false });
    childrenFn.mockClear();

    rerender(
        <PromiseState promise={ promise2 }>
            { childrenFn }
        </PromiseState>
    );

    await pDelay(10);

    expect(childrenFn).toHaveBeenCalledTimes(2);
    expect(childrenFn).toHaveBeenNthCalledWith(1, { status: 'pending', value: undefined, withinThreshold: false });
    expect(childrenFn).toHaveBeenNthCalledWith(2, { status: 'fulfilled', value: 'bar', withinThreshold: false });
});

it('should cleanup correctly if a rejected promise changes', async () => {
    const promise1 = Promise.reject(new Error('foo'));
    const promise2 = Promise.resolve('bar');
    const childrenFn = jest.fn(() => <div>foo</div>);

    promise1.catch(() => {});

    const { rerender } = render(
        <PromiseState promise={ promise1 }>
            { childrenFn }
        </PromiseState>
    );

    expect(childrenFn).toHaveBeenCalledTimes(1);
    expect(childrenFn).toHaveBeenNthCalledWith(1, { status: 'pending', value: undefined, withinThreshold: false });
    childrenFn.mockClear();

    rerender(
        <PromiseState promise={ promise2 }>
            { childrenFn }
        </PromiseState>
    );

    await pDelay(10);

    expect(childrenFn).toHaveBeenCalledTimes(2);
    expect(childrenFn).toHaveBeenNthCalledWith(1, { status: 'pending', value: undefined, withinThreshold: false });
    expect(childrenFn).toHaveBeenNthCalledWith(2, { status: 'fulfilled', value: 'bar', withinThreshold: false });
});

it('should cleanup correctly on unmount', async () => {
    const promise = Promise.resolve('foo');
    const childrenFn = jest.fn(() => <div>foo</div>);

    const { unmount } = render(
        <PromiseState promise={ promise }>
            { childrenFn }
        </PromiseState>
    );

    expect(childrenFn).toHaveBeenCalledTimes(1);
    expect(childrenFn).toHaveBeenNthCalledWith(1, { status: 'pending', value: undefined, withinThreshold: false });
    childrenFn.mockClear();

    unmount();

    await pDelay(10);

    expect(childrenFn).toHaveBeenCalledTimes(0);
});

it('should work well if no options are passed', async () => {
    const PromiseState = ({ promise, children }) => {
        const promiseState = usePromiseState(promise);

        return children(promiseState);
    };

    const childrenFn = jest.fn(() => <div>foo</div>);

    render(
        <PromiseState>
            { childrenFn }
        </PromiseState>
    );

    await pDelay(10);

    expect(childrenFn).toHaveBeenCalledTimes(1);
    expect(childrenFn).toHaveBeenNthCalledWith(1, { status: 'none', value: undefined, withinThreshold: undefined });
});

describe('statusMap option', () => {
    it('should map status correctly', async () => {
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

    it('should allow nulish map values', async () => {
        const promise = Promise.resolve('foo');
        const childrenFn = jest.fn(() => <div>foo</div>);
        const statusMap = { pending: null, fulfilled: undefined };

        render(
            <PromiseState promise={ promise } statusMap={ statusMap }>
                { childrenFn }
            </PromiseState>
        );

        await pDelay(10);

        expect(childrenFn).toHaveBeenCalledTimes(2);
        expect(childrenFn).toHaveBeenNthCalledWith(1, { status: null, value: undefined, withinThreshold: false });
        expect(childrenFn).toHaveBeenNthCalledWith(2, { status: undefined, value: 'foo', withinThreshold: false });
    });

    it('should render correctly if statusMap changes', async () => {
        const promise = Promise.resolve('foo');
        const statusMap1 = { pending: 'loading' };
        const statusMap2 = { pending: 'buffering' };
        const childrenFn = jest.fn(() => <div>foo</div>);

        const { rerender } = render(
            <PromiseState promise={ promise } statusMap={ statusMap1 }>
                { childrenFn }
            </PromiseState>
        );

        expect(childrenFn).toHaveBeenCalledTimes(1);
        expect(childrenFn).toHaveBeenNthCalledWith(1, { status: 'loading', value: undefined, withinThreshold: false });
        childrenFn.mockClear();

        rerender(
            <PromiseState promise={ promise } statusMap={ statusMap2 }>
                { childrenFn }
            </PromiseState>
        );

        await pDelay(10);

        expect(childrenFn).toHaveBeenCalledTimes(2);
        expect(childrenFn).toHaveBeenNthCalledWith(1, { status: 'buffering', value: undefined, withinThreshold: false });
        expect(childrenFn).toHaveBeenNthCalledWith(2, { status: 'fulfilled', value: 'foo', withinThreshold: false });
    });
});

describe('thresholdMs option', () => {
    it('should return the correct withinThreshold if within the delay', async () => {
        const promise = Promise.resolve('foo');
        const childrenFn = jest.fn(() => <div>foo</div>);

        render(
            <PromiseState promise={ promise } thresholdMs={ 10 }>
                { childrenFn }
            </PromiseState>
        );

        await pDelay(20);

        expect(childrenFn).toHaveBeenCalledTimes(2);
        expect(childrenFn).toHaveBeenNthCalledWith(1, { status: 'pending', value: undefined, withinThreshold: true });
        expect(childrenFn).toHaveBeenNthCalledWith(2, { status: 'fulfilled', value: 'foo', withinThreshold: true });
    });

    it('should return the correct withinThreshold if outside the delay', async () => {
        const promise = pDelay(100).then(() => 'foo');
        const childrenFn = jest.fn(() => <div>foo</div>);

        render(
            <PromiseState promise={ promise } thresholdMs={ 1 }>
                { childrenFn }
            </PromiseState>
        );

        await pDelay(110);

        expect(childrenFn).toHaveBeenCalledTimes(3);
        expect(childrenFn).toHaveBeenNthCalledWith(1, { status: 'pending', value: undefined, withinThreshold: true });
        expect(childrenFn).toHaveBeenNthCalledWith(2, { status: 'pending', value: undefined, withinThreshold: false });
        expect(childrenFn).toHaveBeenNthCalledWith(3, { status: 'fulfilled', value: 'foo', withinThreshold: false });
    });

    it('should behave correctly if promise changes', async () => {
        const promise1 = Promise.resolve('foo');
        const promise2 = Promise.resolve('bar');
        const childrenFn = jest.fn(() => <div>foo</div>);

        const { rerender } = render(
            <PromiseState promise={ promise1 } thresholdMs={ 100 }>
                { childrenFn }
            </PromiseState>
        );

        await pDelay(10);

        expect(childrenFn).toHaveBeenCalledTimes(2);
        expect(childrenFn).toHaveBeenNthCalledWith(1, { status: 'pending', value: undefined, withinThreshold: true });
        expect(childrenFn).toHaveBeenNthCalledWith(2, { status: 'fulfilled', value: 'foo', withinThreshold: true });
        childrenFn.mockClear();

        rerender(
            <PromiseState promise={ promise2 } thresholdMs={ 100 }>
                { childrenFn }
            </PromiseState>
        );

        await pDelay(10);

        expect(childrenFn).toHaveBeenCalledTimes(3);
        expect(childrenFn).toHaveBeenNthCalledWith(1, { status: 'fulfilled', value: 'foo', withinThreshold: true });
        expect(childrenFn).toHaveBeenNthCalledWith(2, { status: 'pending', value: undefined, withinThreshold: true });
        expect(childrenFn).toHaveBeenNthCalledWith(3, { status: 'fulfilled', value: 'bar', withinThreshold: true });
    });

    it('should cleanup correctly if promise changes in between', async () => {
        const promise1 = Promise.resolve('foo');
        const promise2 = Promise.resolve('bar');
        const childrenFn = jest.fn(() => <div>foo</div>);

        const { rerender } = render(
            <PromiseState promise={ promise1 } thresholdMs={ 100 }>
                { childrenFn }
            </PromiseState>
        );

        expect(childrenFn).toHaveBeenCalledTimes(1);
        expect(childrenFn).toHaveBeenNthCalledWith(1, { status: 'pending', value: undefined, withinThreshold: true });
        childrenFn.mockClear();

        rerender(
            <PromiseState promise={ promise2 } thresholdMs={ 100 }>
                { childrenFn }
            </PromiseState>
        );

        await pDelay(10);

        expect(childrenFn).toHaveBeenCalledTimes(2);
        expect(childrenFn).toHaveBeenNthCalledWith(1, { status: 'pending', value: undefined, withinThreshold: true });
        expect(childrenFn).toHaveBeenNthCalledWith(2, { status: 'fulfilled', value: 'bar', withinThreshold: true });
    });

    it('should cleanup correctly on unmount', async () => {
        const childrenFn = jest.fn(() => <div>foo</div>);
        const promise = Promise.resolve('foo');

        const { unmount } = render(
            <PromiseState promise={ promise } thresholdMs={ 100 }>
                { childrenFn }
            </PromiseState>
        );

        unmount();

        await pDelay(10);

        expect(childrenFn).toHaveBeenCalledTimes(1);
        expect(childrenFn).toHaveBeenNthCalledWith(1, { status: 'pending', value: undefined, withinThreshold: true });
    });

    it('should behave correctly if promise is shared', async () => {
        const childrenFn = jest.fn(() => <div>foo</div>);
        const promise = Promise.resolve('foo');

        render(
            <Fragment>
                <PromiseState promise={ promise } thresholdMs={ 100 }>
                    { childrenFn }
                </PromiseState>
                <PromiseState promise={ promise } thresholdMs={ 100 }>
                    { childrenFn }
                </PromiseState>
            </Fragment>
        );

        await pDelay(10);

        expect(childrenFn).toHaveBeenCalledTimes(4);
        expect(childrenFn).toHaveBeenNthCalledWith(1, { status: 'pending', value: undefined, withinThreshold: true });
        expect(childrenFn).toHaveBeenNthCalledWith(2, { status: 'pending', value: undefined, withinThreshold: true });
        expect(childrenFn).toHaveBeenNthCalledWith(3, { status: 'fulfilled', value: 'foo', withinThreshold: true });
        expect(childrenFn).toHaveBeenNthCalledWith(4, { status: 'fulfilled', value: 'foo', withinThreshold: true });
    });
});

describe('onSettle option', () => {
    it('should be called when the promise fulfills', async () => {
        const onSettle = jest.fn();
        const promise = Promise.resolve('foo');

        render(
            <PromiseState promise={ promise } onSettle={ onSettle }>
                { () => <div>foo</div> }
            </PromiseState>
        );

        await pDelay(10);

        expect(onSettle).toHaveBeenCalledTimes(1);
        expect(onSettle).toHaveBeenNthCalledWith(1, { status: 'fulfilled', value: 'foo', withinThreshold: false });
    });

    it('should be called when the promise rejects', async () => {
        const onSettle = jest.fn();
        const error = new Error('foo');
        const promise = Promise.reject(error);

        render(
            <PromiseState promise={ promise } onSettle={ onSettle }>
                { () => <div>foo</div> }
            </PromiseState>
        );

        await pDelay(10);

        expect(onSettle).toHaveBeenCalledTimes(1);
        expect(onSettle).toHaveBeenNthCalledWith(1, { status: 'rejected', value: error, withinThreshold: false });
    });

    it('should be called two times when the promise changes', async () => {
        const onSettle = jest.fn();
        const promise1 = Promise.resolve('foo');
        const promise2 = Promise.resolve('bar');

        const { rerender } = render(
            <PromiseState promise={ promise1 } onSettle={ onSettle }>
                { () => <div>foo</div> }
            </PromiseState>
        );

        await pDelay(10);

        rerender(
            <PromiseState promise={ promise2 } onSettle={ onSettle }>
                { () => <div>foo</div> }
            </PromiseState>
        );

        await pDelay(10);

        expect(onSettle).toHaveBeenCalledTimes(2);
        expect(onSettle).toHaveBeenNthCalledWith(1, { status: 'fulfilled', value: 'foo', withinThreshold: false });
        expect(onSettle).toHaveBeenNthCalledWith(2, { status: 'fulfilled', value: 'bar', withinThreshold: false });
    });

    it('should be called once when the promise changes in between', async () => {
        const onSettle = jest.fn();
        const promise1 = Promise.resolve('foo');
        const promise2 = Promise.resolve('bar');

        const { rerender } = render(
            <PromiseState promise={ promise1 } onSettle={ onSettle }>
                { () => <div>foo</div> }
            </PromiseState>
        );

        rerender(
            <PromiseState promise={ promise2 } onSettle={ onSettle }>
                { () => <div>foo</div> }
            </PromiseState>
        );

        await pDelay(10);

        expect(onSettle).toHaveBeenCalledTimes(1);
        expect(onSettle).toHaveBeenNthCalledWith(1, { status: 'fulfilled', value: 'bar', withinThreshold: false });
    });

    it('should behave correctly if onSettle changes', async () => {
        const onSettle1 = jest.fn();
        const onSettle2 = jest.fn();
        const promise1 = Promise.resolve('foo');
        const promise2 = Promise.resolve('bar');

        const { rerender } = render(
            <PromiseState promise={ promise1 } onSettle={ onSettle1 }>
                { () => <div>foo</div> }
            </PromiseState>
        );

        await pDelay(10);

        expect(onSettle1).toHaveBeenCalledTimes(1);
        expect(onSettle2).toHaveBeenCalledTimes(0);

        rerender(
            <PromiseState promise={ promise1 } onSettle={ onSettle2 }>
                { () => <div>foo</div> }
            </PromiseState>
        );

        await pDelay(10);

        expect(onSettle1).toHaveBeenCalledTimes(1);
        expect(onSettle2).toHaveBeenCalledTimes(0);

        rerender(
            <PromiseState promise={ promise2 } onSettle={ onSettle2 }>
                { () => <div>foo</div> }
            </PromiseState>
        );

        await pDelay(10);

        expect(onSettle1).toHaveBeenCalledTimes(1);
        expect(onSettle1).toHaveBeenNthCalledWith(1, { status: 'fulfilled', value: 'foo', withinThreshold: false });
        expect(onSettle2).toHaveBeenCalledTimes(1);
        expect(onSettle2).toHaveBeenNthCalledWith(1, { status: 'fulfilled', value: 'bar', withinThreshold: false });
    });

    it('should cleanup correctly on unmount', async () => {
        const onSettle = jest.fn();
        const promise = Promise.resolve('foo');

        const { unmount } = render(
            <PromiseState promise={ promise } onSettle={ onSettle }>
                { () => <div>foo</div> }
            </PromiseState>
        );

        unmount();

        await pDelay(10);

        expect(onSettle).toHaveBeenCalledTimes(0);
    });
});

describe('onSettleDelay option', () => {
    it('should respect the delay when fulfilled', async () => {
        const onSettle = jest.fn();
        const promise = Promise.resolve('foo');

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

    it('should respect the delay when rejected', async () => {
        const onSettle = jest.fn();
        const error = new Error('foo');
        const promise = Promise.reject(error);

        render(
            <PromiseState promise={ promise } onSettle={ onSettle } onSettleDelayMs={ 20 }>
                { () => <div>foo</div> }
            </PromiseState>
        );

        await pDelay(10);

        expect(onSettle).toHaveBeenCalledTimes(0);

        await pDelay(20);

        expect(onSettle).toHaveBeenCalledTimes(1);
        expect(onSettle).toHaveBeenNthCalledWith(1, { status: 'rejected', value: error, withinThreshold: false });
    });

    it('should respect granular fulfilled delay', async () => {
        const onSettle = jest.fn();
        const onSettleDelayMs = { fulfilled: 20 };
        const promise = Promise.resolve('foo');

        render(
            <PromiseState promise={ promise } onSettle={ onSettle } onSettleDelayMs={ onSettleDelayMs }>
                { () => <div>foo</div> }
            </PromiseState>
        );

        await pDelay(10);

        expect(onSettle).toHaveBeenCalledTimes(0);

        await pDelay(20);

        expect(onSettle).toHaveBeenCalledTimes(1);
        expect(onSettle).toHaveBeenNthCalledWith(1, { status: 'fulfilled', value: 'foo', withinThreshold: false });
    });

    it('should respect granular rejected delay', async () => {
        const onSettle = jest.fn();
        const onSettleDelayMs = { rejected: 20 };
        const error = new Error('foo');
        const promise = Promise.reject(error);

        render(
            <PromiseState promise={ promise } onSettle={ onSettle } onSettleDelayMs={ onSettleDelayMs }>
                { () => <div>foo</div> }
            </PromiseState>
        );

        await pDelay(10);

        expect(onSettle).toHaveBeenCalledTimes(0);

        await pDelay(20);

        expect(onSettle).toHaveBeenCalledTimes(1);
        expect(onSettle).toHaveBeenNthCalledWith(1, { status: 'rejected', value: error, withinThreshold: false });
    });

    it('should respect granular fulfilledWithinThreshold delay', async () => {
        const onSettle = jest.fn();
        const onSettleDelayMs = { fulfilledWithinThreshold: 20 };
        const promise = Promise.resolve('foo');

        render(
            <PromiseState
                promise={ promise }
                thresholdMs={ 100 }
                onSettle={ onSettle }
                onSettleDelayMs={ onSettleDelayMs }>
                { () => <div>foo</div> }
            </PromiseState>
        );

        await pDelay(10);

        expect(onSettle).toHaveBeenCalledTimes(0);

        await pDelay(20);

        expect(onSettle).toHaveBeenCalledTimes(1);
        expect(onSettle).toHaveBeenNthCalledWith(1, { status: 'fulfilled', value: 'foo', withinThreshold: true });
    });

    it('should respect granular rejectedWithinThreshold delay', async () => {
        const onSettle = jest.fn();
        const onSettleDelayMs = { rejectedWithinThreshold: 20 };
        const error = new Error('foo');
        const promise = Promise.reject(error);

        render(
            <PromiseState
                promise={ promise }
                thresholdMs={ 100 }
                onSettle={ onSettle }
                onSettleDelayMs={ onSettleDelayMs }>
                { () => <div>foo</div> }
            </PromiseState>
        );

        await pDelay(10);

        expect(onSettle).toHaveBeenCalledTimes(0);

        await pDelay(20);

        expect(onSettle).toHaveBeenCalledTimes(1);
        expect(onSettle).toHaveBeenNthCalledWith(1, { status: 'rejected', value: error, withinThreshold: true });
    });
});
