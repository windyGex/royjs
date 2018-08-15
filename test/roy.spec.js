/* global describe, it, before */

import chai from 'chai';
import React from 'react';
import Enzyme, {mount} from 'enzyme';
import Adapter from 'enzyme-adapter-react-15';
import {Store, inject, connect, Provider, compose} from '../src/index';
import {JSDOM} from 'jsdom';

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
        expect(wrapper.find('span').text()).eql('a');
        store.dispatch('add', 'b');
        expect(wrapper.find('span').text()).eql('b');
        store.dispatch('push');
        expect(wrapper.find('.a').text()).eql('1');
        expect(wrapper.find('em').text()).eql('1');
        store.dispatch('change');
        expect(wrapper.find('em').text()).eql('2');
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
        expect(wrapper.find('span').text()).eql('a');
        wrapper.find('button').simulate('click');
        setTimeout(() => {
            expect(wrapper.find('span').text()).eql('b');
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
        expect(wrapper.find('div').text()).eql('123');
        wrapper.find('div').simulate('click');
        expect(wrapper.find('div').text()).eql('456');
    });
});

