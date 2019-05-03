import { useMemo } from 'react';
import PropTypes from 'prop-types';
import usePromiseState from './hook';

const PromiseStatus = ({ promise, statusMap, delayMs, resetFulfilledDelayMs, resetRejectedDelayMs, children }) => {
    const promiseState = usePromiseState(promise, { statusMap, delayMs, resetFulfilledDelayMs, resetRejectedDelayMs });

    const renderedChildren = useMemo(
        () => children(promiseState),
        [children, promiseState]
    );

    return renderedChildren;
};

PromiseStatus.propTypes = {
    promise: PropTypes.object,
    children: PropTypes.func.isRequired,
    map: PropTypes.object,
    resetFulfilledDelayMs: PropTypes.number,
    resetRejectedDelayMs: PropTypes.number,
};

export default PromiseStatus;
