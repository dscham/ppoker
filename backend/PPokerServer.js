const WebSocket = require('ws');
const Connection = require('./Connection');
const Command = require('./Command');
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

    upsertUser(connectionId, user) {
        console.log(user);
        const connection = this.connections.find(c => c.id === connectionId);
        if (this.users.filter(user => user.connectionId === connectionId).length > 0) {
            connection.send({
                command: Command.JoinRejected,
                data: 'Already joined.'
            });
        }

        const asHost = user.host ? 'as host ' : '';
        const existing = this.users.find(u => u.name === user.name);
        const _user = existing ? existing : new User(user.name, connectionId, user.host);
        if (!!existing) {
            _user.update(user.name, connectionId, user.host);
            this.users[this.users.indexOf(_user)].update(user.name, connectionId, user.host);
            console.log(`[${new Date().toISOString()}] << '${_user.name}' (ID: ${_user.id}) joined ${asHost}on Connection '${connectionId}'`);
        } else {
            this.users.push(_user);
            console.log(`[${new Date().toISOString()}] << '${_user.name}' (ID: ${_user.id}) registered ${asHost}on Connection '${connectionId}'`);
        }

        connection.send({
            command: Command.JoinAccepted,
            data: {
                user: _user,
                vote: this.votes.find(vote => vote.userId === _user.id),
                votes:  this.shown ? this.prepateVotesForShow(this.votes) : this.prepareVotesForAcceptedVote(this.votes),
                topic: this.topic
            }
        });
    }

    upsertVote(connectionId, vote) {
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
                        command: Command.VoteAccepted,
                        data: {
                            vote: _vote,
                            votes: this.prepareVotesForAcceptedVote(this.votes)
                        }
                    });
                } else {
                    conn.send({
                        command: Command.Vote,
                        data: this.prepareVotesForAcceptedVote(this.votes)
                    });
                }
            } catch (e) {
                console.log(e);
            }
        });
        const _user = this.users.find(user => user.id === _vote.userId);
        console.log(`[${new Date().toISOString()}] << '${_user.name}' (ID: ${_user.id}) voted '${_vote.value}' on Connection '${connectionId}'`);
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
        console.log(`[${new Date().toISOString()}] << Show from Connection '${connectionId}'`);
        this.connections.forEach((conn) => {
                try {
                    conn.send({
                        command: Command.Show,
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
        console.log(`[${new Date().toISOString()}] << Clear from Connection '${connectionId}'`);
        this.votes = [];
        this.connections.forEach((conn) => {
                try {
                    conn.send({
                        command: Command.Clear
                    });
                } catch (e) {
                    console.log(e);
                }
            }
        );
        this.shown = false;
    }

    updateTopic(connectionId, topic) {
        console.log(`[${new Date().toISOString()}] << Topic changed to '${topic}' from Connection '${connectionId}'`);
        this.topic = topic;
        this.connections.forEach((conn) => {
                try {
                    conn.send({
                        command: Command.Topic,
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
