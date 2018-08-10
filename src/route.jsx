import React from 'react';
/*eslint-disable*/
import {Route} from 'react-router-dom';
import meta from './meta';

const route = function (path, options) {
    meta.route = true;
    return function withRoute(Component) {
        return class RouterWrapper extends React.Component {
            render() {
                return <Route {...options} path={path} component={Component}/>;
            }
        };
    };
};

export default route;
