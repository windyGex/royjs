/* global describe, it, before */

import chai from 'chai';
import React from 'react';
import Enzyme, {mount} from 'enzyme';
import Adapter from 'enzyme-adapter-react-15';
import {Store, inject} from '../src/index';
import {JSDOM} from 'jsdom';

const doc = new JSDOM('<!doctype html><html><body></body></html>');
global.document = doc.window.document;
global.window = doc.window;

Enzyme.configure({ adapter: new Adapter() });

chai.expect();

const expect = chai.expect;

describe('Should support inject store to React Component', () => {
    it('inject store using simple object', () => {
        const store = new Store({
            state: {
                name: 'a'
            },
            actions: {
                add(state, payload) {
                    state.set('name', payload);
                }
            }
        });
        @inject(store)
        class App extends React.Component {
            render() {
                const {name} = this.store.state;
                return <div>{name}</div>;
            }
        }
        const wrapper = mount(<App/>);
        expect(wrapper.find('div').text()).eql('a');
        store.dispatch('add', 'b');
        expect(wrapper.find('div').text()).eql('b');
    });
});

