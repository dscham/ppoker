const WebSocket = require('ws');
const Connection = require('./Connection');
const User = require('./User');
const Vote = require('./Vote');

class PPokerServer {
    connections;
    users;
    votes;
    topic;
    server;
    shown;

    constructor(server) {
        this.connections = [];
        this.users = [];
        this.votes = [];
        this.topic = '';
        this.shown = false;

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
        console.log(`[${new Date().toISOString()}] || New Connection '${connection.id}'`);
    }

    upsertUser(connectionId, name) {
        console.log(`[${new Date().toISOString()}] << Register on Connection '${connectionId}'`, name);
        const existing = this.users.find(u => u.name === name);
        const _user = existing ? existing : new User(name, connectionId);
        if (!!existing) {
            this.users[this.users.indexOf(existing)].update(name, connectionId);
        } else {
            this.users.push(_user);
        }

        const connection = this.connections.find(c => c.id === connectionId);
        connection.send({
            command: 'register-accepted',
            data: {
                user: _user,
                vote: this.votes.find(vote => vote.userId === _user.id),
                votes:  this.shown ? this.prepateVotesForShow(this.votes) : this.prepareVotesForAcceptedVote(this.votes),
                topic: this.topic
            }
        });
    }

    upsertVote(connectionId, vote) {
        console.log(`[${new Date().toISOString()}] << Vote on Connection '${connectionId}'`, vote);
        const existing = this.votes.find(v => v.userId === vote.userId);
        const _vote = existing ? existing : new Vote(vote.value, vote.userId);
        if (!!existing) {
            this.votes[this.votes.indexOf(existing)].update(vote.value);
        } else {
            this.votes.push(_vote);
        }

        const connection = this.connections.find(c => c.id === connectionId);
        this.connections.forEach((conn) => {
            try {
                if (conn.id === connection.id) {
                    conn.send({
                        command: 'vote-accepted',
                        data: {
                            vote: _vote,
                            votes: this.prepareVotesForAcceptedVote(this.votes)
                        }
                    });
                } else {
                    conn.send({
                        command: 'vote',
                        data: this.prepareVotesForAcceptedVote(this.votes)
                    });
                }
            } catch (e) {
                console.log(e);
            }
        });
    }

    prepareVotesForAcceptedVote(votes) {
        const _votes = JSON.parse(JSON.stringify(votes))
        return _votes.map(vote => {
            vote.username = this.users.find(user => user.id === vote.userId).name;
            delete vote.userId;
            vote.value = '';

            return vote;
        });
    }

    showVotes(connectionId) {
        console.log(`[${new Date().toISOString()}] << Show on Connection '${connectionId}'`);
        this.connections.forEach((conn) => {
                try {
                    conn.send({
                        command: 'show',
                        data: this.prepateVotesForShow(this.votes)
                    });
                } catch (e) {
                    console.log(e);
                }
            }
        );
        this.shown = true;
    }

    prepateVotesForShow(votes) {
        const _votes = JSON.parse(JSON.stringify(votes))
        return _votes.map(vote => {
            vote.username = this.users.find(user => user.id === vote.userId).name;
            delete vote.userId;
            return vote;
        });
    }

    clearVotes(connectionId) {
        console.log(`[${new Date().toISOString()}] << Clear on Connection '${connectionId}'`);
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
        this.shown = false;
    }

    updateTopic(connectionId, topic) {
        console.log(`[${new Date().toISOString()}] << Topic changed on Connection '${connectionId}'`, topic);
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
        console.log(`[${new Date().toISOString()}] || Connection '${connectionId}' dead`);
        const connection = this.connections.find(c => c.id === connectionId);
        connection.terminate();
        this.connections.splice(this.connections.indexOf(connection), 1);
    }
}

module.exports = PPokerServer;