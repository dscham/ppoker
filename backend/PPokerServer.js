// Imports
const WebSocket = require('ws');
const User = require('./User.js');
const Connection = require('./Connection.js');
const Vote = require('./Vote.js');

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
                { server },
                () => console.log('Started Listening on:', this.server.address())
            );
        } else {
            return new WebSocket.Server(
                { 'port': 4242, host: '0.0.0.0' },
                () => console.log('Started Listening on:', this.server.address())
            );
        }
    }

    connectionHandler($, socket) {
        $.connections.push(new Connection(socket, $));
    }

    upsertUser(connectionId, name) {
        console.log(`<< Register on Connection '${connectionId}'`, name);
        const existing = this.users.find(u => u.name === name);
        if (!!existing) {
            this.users[this.users.indexOf(existing)].update(name, connectionId);
        } else {
            this.users.push(new User(name, connectionId));
        }
    }

    upsertVote(connectionId, vote) {
        console.log(`<< Vote on Connection '${connectionId}'`, vote);
        const existing = this.votes.find(v => v.userId === vote.userId);
        if (!!existing) {
            this.votes[this.votes.indexOf(existing)].update(value);
        } else {
            this.votes.push(new Vote(vote.value, vote.userId));
        }

        const connection = this.connections.find(c => c.id === connectionId);
        this.connections.forEach((conn) => {
            if (conn.id === connection.id) {
                conn.send({
                    command: 'vote-accepted',
                    data: {
                        vote: vote,
                        votes: filterValues(this.votes)
                    }
                });
            } else {
                conn.send(
                    {
                        command: 'vote',
                        data: filterValues(this.votes)
                    }
                );
            }
        });

        function filterValues(votes) {
            return votes.map(vote => vote.value = '');
        }
    }

    showVotes(connectionId) {
        console.log(`<< Show on Connection '${connectionId}'`);
        this.connections.forEach((conn) =>
            conn.send({
                command: 'show',
                data: this.votes
            })
        );
    }

    clearVotes(connectionId) {
        console.log(`<< Clear on Connection '${connectionId}'`);
        this.votes = [];
        this.connections.forEach((conn) =>
            conn.send({
                command: 'clear'
            })
        );
    }

    updateTopic(connectionId, topic) {
        console.log(`<< Topic changed on Connection '${connectionId}'`, topic);
        this.topic = topic;
        this.connections.forEach((conn) =>
            conn.send({
                command: 'topic',
                data: this.topic
            })
        );
    }

    terminateConnection(connectionId) {
        console.log(`<< Connection '${connectionId}' dead.`);
        const connection = this.connections.find(c => c.id === connectionId);
        connection.terminate();
        this.connections.splice(this.connections.indexOf(connection), 1);
    }
}

module.exports = PPokerServer;