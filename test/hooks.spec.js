/* eslint-disable */
import chai from 'chai';
import React, { useEffect } from 'react';
import Enzyme, { mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { Store, inject, connect, Provider, useStore, useDispatch } from '../src/index';
import { JSDOM } from 'jsdom';
import sinon from 'sinon';

const doc = new JSDOM('<!doctype html><html><body></body></html>');
global.document = doc.window.document;
global.window = doc.window;

Enzyme.configure({ adapter: new Adapter() });

chai.expect();

const expect = chai.expect;

describe('support for function component', () => {
  it('should support hooks for function component', () => {
    const store = new Store({
      state: {
        value: 1,
      },
      actions: {
        add(state) {
          state.value++;
        },
      },
    });
    const App = (props) => {
      const value = useStore((state) => state.value);
      const dispatch = useDispatch();
      return <span onClick={() => dispatch('add')}>{value}</span>;
    };
    const app = mount(
      <Provider store={store}>
        <App />
      </Provider>
    );
    expect(app.find('span').text()).equal('1');
    app.find('span').simulate('click');
    expect(app.find('span').text()).equal('2');
    expect(store.state.value).equal(2);
  });

  it('should support connect for function component', () => {
    const store = new Store({
      state: {
        value: 1,
      },
      actions: {
        add(state) {
          state.value++;
        },
      },
    });
    const App = (props) => {
      return <span onClick={() => props.dispatch('add')}>{props.value}</span>;
    };
    const Root = connect((state) => state)(App);
    const app = mount(
      <Provider store={store}>
        <Root />
      </Provider>
    );
    expect(app.find('span').text()).equal('1');
    app.find('span').simulate('click');
    expect(app.find('span').text()).equal('2');
    expect(store.state.value).equal(2);
  });

  it('should support connect state for function component', () => {
    const store = new Store({
        state: {
          value: 1,
        },
        actions: {
          add(state) {
            state.value++;
          },
        },
      });
      const App = (props) => {
        const state = useStore((state) => state);
        const dispatch = useDispatch();
        return <span onClick={() => dispatch('add')}>{state.value}</span>;
      };
      const app = mount(
        <Provider store={store}>
          <App />
        </Provider>
      );
      expect(app.find('span').text()).equal('1');
      app.find('span').simulate('click');
      expect(app.find('span').text()).equal('2');
      expect(store.state.value).equal(2);
  });

  it('should not change when no necessary deps', (done) => {
      const store = new Store({
        state: {
          a: 1,
          b: 1
        },
        actions: {
          a(state) {
            state.a++;
          },
          b(state) {
            state.b++;
          }
        },
      });
      const App = (props) => {
        const state = useStore((state) => state);
        const dispatch = useDispatch();
        return <span onClick={() => dispatch('a')}>{state.a}</span>;
      };

      let a = 0;
      const Child = props => {
          const state = useStore(state => state.b);
          useEffect(() => {
            a++;
          })
          return <em>{state}</em>
      }
      const app = mount(
        <Provider store={store}>
          <App />
          <Child />
        </Provider>
      );
      expect(app.find('span').text()).equal('1');
      app.find('span').simulate('click');
      expect(app.find('span').text()).equal('2');
      expect(store.state.a).equal(2);
      expect(a).equal(1);
      store.dispatch('b');
      setTimeout(() => {
        expect(a).equal(2);
        done();
      }, 0);
      expect(app.find('em').text()).equal('2');
  });
});
