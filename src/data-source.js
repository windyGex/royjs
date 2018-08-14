function DataSource(props) {
    Object.keys(props).forEach(key => {
        this[key] = props[key];
    });
}
DataSource.prototype = {
    url: '',
    request() {
        console.error('需要首先引入[roy.js/request]才能正常工作');
    },
    get(id, params) {
        return this.request.get(`${this.url}/${id}`, params);
    },
    patch(id, params) {
        return this.request.patch(`${this.url}/${id}`, params);
    },
    put(id, params) {
        return this.request.put(`${this.url}/${id}`, params);
    },
    post(params) {
        return this.request.post(this.url, params);
    },
    find(params) {
        return this.request.get(this.url, params);
    },
    remove(id) {
        return this.request.delete(`${this.url}/${id}`);
    }
};
export default DataSource;
