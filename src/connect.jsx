import React from 'react';
import ReactDOM from 'react-dom';
import Store from './store';
import eql from 'shallowequal';
import { isArray, isPlainObject, warning, get, change } from './utils';
import { StoreContext } from './provider';

const normalizer = (mapStateToProps, context, dispatch) => {
    let ret = {};
    if (isArray(mapStateToProps)) {
        mapStateToProps.forEach(key => {
            if (typeof key === 'string') {
                ret[key] = context.get(key);
            } else {
                Object.keys(key).forEach(k => {
                    ret[k] = context.get(key[k]);
                });
            }
        });
    } else if (typeof mapStateToProps === 'function') {
        ret = mapStateToProps(context);
    } else if (isPlainObject(mapStateToProps)) {
        const { state = [], actions = [] } = mapStateToProps;
        ret = normalizer(state, context);
        actions.forEach(action => {
            if (typeof action === 'string') {
                ret[action] = payload => {
                    dispatch(action, payload);
                };
            } else {
                Object.keys(action).forEach(k => {
                    ret[k] = payload => {
                        dispatch(action[k], payload);
                    };
                });
            }
        });
    }
    return ret;
};

// connect([], config) -> state
// connect({}, config) -> state, action
// connect(() => {}, config) -> state
const connect = function (mapStateToProps = state => state, config = {}) {
    return function withStore(Component) {
        const isFunctionComponent = !Component.prototype.render;
        class StoreWrapper extends React.Component {
            static contextType = StoreContext;
            constructor(props, context) {
                super(props, context);
                this._deps = {};
                this._change = change.bind(this);
                this._get = get.bind(this);
                this.store = context.store || Store.get();
                if (config.inject) {
                    if (context.injectStore) {
                        this.store = context.injectStore;
                    } else {
                        if (this.store === context.store) {
                            warning('Royjs is using Provider store to connect because the inject store is undefined');
                        } else {
                            warning('Royjs is using the first initialized store to connect because the inject store is undefined');
                        }
                    }
                }
                this.store.on('change', this._change);
                this.store.history = this.store.history || this.props.history;

                if (config === true || config.pure) {
                    this.shouldComponentUpdate = function (nextProps, nextState) {
                        if (this.state !== nextState) {
                            return true;
                        }
                        return !eql(this.props, nextProps);
                    };
                }
            }
            componentWillUnmount() {
                this.store.off('change', this._change);
            }
            componentDidMount() {
                const node = ReactDOM.findDOMNode(this);
                if (node) {
                    node._instance = this;
                }
            }
            beforeRender() {
                this.store.on('get', this._get);
            }
            afterRender() {
                this.store.off('get', this._get);
            }
            setInstance = inc => {
                this._instance = inc;
            };
            get instance() {
                return this._instance;
            }
            render() {
                this.beforeRender();
                const { dispatch, state } = this.store;
                const props = normalizer(mapStateToProps, state, dispatch);
                let attrs = {
                    ...this.props,
                    ...props,
                    dispatch
                };
                if (!isFunctionComponent) {
                    attrs.ref = this.setInstance;
                }
                const ret = <Component {...attrs} />;
                this.afterRender();
                return ret;
            }
        }
        return StoreWrapper;
    };
};

export default connect;
