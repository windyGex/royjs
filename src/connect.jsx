import React from 'react';
import ReactDOM from 'react-dom';
import T from 'prop-types';
import Store from './store';
import eql from 'shallowequal';
import { isArray } from './utils';

const connect = function (mapStateToProps = state => state, pure = false) {
    return function withStore(Component) {
        class StoreWrapper extends React.Component {
            static contextTypes = {
                store: T.any
            };
            store = this.context.store || Store.get();
            constructor(props, context) {
                super(props, context);
                this._deps = {};
                this._change = obj => {
                    const state = {};
                    let matched;
                    obj = isArray(obj) ? obj : [obj];
                    for (let index = 0; index < obj.length; index++) {
                        const item = obj[index];
                        const match = Object.keys(this._deps).some(dep => item.key.indexOf(dep) === 0);
                        if (match) {
                            matched = match;
                            state[item.key] = this.store.get(item.key);
                        }
                    }
                    if (matched) {
                        this.setState(state);
                    }
                };
                this._get = data => {
                    this._deps[data.key] = true;
                };
                this.store.on('change', this._change);
                this.store.history = this.store.history || this.props.history;

                if (pure) {
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
            render() {
                this.beforeRender();
                const props = mapStateToProps(this.store.state);
                const dispatch = this.store.dispatch;
                const ret = <Component {...this.props} {...props} dispatch={dispatch} />;
                this.afterRender();
                return ret;
            }
        }
        return StoreWrapper;
    };
};

export default connect;
