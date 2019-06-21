import { useMemo } from 'react';
import PropTypes from 'prop-types';
import usePromiseState from './hook';

const PromiseState = ({ promise, thresholdMs, onSettleDelayMs, onSettle, statusMap, children }) => {
    const promiseState = usePromiseState(promise, { statusMap, thresholdMs, onSettle, onSettleDelayMs });

    const renderedChildren = useMemo(
        () => children(promiseState),
        [children, promiseState]
    );

    return renderedChildren;
};

PromiseState.propTypes = {
    promise: PropTypes.object,
    children: PropTypes.func.isRequired,
    thresholdMs: PropTypes.number,
    onSettleDelayMs: PropTypes.oneOfType([PropTypes.number, PropTypes.object]),
    onSettle: PropTypes.func,
    statusMap: PropTypes.object,
};

export default PromiseState;
