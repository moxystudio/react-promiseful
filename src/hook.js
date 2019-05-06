import { useEffect, useReducer, useMemo, useRef } from 'react';
import pDelay from 'delay';
import { isEqual } from 'lodash';
import { resolvePromise } from './promise';
import selectObjectValueBasedOnState from './util/select-object-value';

const reducer = (state, action) => {
    let newState;

    switch (action.type) {
    case 'reset':
        newState = { status: 'none', value: undefined, withinThreshold: undefined };
        break;
    case 'pending': {
        newState = { status: 'pending', value: undefined, withinThreshold: action.payload };
        break;
    }
    case 'rejected':
        newState = { ...state, status: 'rejected', value: action.payload };
        break;
    case 'fulfilled':
        newState = { ...state, status: 'fulfilled', value: action.payload };
        break;
    /* istanbul ignore next */
    default:
        throw new Error('Unknown action type');
    }

    // Keep the same state reference if they are strictly equal to avoid rerenders
    return isEqual(newState, state) ? state : newState;
};

const getInitialState = (promise, options) => ({
    status: !promise ? 'none' : 'pending',
    value: undefined,
    withinThreshold: !promise ? undefined : options.thresholdMs > 0,
});

const useResolvePromise = (promise, dispatch, options) => {
    const { thresholdMs } = options;

    useEffect(() => {
        // Short-circuit if there's no promise
        if (!promise) {
            dispatch({ type: 'reset' });

            return;
        }

        let cancelDelay;

        // If there's no delay, set status to 'pending' right away
        // Otherwise wait for the specified elay
        if (thresholdMs > 0) {
            dispatch({ type: 'pending', payload: true });

            cancelDelay = resolvePromise(pDelay(thresholdMs), {
                then: () => dispatch({ type: 'pending', payload: false }),
            });
        } else {
            dispatch({ type: 'pending', payload: false });
        }

        const cancelResolve = resolvePromise(promise, {
            then: (value) => dispatch({ type: 'fulfilled', payload: value }),
            catch: (err) => dispatch({ type: 'rejected', payload: err }),
            finally: () => {
                cancelDelay && cancelDelay();
            },
        }, true);

        return () => {
            // Cancel delay & cancel resolving promise
            cancelResolve();
            cancelDelay && cancelDelay();
        };
    }, [promise]);
};

const useNotifySettled = (state, options) => {
    const { onSettle, onSettleDelayMs: onSettleDelayMs_ } = options;

    const onSettleDelayMs = useMemo(() => {
        if (typeof onSettleDelayMs_ === 'number') {
            return {
                fulfilled: onSettleDelayMs_,
                rejected: onSettleDelayMs_,
            };
        }

        return {
            fulfilled: 0,
            rejected: 0,
            ...onSettleDelayMs_,
        };
    }, [onSettleDelayMs_]);

    const stateRef = useRef();

    useEffect(() => {
        // Short-circuit if there's no callback
        if (!onSettle) {
            return;
        }

        // Short-circuit if state hasn't changed
        if (stateRef.current === state) {
            return;
        }

        stateRef.current = state;

        // Skip if the promise is not settled
        if (state.status !== 'fulfilled' && state.status !== 'rejected') {
            return;
        }

        const timeoutDelay = selectObjectValueBasedOnState(onSettleDelayMs, state, 0);

        if (timeoutDelay > 0) {
            const timeoutId = setTimeout(() => onSettle(state), timeoutDelay);

            return () => clearTimeout(timeoutId);
        }

        onSettle(state);
    }, [state, onSettle, onSettleDelayMs]);
};

const usePromiseState = (promise, options) => {
    options = useMemo(() => ({
        thresholdMs: 0,
        onSettleDelayMs: 0,
        onSettle: undefined,
        statusMap: undefined,
        ...options,
    }), [options]);

    const initialState = useMemo(() => getInitialState(promise, options));
    const [state, dispatch] = useReducer(reducer, initialState);

    // Observe promise and update the state accordingly, respecting `thresholdMs`
    useResolvePromise(promise, dispatch, options);

    // Call `onSettled` whenever the promise settles, respecting `onSettleDelayMs`
    useNotifySettled(state, options);

    // Return the state, transforming it according to `statusMap`
    return useMemo(() => ({
        ...state,
        status: selectObjectValueBasedOnState(options.statusMap, state, state.status),
    }), [state, options.statusMap]);
};

export default usePromiseState;
