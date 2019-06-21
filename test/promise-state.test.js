import React from 'react';
import { render } from '@testing-library/react';
import { PromiseState, getPromiseState } from '../src';
import hideGlobalErrors from './util/hide-global-errors';

beforeEach(() => {
    // Hide "An update to null inside a test was not wrapped in act(...)" error
    // This won't be needed in react-dom@^16.9.0 because `act()` will support promises
    // See: https://github.com/facebook/react/issues/14769#issuecomment-479592338
    hideGlobalErrors();
});

it('should return the correct promise state when pending', async () => {
    const promise = Promise.resolve('foo');
    const childrenFn = jest.fn(() => <div>foo</div>);

    render(
        <PromiseState promise={ promise }>
            { childrenFn }
        </PromiseState>
    );

    expect(getPromiseState(promise)).toEqual({ status: 'pending', value: undefined });

    await promise;
});

it('should return the correct promise state when fulfilled', async () => {
    const promise = Promise.resolve('foo');
    const childrenFn = jest.fn(() => <div>foo</div>);

    render(
        <PromiseState promise={ promise }>
            { childrenFn }
        </PromiseState>
    );

    await promise;

    expect(getPromiseState(promise)).toEqual({ status: 'fulfilled', value: 'foo' });
});

it('should return the correct promise state when rejected', async () => {
    const error = new Error('foo');
    const promise = Promise.reject(error);
    const childrenFn = jest.fn(() => <div>foo</div>);

    render(
        <PromiseState promise={ promise }>
            { childrenFn }
        </PromiseState>
    );

    await promise.catch(() => {});

    expect(getPromiseState(promise)).toEqual({ status: 'rejected', value: error });
});

it('should return the correct promise state if no promise is passed', () => {
    expect(getPromiseState()).toEqual({ status: 'none', value: undefined });
});

it('should return undefined if not used yet by the component nor wook', () => {
    expect(getPromiseState(Promise.resolve('foo'))).toEqual({ status: 'pending', value: undefined });
});
