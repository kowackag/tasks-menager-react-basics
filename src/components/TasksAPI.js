class TasksAPI {
    constructor() {
        this.url = 'http://localhost:3000/tasks';
    }

    loadDataAPI() {
        return this._fetch()
    }

    addDataAPI(data) {
        const options = {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json'
            }
        }
        return this._fetch(options)
    }

    updateDataAPI(id, data) {
        const options = {
            method: 'PUT',
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json'
            }
        }
        return this._fetch(options,`/${id}`)
    }

    _fetch(options, additionalPath='') {
        const url = this.url + additionalPath;
        return fetch(url, options)
            .then(resp =>{
                if(resp.ok){
                    return resp.json();
                }
                return Promise.reject(resp)
            });
    }
}

export default TasksAPI;