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
    let store, App, wrapper;
    class Demo extends React.Component {
        render() {
            const [item] = this.props.state.a;
            return <span>{item && item.status ? 'true' : 'false'}</span>;
        }
    }
    beforeEach(() => {
        store = new Store({
            state: {
                a: []
            }
        });
        App = inject(store)(Demo);
        wrapper = mount(<App />);
    });

    afterEach(() => {
        store = null;
        App = null;
        wrapper = null;
    });

    // set;
    it('should support item change for array', () => {
        store.state.set('a', [
            {
                status: true
            }
        ]);
        expect(wrapper.find('span').text()).eql('true');
        store.state.a[0].set('status', false);
        expect(wrapper.find('span').text()).eql('false');
        store.state.set('a', [
            {
                status: true
            }
        ]);
        expect(wrapper.find('span').text()).eql('true');
    });

    it('should support array push method', () => {
        expect(wrapper.find('span').text()).eql('false');
        store.state.a.push({
            status: true
        });
        expect(wrapper.find('span').text()).eql('true');
        store.state.a[0].set('status', false);
        expect(wrapper.find('span').text()).eql('false');
    });

    it('should support array splice method', () => {
        expect(wrapper.find('span').text()).eql('false');
        store.state.a.splice(0, 0, {
            status: true
        });
        expect(wrapper.find('span').text()).eql('true');
        store.state.a[0].set('status', false);
        expect(wrapper.find('span').text()).eql('false');
    });

    it('should support array pop method', () => {
        expect(wrapper.find('span').text()).eql('false');
        store.state.a.splice(0, 0, {
            status: true
        });
        expect(wrapper.find('span').text()).eql('true');
        store.state.a.pop();
        expect(wrapper.find('span').text()).eql('false');
    });

    it('should support set key method', () => {
        expect(wrapper.find('span').text()).eql('false');
        store.state.set('a[0].status', true);
        expect(wrapper.find('span').text()).eql('true');
        store.state.a[0].set('status', false);
        expect(wrapper.find('span').text()).eql('false');
        store.state.set('a[0].status', true);
        expect(wrapper.find('span').text()).eql('true');
    });

    it('should support proxy', () => {
        store.state.a = [
            {
                status: true
            }
        ];
        expect(wrapper.find('span').text()).eql('true');
        store.state.a[0].status = false;
        expect(wrapper.find('span').text()).eql('false');
    });

    it('should support push proxy', () => {
        store.state.a.push({
            status: true
        });
        expect(wrapper.find('span').text()).eql('true');
        store.state.a[0].status = false;
        expect(wrapper.find('span').text()).eql('false');
    });

    it('avoid object sort', () => {
        store.state.sort = 1;
        expect(store.state.sort).eql(1);
    });
});


describe('support render', () => {
    it('should render', () => {
        const store = new Store({
        state: {
            data: {}
        },
        actions: {
            updateTime (state, time) {
                state.set('data.time', time)
            }
        }
        });
        @connect()
        class Todo2 extends React.Component {
            render () {
                const { data, dispatch } = this.props;
                return (
                    <div>{data.time}</div>
                )
            }
        }
        class App extends React.Component {
            render () {
                return (
                <Provider store={store}>
                    <Todo2 />
                </Provider>
                )
            }
        }
        const app = mount(<App/>);
        store.state.set('data.time', 1)
        expect(app.find('div').text()).eql('1')
    });
});
