import req from '@alife/seek-request';

function DataSource(props) {
    Object.keys(props).forEach(key => {
        this[key] = props[key];
    });
}
DataSource.prototype = {
    url: '',
    req,
    get(id, params) {
        return req.get(`${this.url}/${id}`, params);
    },
    patch(id, params) {
        return req.patch(`${this.url}/${id}`, params);
    },
    put(id, params) {
        return req.put(`${this.url}/${id}`, params);
    },
    post(params) {
        return req.post(this.url, params);
    },
    find(params) {
        return req.get(this.url, params);
    },
    remove(id) {
        return req.delete(`${this.url}/${id}`);
    }
};
export default DataSource;
