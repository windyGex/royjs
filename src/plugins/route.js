const route = function (store, actions) {
    ['push', 'replace', 'go', 'goBack', 'goForward'].forEach(method => {
        actions[`router.${method}`] = function (state, payload) {
            const { history } = store;
            history && history[method](payload);
        };
    });
};

export default route;
