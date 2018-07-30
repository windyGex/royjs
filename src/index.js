import request from 'axios';
import inject from './inject';
import connect from './connect';
import Provider from './provider';
import Observer from './observe-model';
import DataSource from './data-source';
import Store from './store';
import devtools from './devtools';

export default {
    DataSource,
    inject,
    connect,
    Observer,
    Store,
    request,
    Provider,
    devtools
};
