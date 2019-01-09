import React from 'react';
import ReactDOM from 'react-dom';
import T from 'prop-types';
import Store from './store';
import {isArray, warning} from './utils';

const connect = function (
    mapStateToProps = state => state
) {
    return function withStore(Component) {
        class StoreWrapper extends React.Component {
            static contextTypes = {
                store: T.any
            };
            store = this.context.store || Store.get();
            constructor(props, context) {
                super(props, context);
                this._deps = {};
                this._change = (obj) => {
                    const state = {};
                    obj = isArray(obj) ? obj : [obj];
                    for (let index = 0; index < obj.length; index++) {
                        const item = obj[index];
                        if (this._deps[item.key]) {
                            state[item.key] = item.value;
                        }
                    }
                    this.setState(state);
                };
                this._get = data => {
                    this._deps[data.key] = true;
                };
                if (!this.store) {
                    warning('The store has not been initialized yet!');
                    return;
                }
                this.store.on('change', this._change);
                this.store.on('get', this._get);
                this.store.history = this.store.history || this.props.history;
                const store = this.store;
                if (!Component.prototype.store) {
                    Object.defineProperty(Component.prototype, 'store', {
                        get() {
                            warning('Do\'nt use this.store in connect!');
                            return store;
                        }
                    });
                }
            }
            componentWillUnmount() {
                this.store.off('change', this._change);
                this.store.off('get', this._get);
            }
            componentDidMount() {
                const node = ReactDOM.findDOMNode(this);
                if (node) {
                    node._instance = this;
                }
            }
            render() {
                const props = mapStateToProps(this.store.state);
                const dispatch = this.store.dispatch;
                return <Component {...this.props} {...props} dispatch={dispatch}/>;
            }
        }
        return StoreWrapper;
    };
};

export default connect;
