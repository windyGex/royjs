const cache = {};
const takeLatest = function takeLatest({ action, state, context, payload, type }, next) {
    const isAsync = action.toString().indexOf('regeneratorRuntime') > -1 || action.constructor.name === 'AsyncFunction';

    if (isAsync) {
        if (!cache[type]) {
            state.loading = true;
            cache[type] = true;
            const ret = action.call(context, state, payload);
            ret.then(() => {
                cache[type] = false;
                state.loading = false;
            }).catch(() => {
                cache[type] = false;
            });
            return ret;
        }
    } else {
        return next();
    }
};

export default takeLatest;
