import Command from "./Command.js";

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
            case Command.Ping:
                _this.send({command: Command.Pong});
                break;
            case Command.JoinAccepted:
                _this.client.handleJoinAccepted(data.data);
                break;
            case Command.VoteAccepted:
                _this.client.handleVoteAccepted(data.data);
                break;
            case Command.Vote:
                _this.client.handleVote(data.data);
                break;
            case Command.Show:
                _this.client.handleShow(data.data);
                break;
            case Command.Clear:
                _this.client.handleClear();
                break;
            case Command.Topic:
                _this.client.handleTopic(data.data);
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
