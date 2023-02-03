const mongoose = require ('mongoose');

const PlayerSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    userName: {
        type: String,
        required: true
    },
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true
    },
    handicapIndex: {
        type: Number,
        required: false
    },
    roundsPlayed: [],
    bestRounds: [],
    totalScore: {
        type: Number,
        required: false
    },
  },
); 

const RoundsSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: false
    },
    handicapIndex: {
        type: Number,
        required: false
    },
    courseHandicap: {
        type: Number,
        required: false
    },
    eagles: {
        type: Number,
        required: false
    },
    birdies: {
        type: Number,
        required: false
    },
    pars: {
        type: Number,
        required: false
    },
    bogeys: {
        type: Number,
        required: false
    },
    doubleBogeys: {
        type: Number,
        required: false
    },
    tripleBogeys: {
        type: Number,
        required: false
    },
    blobs: {
        type: Number,
        required: false
    },
    slopeRating: {
        type: Number,
        required: false
    },
    courseRating: {
        type: Number,
        required: false
    },
    course: {
        type: String,
        required: false
    },
    courseStarRating: {
        type: Number,
        required: false
    },
    datePlayed: {
        type: Date,
        required: false
    },

    grossStablefordScore: {
        type: Number,
        required: false
    },
    eighteenHandicapStablefordScore: {
        type: Number,
        required: false
    },
    thirtySixHandicapStablefordScore: {
        type: Number,
        required: false
    },
    slopeAdjustedStablefordScore: {
        type: Number,
        required: false
    },
    slopeAdjustedEighteenHandicapStablefordScore: {
        type: Number,
        required: false
    },
    slopeAdjustedThirtySixHandicapStablefordScore: {
        type: Number,
        required: false
    },

});

const Rounds = mongoose.model('Rounds', RoundsSchema);
const Player = mongoose.model('Player', PlayerSchema);

exports.Player = Player;
exports.Rounds = Rounds;