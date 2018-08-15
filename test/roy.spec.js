/* global describe, it, before */

import chai from 'chai';
import React from 'react';
import Enzyme, {mount} from 'enzyme';
import Adapter from 'enzyme-adapter-react-15';
import {Store, inject, connect, Provider, compose} from '../src/index';
import {JSDOM} from 'jsdom';
import sinon from 'sinon';

const doc = new JSDOM('<!doctype html><html><body></body></html>');
global.document = doc.window.document;
global.window = doc.window;

Enzyme.configure({ adapter: new Adapter() });

chai.expect();

const expect = chai.expect;

describe('Should support inject store to React Component', () => {
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
                const {name, dataSource} = this.store.state;
                const b = this.store.get('obj.b');
                return <div>
                    <span>{name}</span><div className="a">
                        {dataSource.length}
                    </div>
                    <em>{b}</em>
                </div>;
            }
        }
        const wrapper = mount(<App/>);
        expect(wrapper.find('span').text()).eq('a');
        store.dispatch('add', 'b');
        expect(wrapper.find('span').text()).eq('b');
        store.dispatch('push');
        expect(wrapper.find('.a').text()).eq('1');
        expect(wrapper.find('em').text()).eq('1');
        store.dispatch('change');
        expect(wrapper.find('em').text()).eq('2');
    });

    it('support auto mount store to provider global store', (done) => {
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
                return <span>{this.store.state.name}</span>;
            }
        }
        @connect()
        class Button extends React.Component {
            render() {
                return <button onClick={() => this.props.dispatch('module.change')}>change</button>;
            }
        }
        const globalStore = new Store();
        const wrapper = mount(<Provider store={globalStore}>
            <div>
                <Module/>
                <Button/>
            </div>
        </Provider>);
        expect(wrapper.find('span').text()).eq('a');
        wrapper.find('button').simulate('click');
        setTimeout(() => {
            expect(wrapper.find('span').text()).eq('b');
            done();
        }, 10);
    });

    it('should support compose', () => {
        const object = {
            view: function ({createElement}) {
                return createElement('div', {
                    onClick: () => {
                        this.store.dispatch('change');
                    }
                }, this.store.state.name);
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
        const wrapper = mount(<Component/>);
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
        const store = new Store({
            actions: {
                change(state) {
                    state.set('a', 1);
                }
            }
        }, {
            plugins: [plugin]
        });
        store.dispatch('change');
        expect(cb.called).eq(true);
        store.dispatch('setValue', {
            b: 1
        });
        expect(store.state.b).eq(1);
    });
});
