import { has } from 'lodash';

const selectObjectValueBasedOnState = (object, state, defaultValue) => {
    const { status, withinThreshold } = state;
    const fullStatus = withinThreshold && `${state.status}WithinThreshold`;

    if (fullStatus && has(object, fullStatus)) {
        return object[fullStatus];
    }

    if (has(object, status)) {
        return object[status];
    }

    return defaultValue;
};

export default selectObjectValueBasedOnState;
