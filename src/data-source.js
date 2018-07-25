import request from 'axios';

function DataSource(props) {
    Object.keys(props).forEach(key => {
        this[key] = props[key];
    });
}
DataSource.prototype = {
    url: '',
    request,
    get(id, params) {
        return request.get(`${this.url}/${id}`, params);
    },
    patch(id, params) {
        return request.patch(`${this.url}/${id}`, params);
    },
    put(id, params) {
        return request.put(`${this.url}/${id}`, params);
    },
    post(params) {
        return request.post(this.url, params);
    },
    find(params) {
        return request.get(this.url, params);
    },
    remove(id) {
        return request.delete(`${this.url}/${id}`);
    }
};
export default DataSource;
