import React from 'react';
import {Route} from 'react-router-dom';

const route = function (path, options) {
    return function withRoute(Component) {
        return class RouterWrapper extends React.Component {
            render() {
                return <Route {...options} path={path} component={Component}/>;
            }
        };
    };
};

export default route;
