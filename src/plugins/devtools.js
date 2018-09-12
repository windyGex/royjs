const devtools = function (store) {
    let tool;
    store.subscribe(obj => {
        if (window.hasOwnProperty('__REDUX_DEVTOOLS_EXTENSION__') && !tool) {
            tool = window.__REDUX_DEVTOOLS_EXTENSION__.connect();
            tool.subscribe(message => {
                if (message.type === 'DISPATCH' && message.state) {
                    store.set(JSON.parse(message.state));
                }
            });
        }
        tool && tool.send(obj.type, obj.state.toJSON());
    });
};

export default devtools;
