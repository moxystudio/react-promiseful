import React, { useMemo } from 'react';
import { render } from 'react-testing-library';
import pDelay from 'delay';
import { usePromiseStatus } from '../src';
import hideGlobalErrors from './util/hide-global-errors';

const PromiseStatus = ({ promise, children, ...options }) => {
    const [status, value] = usePromiseStatus(promise, options);

    return children(status, value);
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
        <PromiseStatus promise={ promise }>
            { childrenFn }
        </PromiseStatus>
    );

    await pDelay(10);

    expect(childrenFn).toHaveBeenCalledTimes(2);
    expect(childrenFn).toHaveBeenNthCalledWith(1, 'pending', undefined);
    expect(childrenFn).toHaveBeenNthCalledWith(2, 'fulfilled', 'foo');
});

it('should return the correct status and value when rejected', async () => {
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

it('should return the correct status if there\'s no promise', async () => {
    const childrenFn = jest.fn(() => <div>foo</div>);

    render(
        <PromiseStatus>
            { childrenFn }
        </PromiseStatus>
    );

    await pDelay(10);

    expect(childrenFn).toHaveBeenCalledTimes(1);
    expect(childrenFn).toHaveBeenNthCalledWith(1, 'none', undefined);
});

it('should update correctly if promise changes', async () => {
    const promise1 = Promise.resolve('foo');
    const promise2 = Promise.resolve('bar');
    const childrenFn = jest.fn(() => <div>foo</div>);

    const { rerender } = render(
        <PromiseStatus promise={ promise1 }>
            { childrenFn }
        </PromiseStatus>
    );

    await pDelay(10);

    expect(childrenFn).toHaveBeenCalledTimes(2);
    expect(childrenFn).toHaveBeenNthCalledWith(1, 'pending', undefined);
    expect(childrenFn).toHaveBeenNthCalledWith(2, 'fulfilled', 'foo');
    childrenFn.mockClear();

    rerender(
        <PromiseStatus promise={ promise2 }>
            { childrenFn }
        </PromiseStatus>
    );

    await pDelay(10);

    expect(childrenFn).toHaveBeenCalledTimes(3);
    expect(childrenFn).toHaveBeenNthCalledWith(1, 'fulfilled', 'foo');
    expect(childrenFn).toHaveBeenNthCalledWith(2, 'pending', undefined);
    expect(childrenFn).toHaveBeenNthCalledWith(3, 'fulfilled', 'bar');
});

it('should cleanup correctly if a fulfilled promise changes', async () => {
    const promise1 = Promise.resolve('foo');
    const promise2 = Promise.resolve('bar');
    const childrenFn = jest.fn(() => <div>foo</div>);

    const { rerender } = render(
        <PromiseStatus promise={ promise1 }>
            { childrenFn }
        </PromiseStatus>
    );

    expect(childrenFn).toHaveBeenCalledTimes(1);
    expect(childrenFn).toHaveBeenNthCalledWith(1, 'pending', undefined);
    childrenFn.mockClear();

    rerender(
        <PromiseStatus promise={ promise2 }>
            { childrenFn }
        </PromiseStatus>
    );

    await pDelay(10);

    expect(childrenFn).toHaveBeenCalledTimes(2);
    expect(childrenFn).toHaveBeenNthCalledWith(1, 'pending', undefined);
    expect(childrenFn).toHaveBeenNthCalledWith(2, 'fulfilled', 'bar');
});

it('should cleanup correctly if a rejected promise changes', async () => {
    const promise1 = Promise.reject(new Error('foo'));
    const promise2 = Promise.resolve('bar');
    const childrenFn = jest.fn(() => <div>foo</div>);

    const { rerender } = render(
        <PromiseStatus promise={ promise1 }>
            { childrenFn }
        </PromiseStatus>
    );

    expect(childrenFn).toHaveBeenCalledTimes(1);
    expect(childrenFn).toHaveBeenNthCalledWith(1, 'pending', undefined);
    childrenFn.mockClear();

    rerender(
        <PromiseStatus promise={ promise2 }>
            { childrenFn }
        </PromiseStatus>
    );

    await pDelay(10);

    expect(childrenFn).toHaveBeenCalledTimes(2);
    expect(childrenFn).toHaveBeenNthCalledWith(1, 'pending', undefined);
    expect(childrenFn).toHaveBeenNthCalledWith(2, 'fulfilled', 'bar');
});

it('should cleanup correctly on unmount', async () => {
    const promise = Promise.resolve('foo');
    const childrenFn = jest.fn(() => <div>foo</div>);

    const { unmount } = render(
        <PromiseStatus promise={ promise }>
            { childrenFn }
        </PromiseStatus>
    );

    expect(childrenFn).toHaveBeenCalledTimes(1);
    expect(childrenFn).toHaveBeenNthCalledWith(1, 'pending', undefined);
    childrenFn.mockClear();

    unmount();

    await pDelay(10);

    expect(childrenFn).toHaveBeenCalledTimes(0);
});

it('should work well if no options are passed', async () => {
    const PromiseStatus = ({ promise, children }) => {
        const [status, value] = usePromiseStatus(promise);

        return children(status, value);
    };

    const childrenFn = jest.fn(() => <div>foo</div>);

    render(
        <PromiseStatus>
            { childrenFn }
        </PromiseStatus>
    );

    await pDelay(10);

    expect(childrenFn).toHaveBeenCalledTimes(1);
    expect(childrenFn).toHaveBeenNthCalledWith(1, 'none', undefined);
});

describe('statusMap option', () => {
    it('should map status correctly', async () => {
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

    it('should allow nulish map values', async () => {
        const promise = Promise.resolve('foo');
        const childrenFn = jest.fn(() => <div>foo</div>);
        const statusMap = { pending: null, fulfilled: undefined };

        render(
            <PromiseStatus promise={ promise } statusMap={ statusMap }>
                { childrenFn }
            </PromiseStatus>
        );

        await pDelay(10);

        expect(childrenFn).toHaveBeenCalledTimes(2);
        expect(childrenFn).toHaveBeenNthCalledWith(1, null, undefined);
        expect(childrenFn).toHaveBeenNthCalledWith(2, undefined, 'foo');
    });

    it('should render correctly if statusMap changes', async () => {
        const promise = Promise.resolve('foo');
        const statusMap1 = { pending: 'loading' };
        const statusMap2 = { pending: 'buffering' };
        const childrenFn = jest.fn(() => <div>foo</div>);

        const { rerender } = render(
            <PromiseStatus promise={ promise } statusMap={ statusMap1 }>
                { childrenFn }
            </PromiseStatus>
        );

        expect(childrenFn).toHaveBeenCalledTimes(1);
        expect(childrenFn).toHaveBeenNthCalledWith(1, 'loading', undefined);
        childrenFn.mockClear();

        rerender(
            <PromiseStatus promise={ promise } statusMap={ statusMap2 }>
                { childrenFn }
            </PromiseStatus>
        );

        await pDelay(10);

        expect(childrenFn).toHaveBeenCalledTimes(2);
        expect(childrenFn).toHaveBeenNthCalledWith(1, 'buffering', undefined);
        expect(childrenFn).toHaveBeenNthCalledWith(2, 'fulfilled', 'foo');
    });
});

describe('delayMs option', () => {
    it('should not call with pending within delay', async () => {
        const promise = Promise.resolve('foo');
        const childrenFn = jest.fn(() => <div>foo</div>);

        render(
            <PromiseStatus promise={ promise } delayMs={ 100 }>
                { childrenFn }
            </PromiseStatus>
        );

        await pDelay(10);

        expect(childrenFn).toHaveBeenCalledTimes(2);
        expect(childrenFn).toHaveBeenNthCalledWith(1, 'none', undefined);
        expect(childrenFn).toHaveBeenNthCalledWith(2, 'fulfilled', 'foo');
    });

    it('should call with pending outside delay', async () => {
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

    it('should render correctly if promise changes', async () => {
        const promise1 = Promise.resolve('foo');
        const promise2 = Promise.resolve('bar');
        const childrenFn = jest.fn(() => <div>foo</div>);

        const { rerender } = render(
            <PromiseStatus promise={ promise1 } delayMs={ 100 }>
                { childrenFn }
            </PromiseStatus>
        );

        await pDelay(10);

        expect(childrenFn).toHaveBeenCalledTimes(2);
        expect(childrenFn).toHaveBeenNthCalledWith(1, 'none', undefined);
        expect(childrenFn).toHaveBeenNthCalledWith(2, 'fulfilled', 'foo');
        childrenFn.mockClear();

        rerender(
            <PromiseStatus promise={ promise2 } delayMs={ 100 }>
                { childrenFn }
            </PromiseStatus>
        );

        await pDelay(10);

        expect(childrenFn).toHaveBeenCalledTimes(2);
        expect(childrenFn).toHaveBeenNthCalledWith(1, 'fulfilled', 'foo');
        expect(childrenFn).toHaveBeenNthCalledWith(2, 'fulfilled', 'bar');
    });

    it('should cleanup correctly if promise changes in between', async () => {
        const promise1 = Promise.resolve('foo');
        const promise2 = Promise.resolve('bar');
        const childrenFn = jest.fn(() => <div>foo</div>);

        const { rerender } = render(
            <PromiseStatus promise={ promise1 } delayMs={ 100 }>
                { childrenFn }
            </PromiseStatus>
        );

        expect(childrenFn).toHaveBeenCalledTimes(1);
        expect(childrenFn).toHaveBeenNthCalledWith(1, 'none', undefined);
        childrenFn.mockClear();

        rerender(
            <PromiseStatus promise={ promise2 } delayMs={ 100 }>
                { childrenFn }
            </PromiseStatus>
        );

        await pDelay(10);

        expect(childrenFn).toHaveBeenCalledTimes(2);
        expect(childrenFn).toHaveBeenNthCalledWith(1, 'none', undefined);
        expect(childrenFn).toHaveBeenNthCalledWith(2, 'fulfilled', 'bar');
    });

    it('should cleanup correctly on unmount', async () => {
        const childrenFn = jest.fn(() => <div>foo</div>);
        const promise = Promise.resolve('foo');

        const { unmount } = render(
            <PromiseStatus promise={ promise } delayMs={ 100 }>
                { childrenFn }
            </PromiseStatus>
        );

        unmount();

        await pDelay(10);

        expect(childrenFn).toHaveBeenCalledTimes(1);
        expect(childrenFn).toHaveBeenNthCalledWith(1, 'none', undefined);
    });
});

describe('resetDelayMs option', () => {
    it('should reset status after the delay', async () => {
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

    it('should cleanup correctly if promise changes in between', async () => {
        const promise1 = Promise.resolve('foo');
        const promise2 = Promise.resolve('bar');
        const childrenFn = jest.fn(() => <div>foo</div>);

        const { rerender } = render(
            <PromiseStatus promise={ promise1 } resetDelayMs={ 100 }>
                { childrenFn }
            </PromiseStatus>
        );

        await pDelay(10);

        expect(childrenFn).toHaveBeenCalledTimes(2);
        expect(childrenFn).toHaveBeenNthCalledWith(1, 'pending', undefined);
        expect(childrenFn).toHaveBeenNthCalledWith(2, 'fulfilled', 'foo');
        childrenFn.mockClear();

        rerender(
            <PromiseStatus promise={ promise2 } resetDelayMs={ 100 }>
                { childrenFn }
            </PromiseStatus>
        );

        await pDelay(110);

        expect(childrenFn).toHaveBeenCalledTimes(4);
        expect(childrenFn).toHaveBeenNthCalledWith(1, 'fulfilled', 'foo');
        expect(childrenFn).toHaveBeenNthCalledWith(2, 'pending', undefined);
        expect(childrenFn).toHaveBeenNthCalledWith(3, 'fulfilled', 'bar');
        expect(childrenFn).toHaveBeenNthCalledWith(4, 'none', undefined);
    });

    it('should cleanup correctly on unmount', async () => {
        const promise = Promise.resolve('foo');
        const childrenFn = jest.fn(() => <div>foo</div>);

        const { unmount } = render(
            <PromiseStatus promise={ promise } resetDelayMs={ 100 }>
                { childrenFn }
            </PromiseStatus>
        );

        unmount();

        await pDelay(110);

        expect(childrenFn).toHaveBeenCalledTimes(1);
        expect(childrenFn).toHaveBeenNthCalledWith(1, 'pending', undefined);
    });
});
