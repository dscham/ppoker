const shortId = require('shortid');

class User {
    constructor(name, connectionId) {
        this.name = name;
        this.connectionId = connectionId;

        this.id = shortId.generate();
        this.host = false;
    }

    update(name, connectionId) {
        this.name = name;
        if(!!connectionId) {
            this.connectionId = connectionId;
        }
    }
}

module.exports = User;