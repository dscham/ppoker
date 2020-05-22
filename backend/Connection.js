const shortId = require('shortid');

class Connection {
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

    messageHandler($, message) {
        let data = JSON.parse(message);

        switch (data.command) {
            case 'register':
                $.server.upsertUser($.id, data.data);
                break;
            case 'vote':
                $.server.upsertVote($.id, data.data);
                break;
            case 'show':
                $.server.showVotes($.id);
                break;
            case 'clear':
                $.clearVotes($.id);
                break;
            case 'topic':
                $.udpateTopic($.id, data.data);
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

    checkAlive($) {
        if ($.alive) {
            $.alive = false;
            $.send({ command : 'ping' });
        } else {
            $.server.terminateConnection($.id);
        }
    }

    send(data) {
        switch (typeof data) {
            case 'string':
                this.socket.send(data);
                break;
            case "symbol":
            case 'number':
            case "bigint":
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