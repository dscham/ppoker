import * as DomRefs from "./DomRefs.js";
import Connection from "./Connection.js";
import Command from "./Command.js";
import User from "./User.js";
import Vote from "./Vote.js";
import CardValues from "./CardValues.js";

export default class PPokerClient {
    connection;
    user;
    vote;
    votes;
    topic;

    constructor() {
        this.connection = new Connection(this);
        this.user = new User();
        this.vote = new Vote();
        this.votes = [];
        this.topic = ``;

        this.renderVoteCards();
        DomRefs.join.addEventListener('click',event => this.join(this, event));
        DomRefs.host.addEventListener('click', event => this.host(this, event));
        DomRefs.topic.addEventListener('focusout', event => this.changeTopic(this, event));
        DomRefs.topic.addEventListener('keyup', event => { if (event.which === 13) this.changeTopic(this, event)});
        DomRefs.showVotes.addEventListener('click', event => this.showVotes(this, event));
        DomRefs.clearVotes.addEventListener('click', event => this.clearVotes(this, event))
    }

    renderVoteCards() {
        CardValues.forEach(value => this.generateVoteCardElement(value,  DomRefs.voteButtons));
    }

    generateVoteCardElement(value, parent) {
        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = `vote`;
        radio.value = value;
        radio.id = `vote-${value}`;

        const label = document.createElement('label');
        label.htmlFor = radio.id;
        label.textContent = value;

        label.addEventListener('click', (event) => this.submitVote(this, event));

        parent.appendChild(radio);
        parent.appendChild(label);
    }

    join(_this, event) {
        _this.connection.send({
           command: Command.Join,
            data: {
                name: DomRefs.username.value,
                host: false
            }
        });
    }

    host(_this, event) {
        _this.connection.send({
            command: Command.Host,
            data: {
                name: DomRefs.username.value,
                host: true
            }
        });
    }

    changeTopic(_this, event) {
        if (this.user.host) {
            event.target.blur();
            _this.connection.send({
                command: Command.Topic,
                data: event.target.value
            });
        } else {
            this.handleTopic();
        }
    }

    submitVote(_this, event) {
        _this.vote.value = document.querySelector(`#${event.target.htmlFor}`).value;
        _this.vote.userId = _this.user.id;

        _this.connection.send({
           command: Command.Vote,
           data: _this.vote
        });
    }

    clearVotes(_this, event) {
        _this.connection.send({ command: Command.Clear });
    }

    showVotes(_this, event) {
        _this.connection.send({ command: Command.Show });
    }

    handleJoinAccepted(data) {
        console.log(data);

        this.user.name = data.user.name;
        this.user.id = data.user.id;
        this.user.host = data.user.host;
        this.handleVote(data.votes);
        this.selectVoteCard(data.vote);
        this.handleTopic(data.topic);


        DomRefs.hosting.hidden = !this.user.host;
        DomRefs.username.value = this.user.name;
        DomRefs.username.disabled = true;
        DomRefs.join.disabled = true;
        DomRefs.host.disabled = true;
        DomRefs.voting.hidden = false;
        DomRefs.votes.hidden = false;
    }

    handleVoteAccepted(data) {
        this.selectVoteCard(data.vote);
        this.vote.value = data.vote.value;
        this.renderVotes(data.votes);
    }

    selectVoteCard(vote) {
        if (vote) {
            const radio = document.querySelector(`#vote-${vote.value}`);
            radio.checked = true;
        }
    }


    handleVote(votes) {
        this.renderVotes(votes);
    }

    renderVotes(votes) {
        DomRefs.voteList.innerHTML = null;
        votes.forEach((vote) => {
           DomRefs.voteList.appendChild(this.generateVoteElement(vote));
        });
    }

    generateVoteElement(vote) {
        const li = document.createElement('li');

        const value = document.createElement('span');
        value.classList += 'vote-value';
        value.textContent = vote.value;
        li.appendChild(value);

        const user = document.createElement('span');
        user.classList += 'vote-user';
        user.textContent = vote.username;
        li.appendChild(user);

        return li;
    }

    handleShow(votes) {
        this.renderVotes(votes);
    }

    handleClear() {
        DomRefs.voteList.innerHTML = '';
        document.querySelectorAll(`input[type=radio][name=vote]`)
            .forEach(radio => radio.checked = false);
    }

    handleTopic(topic) {
        DomRefs.topic.value = topic ? topic : "Topic";
    }
}

new PPokerClient();
