/* eslint-disable */

import Benchmark from 'benchmark';
import React from 'react';
import Enzyme, { mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-15';
import { Store, inject } from '../lib/index';
import dva, { connect } from 'dva';

Enzyme.configure({ adapter: new Adapter() });

const suite = new Benchmark.Suite();

suite
    .add('Roy test', function () {
        const store = new Store({
            state: {
                name: 'a'
            }
        });
        @inject(store)
        class App extends React.Component {
            render() {
                return <div>{this.store.state.name}</div>;
            }
        }
        mount(<App />);
    })
    .add('Dva test', function () {
        const app = dva();
        app.model({
            namespace: 'test',
            state: {
                name: 'a'
            },
            reducers: {}
        });
        @connect(state => state)
        class App extends React.Component {
            render() {
                return <div>{this.props.name}</div>;
            }
        }
        app.router(() => <App />);
        const Container = app.start();
        mount(<Container />);
    })
    .on('cycle', function (event) {
        console.log(String(event.target));
    })
    .on('complete', function () {
        console.log('Fastest is ' + this.filter('fastest').map('name'));
    })
    .run({
        async: true
    });
