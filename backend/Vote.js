class Vote {
    value;
    userId;

    constructor(value, userId) {
        this.value = value;
        this.userId = userId;
    }

    update(value) {
        this.value = value;
    }
}

module.exports = Vote;