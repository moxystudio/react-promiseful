import { useMemo } from 'react';
import PropTypes from 'prop-types';
import usePromiseStatus from './hook';

const PromiseStatus = ({ promise, statusMap, delayMs, resetFulfilledDelayMs, resetRejectedDelayMs, children }) => {
    const [status, value] = usePromiseStatus(promise, { statusMap, delayMs, resetFulfilledDelayMs, resetRejectedDelayMs });

    const renderedChildren = useMemo(
        () => children(status, value),
        [children, status, value]
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
