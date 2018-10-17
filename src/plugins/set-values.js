const setValues = function (store, actions) {
    actions.setValues = function (state, payload, options) {
        state.set(payload, options);
    };
};

export default setValues;
