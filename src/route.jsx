import React from 'react';
/*eslint-disable*/
import {Route} from 'react-router-dom';
import meta from './meta';

const route = function (path, options) {
    meta.route = true;
    return function withRoute(Component) {
        return class RouterWrapper extends React.Component {
            renderPath(path) {
                return path.map(item => {
                    return <Route {...options} path={item} component={Component}/>
                });
            }
            render() {
                if(Array.isArray(path)) {
                    return <div>
                        {this.renderPath(path)}
                    </div>
                }
                return <Route {...options} path={path} component={Component}/>;
            }
        };
    };
};

export default route;
