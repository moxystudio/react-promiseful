import { useMemo } from 'react';
import PropTypes from 'prop-types';
import usePromiseStatus from './hook';

const PromiseStatus = ({ promise, statusMap, delayMs, resetDelayMs, children }) => {
    const [status, value] = usePromiseStatus(promise, { statusMap, delayMs, resetDelayMs });

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
    delayMs: PropTypes.number,
    resetDelayMs: PropTypes.number,
};

PromiseStatus.defaultProps = {
    delayMs: 0,
    resetDelayMs: 0,
};

export default PromiseStatus;
