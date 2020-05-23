const shortId = require('shortid');

class Connection {
    id;
    socket;
    server;
    alive;

    constructor(socket, server) {
        this.socket = socket;
        this.server = server;

        this.id = shortId.generate();
        this.alive = true;
        this.registerHandlers();
        this.heartbeat = setInterval(() => this.checkAlive(this), 5000);
    }

    registerHandlers() {
        this.socket.on('message', (message) => this.messageHandler(this, message));
        this.socket.on('error', (error) => this.errorHandler(error));
    }

    messageHandler(_this, message) {
        let data = JSON.parse(message);

        switch (data.command) {
            case 'register':
                _this.server.upsertUser(_this.id, data.data);
                break;
            case 'vote':
                _this.server.upsertVote(_this.id, data.data);
                break;
            case 'show':
                _this.server.showVotes(_this.id);
                break;
            case 'clear':
                _this.server.clearVotes(_this.id);
                break;
            case 'topic':
                _this.server.updateTopic(_this.id, data.data);
                break;
            case 'pong':
                this.alive = true;
                break;
            default:
                break;
        }
    }

    errorHandler(err) {
        console.log('Error!');
        console.error(err);

        throw err;
    }

    checkAlive(_this) {
        if (_this.alive) {
            _this.alive = false;
            _this.send({ command : 'ping' });
            setTimeout(() => checkResponse(_this), 250);
        } else {
            _this.server.terminateConnection(_this.id);
        }

        function checkResponse(__this) {
            if (!__this.alive) __this.server.terminateConnection(__this.id);
        }
    }

    send(data) {
        switch (typeof data) {
            case 'string':
                this.socket.send(data);
                break;
            case 'number':
            case 'boolean':
                this.socket.send(String(data));
                break;
            case 'object':
                if (data !== null) {
                    this.socket.send(JSON.stringify(data));
                    break;
                }
                throw {
                    error: `TypeError`,
                    detail: `Cannot send 'null'`,
                    message: `The data to send is 'null'. Won't transfer.`
                };
            case "function":
                throw {
                    error: `TypeError`,
                    detail: `Cannot send 'function'`,
                    message: `The data to send is a 'function'. Won't transfer.`
                };
            case 'undefined':
                throw {
                    error: `TypeError`,
                    detail: `Cannot send 'undefined'`,
                    message: `The data to send is 'undefined'. Won't transfer.`
                };
            default:
                throw {
                    error: `TypeError`,
                    detail: `Cannot send '${typeof data}'`,
                    message: `'${typeof data}' is not recognised by Connection.send(). Won't transfer.`
                };
        }
    }

    terminate() {
        this.socket.terminate();
        this.socket = undefined;
        clearInterval(this.heartbeat);
    }
}

module.exports = Connection;