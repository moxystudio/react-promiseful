const symbol = Symbol();

const updatePromiseState = (promise, status, value) => {
    // Skip if trying to update to pending when it's already pending or resolved
    if (status === 'pending' && promise[symbol]) {
        return;
    }

    Object.defineProperty(promise, symbol, {
        value: { status, value },
        writable: true,
    });
};

const getPromiseState = (promise) => {
    if (!promise) {
        return { status: 'none', value: undefined };
    }

    return promise[symbol] || { status: 'pending', value: undefined };
};

const resolvePromise = (promise, methods, mark = false) => {
    let ignore = false;

    mark && updatePromiseState(promise, 'pending');

    promise
    .then((value) => {
        mark && updatePromiseState(promise, 'fulfilled', value);

        if (!ignore) {
            methods.then && methods.then(value);
            methods.finally && methods.finally(false);
        }
    }, (err) => {
        mark && updatePromiseState(promise, 'rejected', err);

        if (!ignore) {
            methods.catch && methods.catch(err);
            methods.finally && methods.finally(false);
        }
    });

    return () => {
        ignore = true;
    };
};

export { resolvePromise, getPromiseState };
