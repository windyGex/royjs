import React from 'react';
import {Route} from 'react-router-dom';

const route = function (path) {
    return function withRoute(Component) {
        return class RouterWrapper extends React.Component {
            render() {
                return <Route path={path} component={Component}/>;
            }
        };
    };
};

export default route;
