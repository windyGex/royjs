import React from 'react';
/*eslint-disable*/
import { Route } from 'react-router-dom';
import meta from './meta';
import {warning} from './utils';

const route = function(path, options) {
    meta.route = true;
    return function withRoute(Component) {
        warning('[ route ] method is deprecated and will be removed at next version.');
        return class RouterWrapper extends React.Component {
            renderPath(path) {
                return path.map(item => {
                    return <Route {...options} path={item} component={Component} />;
                });
            }
            render() {
                if (Array.isArray(path)) {
                    return <div>{this.renderPath(path)}</div>;
                }
                return <Route {...options} path={path} component={Component} />;
            }
        };
    };
};

export default route;
