const setValues = function (store, actions) {
    actions.setValues = function (state, payload) {
        state.set(payload);
    };
};

export default setValues;
