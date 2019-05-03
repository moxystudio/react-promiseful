import { useEffect, useReducer, useMemo } from 'react';
import pDelay from 'delay';
import { has, isEqual } from 'lodash';
import { resolvePromise } from './promise';

const reducer = (state, action) => {
    let newState;

    switch (action.type) {
    case 'reset':
        newState = undefined;
        break;
    case 'pending':
        newState = { status: 'pending', value: undefined };
        break;
    case 'rejected':
        newState = { status: 'rejected', value: action.payload };
        break;
    case 'fulfilled':
        newState = { status: 'fulfilled', value: action.payload };
        break;
    /* istanbul ignore next */
    default:
        throw new Error('Unknown action type');
    }

    // Keep the same state reference if they are strictly equal to avoid rerenders
    return isEqual(newState, state) ? state : newState;
};

const getInitialState = (promise, delayMs) =>
    !promise || delayMs > 0 ? undefined : { status: 'pending', value: undefined };

const usePromiseState = (promise, options) => {
    options = options || {};

    const statusMap = options.statusMap;
    const delayMs = options.delayMs || 0;
    const resetFulfilledDelayMs = options.resetFulfilledDelayMs || 0;
    const resetRejectedDelayMs = options.resetRejectedDelayMs || 0;

    const initialState = useMemo(() => getInitialState(promise, delayMs));
    const [state, dispatch] = useReducer(reducer, initialState);

    useEffect(() => {
        // Short-circuit if there's no promise
        if (!promise) {
            dispatch({ type: 'reset' });

            return;
        }

        let cancelDelay;
        let cancelResetDelay;

        // If there's no delay, set status to 'pending' right away
        // Otherwise wait for the specified elay
        if (delayMs > 0) {
            cancelDelay = resolvePromise(pDelay(delayMs), {
                then: () => dispatch({ type: 'pending' }),
            });
        } else {
            dispatch({ type: 'pending' });
        }

        const cancelResolve = resolvePromise(promise, {
            then: (value) => dispatch({ type: 'fulfilled', payload: value }),
            catch: (err) => dispatch({ type: 'rejected', payload: err }),
            finally: (fulfilled) => {
                cancelDelay && cancelDelay();

                // Reset the status after `resetFulfilledDelayMs`/`resetRejectedDelayMs`
                const resetDelayMs = fulfilled ? resetFulfilledDelayMs : resetRejectedDelayMs;

                if (resetDelayMs > 0) {
                    cancelResetDelay = resolvePromise(pDelay(resetDelayMs), {
                        then: () => dispatch({ type: 'reset' }),
                    });
                }
            },
        }, true);

        return () => {
            // Cancel timeouts & cancel resolving promise
            cancelResolve();
            cancelDelay && cancelDelay();
            cancelResetDelay && cancelResetDelay();
        };
    }, [promise]);

    return useMemo(() => {
        if (!state) {
            return;
        }

        return {
            status: has(statusMap, state.status) ? statusMap[state.status] : state.status,
            value: state.value,
        };
    }, [state, statusMap]);
};

export default usePromiseState;
