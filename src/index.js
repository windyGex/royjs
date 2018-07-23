import request, {DataSource, withRequest} from '@alife/s-request';
import inject from './inject';
import connect from './connect';
import Provider from './provider';
import Observer from './observe-model';
import Store from './store';

export default {
    DataSource,
    inject,
    connect,
    Observer,
    Store,
    request,
    withRequest,
    Provider
};
