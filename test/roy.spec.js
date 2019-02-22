/* global describe, it, before */
/* eslint-disable */

import chai from 'chai';
import React from 'react';
import Enzyme, { mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-15';
import { Store, inject, connect, Provider, compose } from '../src/index';
import { JSDOM } from 'jsdom';
import sinon from 'sinon';

const doc = new JSDOM('<!doctype html><html><body></body></html>');
global.document = doc.window.document;
global.window = doc.window;

Enzyme.configure({ adapter: new Adapter() });

chai.expect();

const expect = chai.expect;

describe('support inject store to React Component', () => {
    it('inject store using  object', () => {
        const store = new Store({
            state: {
                name: 'a',
                dataSource: [],
                obj: {
                    b: 1
                }
            },
            actions: {
                add(state, payload) {
                    state.set('name', payload);
                },
                push(state, payload) {
                    state.dataSource.push({
                        title: 'title'
                    });
                },
                change(state) {
                    state.set('obj.b', 2);
                }
            }
        });
        @inject(store)
        class App extends React.Component {
            render() {
                const { name, dataSource } = this.props.state;
                const b = this.props.state.get('obj.b');
                return (
                    <div>
                        <span>{name}</span>
                        <div className="a">{dataSource.length}</div>
                        <em>{b}</em>
                    </div>
                );
            }
        }
        const wrapper = mount(<App />);
        expect(wrapper.find('span').text()).eq('a');
        store.dispatch('add', 'b');
        expect(wrapper.find('span').text()).eq('b');
        store.dispatch('push');
        expect(wrapper.find('.a').text()).eq('1');
        expect(wrapper.find('em').text()).eq('1');
        store.dispatch('change');
        expect(wrapper.find('em').text()).eq('2');
    });

    it('support auto mount store to provider global store', done => {
        const store = new Store({
            name: 'module',
            state: {
                name: 'a'
            },
            actions: {
                change(state) {
                    state.set('name', 'b');
                }
            }
        });
        @inject(store)
        class Module extends React.Component {
            render() {
                return <span>{this.props.state.name}</span>;
            }
        }
        @connect()
        class Button extends React.Component {
            render() {
                return <button onClick={() => this.props.dispatch('module.change')}>change</button>;
            }
        }
        const globalStore = new Store();
        const wrapper = mount(
            <Provider store={globalStore}>
                <div>
                    <Module />
                    <Button />
                </div>
            </Provider>
        );
        expect(wrapper.find('span').text()).eq('a');
        wrapper.find('button').simulate('click');
        setTimeout(() => {
            expect(wrapper.find('span').text()).eq('b');
            done();
        }, 10);
    });

    it('should support compose', () => {
        const object = {
            view: function({ createElement }) {
                return createElement(
                    'div',
                    {
                        onClick: () => {
                            this.props.dispatch('change');
                        }
                    },
                    this.props.state.name
                );
            },
            state: {
                name: 123
            },
            actions: {
                change(state, payload) {
                    state.set('name', 456);
                }
            }
        };
        const Component = compose(object);
        const wrapper = mount(<Component />);
        expect(wrapper.find('div').text()).eq('123');
        wrapper.find('div').simulate('click');
        expect(wrapper.find('div').text()).eq('456');
    });
});

describe('it should support observable store', () => {
    it('should support store set operation', () => {
        const store = new Store({
            state: {}
        });
        store.set('a', 1);
        expect(store.state.a).eq(1);
        store.set('c.d', 1);
        expect(store.state.c.d).eq(1);
        store.set('d', []);
        expect(store.state.d.length).eq(0);
        const cb = sinon.spy();
        store.state.on('change', cb);
        store.state.d.push({
            a: 1
        });
        expect(cb.called).eq(true);
        store.state.set('d[0].a', 2);
        expect(cb.called).eq(true);
        expect(store.state.d[0].a).eq(2);
        expect(store.state.get('d[0].a')).eq(2);
        const item = store.state.d[0];
        item.set('a', 3);
        expect(cb.callCount).eq(3);
        expect(store.state.get('d[0].a')).eq(3);
        store.state.reset();
        expect(store.state.a).eq(undefined);
        expect(store.state.c).eq(undefined);
        store.state.set('d', [
            {
                children: [
                    {
                        b: false
                    }
                ]
            }
        ]);
        store.state.set('d[0].children[0].b', true);
        expect(store.state.d[0].children[0].b, true);
    });
});

describe('it should support array operation', () => {
    let store;
    beforeEach(() => {
        store = new Store({
            state: {}
        });
    });

    afterEach(() => {
        store = null;
    });

    it('should support array operation', () => {
        const callback = sinon.spy();
        store.on('change', callback);
        store.state.set('a', []);
        expect(callback.called).eql(true);
        store.state.a.push(1);
        expect(callback.callCount).eql(2);
        store.state.a.splice(0, 1);
        expect(callback.callCount).eql(3);
        expect(store.state.a.length).eql(0);
        store.state.a.push(1, 3, 2);
        expect(callback.callCount).eql(4);
        store.state.a.sort();
        expect(callback.callCount).eql(5);
        expect(store.state.a.toString()).eql('1,2,3');
        store.state.a.reverse();
        expect(callback.callCount).eql(6);
        expect(store.state.a.toString()).eql('3,2,1');
        store.state.a.pop();
        expect(callback.callCount).eql(7);
        expect(store.state.a.toString()).eql('3,2');
        store.state.a.shift();
        expect(callback.callCount).eql(8);
        expect(store.state.a.toString()).eql('2');
        store.state.a.unshift(4);
        expect(callback.callCount).eql(9);
        expect(store.state.a.toString()).eql('4,2');
    });
});

describe('it should support plugin', () => {
    it('should support inject plugin for store', () => {
        const cb = sinon.spy();
        const plugin = (store, actions) => {
            store.subscribe(cb);
            actions.setValue = (state, payload) => {
                state.set(payload);
            };
        };
        const store = new Store(
            {
                actions: {
                    change(state) {
                        state.set('a', 1);
                    }
                }
            },
            {
                plugins: [plugin]
            }
        );
        store.dispatch('change');
        expect(cb.called).eq(true);
        store.dispatch('setValue', {
            b: 1
        });
        expect(store.state.b).eq(1);
    });
});

describe('bugfix', () => {
    it('should fix array toJSON', () => {
        const store = new Store({
            state: {}
        });
        store.set('data', [1, 2, 3]);
        expect(store.state.data.toJSON().toString()).eq('1,2,3');
    });
});

describe('it should support batch update when multiple set store', () => {
    it('render method should be called once when multiple sets are wrapped by the transaction method', done => {
        const cb = sinon.spy();
        const store = new Store({
            state: {
                count1: 0,
                count2: 0,
                count3: 0
            },
            actions: {
                add(state, payload) {
                    window.setTimeout(() => {
                        this.transaction(() => {
                            this.dispatch('setValues', {
                                count1: state.count1 + 1,
                                count2: state.count2 + 1,
                                count3: state.count3 + 1
                            });
                        });
                    }, 10);
                }
            }
        });

        @inject(store)
        class App extends React.Component {
            render() {
                cb();
                const { count1, count2, count3 } = this.props.state;
                const { dispatch } = this.props;
                return (
                    <div>
                        <span>
                            {count1}
                            {count2}
                            {count3}
                        </span>
                        <button onClick={() => dispatch('add')}>add</button>
                    </div>
                );
            }
        }
        const wrapper = mount(<App />);
        wrapper.find('button').simulate('click');
        window.setTimeout(() => {
            expect(cb.callCount).eq(2);
            expect(wrapper.find('span').text()).eq('111');
            done();
        }, 10);
    });

    it('render method should be called once when multiple sets are wrapped by the nest transaction method', done => {
        const cb = sinon.spy();
        const store = new Store({
            state: {
                count1: 0,
                count2: 0,
                count3: 0
            },
            actions: {
                add(state, payload) {
                    window.setTimeout(() => {
                        this.transaction(() => {
                            this.transaction(() => {
                                this.dispatch('setValues', {
                                    count1: state.count1 + 1,
                                    count2: state.count2 + 1,
                                    count3: state.count3 + 1
                                });
                            });
                            this.dispatch('setValues', {
                                count3: state.count3 + 1
                            });
                        });
                    }, 10);
                }
            }
        });

        @inject(store)
        class App extends React.Component {
            render() {
                cb();
                const { count1, count2, count3 } = this.props.state;
                const { dispatch } = this.props;
                return (
                    <div>
                        <span>
                            {count1}
                            {count2}
                            {count3}
                        </span>
                        <button onClick={() => dispatch('add')}>add</button>
                    </div>
                );
            }
        }
        const wrapper = mount(<App />);
        wrapper.find('button').simulate('click');
        window.setTimeout(() => {
            expect(cb.callCount).eq(2);
            expect(wrapper.find('span').text()).eq('112');
            done();
        }, 10);
    });

    it('Component injected with global store render method should be called once when set local store ', done => {
        const cb = sinon.spy();
        const globalStore = new Store();
        const store = new Store({
            name: 'app',
            state: {
                count1: 0,
                count2: 0,
                count3: 0
            },
            actions: {
                add(state, payload) {
                    window.setTimeout(() => {
                        this.transaction(() => {
                            this.dispatch('setValues', {
                                count1: state.count1 + 1,
                                count2: state.count2 + 1,
                                count3: state.count3 + 1
                            });
                        });
                    }, 10);
                }
            }
        });

        @inject(store)
        class Component1 extends React.Component {
            render() {
                const { count1, count2, count3 } = this.props.state;
                const { dispatch } = this.props;
                return (
                    <div>
                        {count1}
                        {count2}
                        {count3}
                        <button onClick={() => dispatch('add')}>add</button>
                    </div>
                );
            }
        }

        @inject(globalStore)
        class Component2 extends React.Component {
            render() {
                cb();
                if (this.props.state.app) {
                    const { count1, count2, count3 } = this.props.state.app;
                    return (
                        <span>
                            {count1}
                            {count2}
                            {count3}
                        </span>
                    );
                }
                return <div />;
            }
        }

        const wrapper = mount(
            <Provider store={globalStore}>
                <div>
                    <Component1 />
                    <Component2 />
                </div>
            </Provider>
        );
        wrapper.find('button').simulate('click');
        window.setTimeout(() => {
            expect(cb.callCount).eq(2);
            expect(
                wrapper
                    .find('Component2')
                    .find('span')
                    .text()
            ).eq('111');
            done();
        }, 10);
    });

    it('should support connect inject store', () => {
        const injectStore = new Store({
            state: {
                a: 1
            }
        });
        @connect(
            state => state,
            { inject: true }
        )
        class Child extends React.Component {
            render() {
                return <span>{this.props.a}</span>;
            }
        }
        @inject(injectStore)
        class App extends React.Component {
            render() {
                return <Child />;
            }
        }
        const wrapper = mount(<App />);
        expect(wrapper.find('span').text()).eq('1');
    });

    it('should support collect deps for didMount', () => {
        const store = new Store({
            state: {
                a: 1
            }
        });
        const cb = sinon.spy();
        @inject(store)
        class App extends React.Component {
            componentDidMount() {
                const { a } = this.props.state;
            }
            componentWillReceiveProps = cb;
            render() {
                return <div />;
            }
        }
        mount(<App />);
        expect(cb.called).eq(false);
        store.dispatch('setValues', {
            a: 2
        });
        expect(cb.called).eq(true);
    });
});
