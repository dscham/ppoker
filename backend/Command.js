class Command {
    static Join = "join";
    static JoinAccepted = "join-accepted";
    static JoinRejected = "join-rejected";
    static Host = "host";
    static HostAccepted = "host-accepted";
    static HostRejected = "host-rejected";
    static Vote = "vote";
    static VoteAccepted = "vote-accepted";
    static Show = "show";
    static Clear = "clear";
    static Topic = "topic";
    static Ping = "ping";
    static Pong = "pong";
}

module.exports = Command;

