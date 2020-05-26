const shortId = require('shortid');

class User {
    id;
    name;
    connectionId;
    host;

    constructor(name, connectionId, host) {
        this.name = name;
        this.connectionId = connectionId;
        this.id = shortId.generate();
        this.host = !!host;
    }

    update(name, connectionId, host) {
        this.name = name;
        if(!!connectionId) {
            this.connectionId = connectionId;
        }
        this.host = !!host;
    }
}

module.exports = User;
