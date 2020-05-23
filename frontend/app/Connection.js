export default class Connection {
    client;
    protocol;
    socket;

    constructor(client) {
        this.client = client;

        this.protocol = (location.protocol === 'https:' ? 'wss' : 'ws') + '://';
        this.socket = new WebSocket(`${this.protocol}${location.hostname}:${location.port}`);
        this.socket.addEventListener('message', message => this.messageHandler(this, message));
    }

    messageHandler(_this, message) {
        const data = JSON.parse(message.data);

        switch (data.command) {
            case 'ping':
                _this.send({command: 'pong'});
                break;
            case 'register-accepted':
                _this.client.handleRegisterAccepted(data.data);
                break;
            case 'vote-accepted':
                _this.client.handleVoteAccepted(data.data);
                break;
            case 'vote':
                _this.client.handleVote(data.data);
                break;
            case 'show':
                _this.client.handleShow(data.data);
                break;
            case 'clear':
                _this.client.handleClear();
                break;
            case 'topic':
                _this.client.handleTopic(data.data);
                break;
            case 'error':
                _this.client.handleError(data.data);
                break;
            default:
                console.log('Unhandled command', data);
                break;
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
}