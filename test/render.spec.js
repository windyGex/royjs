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

describe('render count', () => {
  it('should support hooks for function component', (done) => {
    const store = new Store();
    store.create('m1', {
      state: {
        v: 1,
        f: 2,
      },
    });
    let a = 0;
    let b = 0;
    const A = (props) => {
      const value = useStore(state => state.m1.v);
      const dispatch = useDispatch();
      useEffect(() => {
        a++;
      });
      return <span>{value}</span>;
    };
    const B = (props) => {
      const value = useStore(state => state.m1.f);
      const dispatch = useDispatch();
      useEffect(() => {
        b++;
      });
      return <span>{value}</span>;
    };
    const app = mount(
      <Provider store={store}>
        <A />
        <B />
      </Provider>
    );
    store.state.m1.v = 2;
    setTimeout(() => {
      expect(b).equal(1);
      expect(a).equal(2);
      done();
    }, 10);
  });
});
