const WebSocket = require('ws');
const User = require('./User');
const Connection = require('./Connection');
const Vote = require('./Vote');

class PPokerServer {
    constructor(server) {
        this.connections = [];
        this.users = [];
        this.votes = [];
        this.topic = '';

        this.server = this.getServer(server);
        this.server.on('connection', (socket) => this.connectionHandler(this, socket));
    }

    getServer(server) {
        if (!!server) {
            return new WebSocket.Server(
                {server},
                () => console.log('Started Listening on:', this.server.address())
            );
        } else {
            return new WebSocket.Server(
                {'port': 4242, host: '0.0.0.0'},
                () => console.log('Started Listening on:', this.server.address())
            );
        }
    }

    connectionHandler($, socket) {
        const connection = new Connection(socket, $);
        $.connections.push(connection);
        console.log(`<< New Connection '${connection.id}'`);
    }

    upsertUser(connectionId, name) {
        console.log(`<< Register on Connection '${connectionId}'`, name);
        const existing = this.users.find(u => u.name === name);
        const _user = existing ? existing.copy() : new User(name, connectionId);
        if (!!existing) {
            this.users[this.users.indexOf(existing)].update(name, connectionId);
        } else {
            this.users.push(_user);
        }

        delete _user.connection;
        delete _user.update;
        delete _user.host; //TODO Remove when adding Host functionality
        const connection = this.connections.find(c => c.id === connectionId);
        connection.send({
            command: 'register',
            data: _user
        });
    }

    upsertVote(connectionId, vote) {
        console.log(`<< Vote on Connection '${connectionId}'`, vote);
        const existing = this.votes.find(v => v.userId === vote.userId);
        const _vote = existing ? existing.copy() : new Vote(vote.value, vote.userId);
        if (!!existing) {
            this.votes[this.votes.indexOf(existing)].update(value);
        } else {
            this.votes.push(_vote);
        }

        delete _vote.update;
        const connection = this.connections.find(c => c.id === connectionId);
        this.connections.forEach((conn) => {
            try {
                if (conn.id === connection.id) {
                    conn.send({
                        command: 'vote-accepted',
                        data: {
                            vote: _vote,
                            votes: filterValues(this.votes)
                        }
                    });
                } else {
                    conn.send({
                        command: 'vote',
                        data: filterValues(this.votes)
                    });
                }
            } catch (e) {
                console.log(e);
            }
        });

        function filterValues(votes) {
            return votes.map(vote => vote.value = '');
        }
    }

    showVotes(connectionId) {
        console.log(`<< Show on Connection '${connectionId}'`);
        this.connections.forEach((conn) => {
                try {
                    conn.send({
                        command: 'show',
                        data: this.votes
                    });
                } catch (e) {
                    console.log(e);
                }
            }
        );
    }

    clearVotes(connectionId) {
        console.log(`<< Clear on Connection '${connectionId}'`);
        this.votes = [];
        this.connections.forEach((conn) => {
                try {
                    conn.send({
                        command: 'clear'
                    });
                } catch (e) {
                    console.log(e);
                }
            }
        );
    }

    updateTopic(connectionId, topic) {
        console.log(`<< Topic changed on Connection '${connectionId}'`, topic);
        this.topic = topic;
        this.connections.forEach((conn) => {
                try {
                    conn.send({
                        command: 'topic',
                        data: this.topic
                    });
                } catch (e) {
                    console.log(e);
                }
            }
        );
    }

    terminateConnection(connectionId) {
        console.log(`<< Connection '${connectionId}' dead`);
        const connection = this.connections.find(c => c.id === connectionId);
        connection.terminate();
        this.connections.splice(this.connections.indexOf(connection), 1);
    }
}

module.exports = PPokerServer;