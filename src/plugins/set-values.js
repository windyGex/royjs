const setValues = function (store, actions) {
    actions.setValues = function (state, payload, options) {
        store.transaction(() => {
            state.set(payload, options);
        });
    };
};

export default setValues;
