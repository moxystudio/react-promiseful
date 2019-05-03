const symbol = Symbol();

const setPromiseState = (promise, status, value) => Object.defineProperty(promise, symbol, {
    value: { status, value },
    writable: true,
});

const getPromiseState = (promise) => promise && promise[symbol];

const resolvePromise = (promise, methods, mark = false) => {
    let ignore = false;

    mark && setPromiseState(promise, 'pending');

    promise
    .then((value) => {
        mark && setPromiseState(promise, 'fulfilled', value);

        if (!ignore) {
            methods.then && methods.then(value);
            methods.finally && methods.finally(true);
        }
    }, (err) => {
        mark && setPromiseState(promise, 'rejected', err);

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
