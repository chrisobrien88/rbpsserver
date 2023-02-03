require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const app = express();
const cors = require('cors');
const port = process.env.PORT || 5000;


const PlayerModel = require('./models/PLAYERS').Player;
const RoundModel = require('./models/PLAYERS').Rounds;


// receive data from client in json format
app.use(express.json());
app.use(cors());

mongoose.connect(`mongodb+srv://rbps-admin:${process.env.DB_PASSWORD}@player-info.ydi2mm8.mongodb.net/rbpsPlayers?retryWrites=true&w=majority`, {
    useNewUrlParser: true
});

app.get('/', (req, res) => {
    res.send('try the path: /api/players');
});

// get all players
app.get('/api/players/', async (req, res) => {
    PlayerModel.find({}, (err, result) => {
        if (err) {
            res.send(err);
        } else {
            res.json(result);
        }
    });
});

// get a specific player
app.get('/api/players/:userName', async (req, res) => {
    const id = req.params.userName;
    const filter = { userName: id };
    const player = await PlayerModel.findOne(filter);
    // re-do error handling
    // if (!player) {
    //     res.status(404).send('Player not found');
    // }
    try {
        res.json(player);
    } catch (err) {
        res.status(400).send(err, 'no player found with that name');
    }
});

app.get('/api/players/:userName/best-rounds', async (req, res) => {
    const id = req.params.userName;
    const filter = { userName: id };
    const player = await PlayerModel.findOne(filter);
    if (player.roundsPlayed < 2) {
        return res.json({
            scoresArr: [],
            handicapIndex: 0
        })
    }
    const mostRecentPlayerRounds = player.roundsPlayed.slice(0,20)
    const eligibleRounds = Math.round(mostRecentPlayerRounds.length * 0.4);
    const bestScores = mostRecentPlayerRounds.map(round => round.slopeAdjustedThirtySixHandicapStablefordScore).sort((a, b) => b - a).slice(0, eligibleRounds);
    const totalBestScores = bestScores.reduce((a, b) => a + b, 0);
    const averageBestScores = totalBestScores / bestScores.length;
    const handicapIndex = Number(((72 - averageBestScores) * 0.88).toFixed(2));
    try {
        res.json({
            scoresArr: bestScores,
            handicapIndex: handicapIndex
            });
    } catch (err) {
        res.status(400).send('no player found with that name');
    }
});

// calculate handicap index
//     app.get('/api/players/:userName/handicap-index', async (req, res) => {
//     const id = req.params.userName;
//     const filter = { userName: id };
//     const player = await PlayerModel.findOne(filter);
    
//     const mostRecentPlayerRounds = player.roundsPlayed.slice(0,20)
//     const eligibleRounds = Math.round(mostRecentPlayerRounds.length * 0.4);
    
//     const stablefordScoreThirtySixHandicap = mostRecentPlayerRounds.map(round => round.thirtySixHandicapStablefordScore);
//     const bestScores = stablefordScoreThirtySixHandicap.sort((a, b) => b - a).slice(0, eligibleRounds);
//     const totalBestScores = bestScores.reduce((a, b) => a + b, 0);
//     const averageBestScores = totalBestScores / bestScores.length;
//     const handicapIndex = Number(((72 - averageBestScores) * 0.88).toFixed(2));

//     try {
//         res.json(handicapIndex);
//     } catch (err) {
//         res.status(400).send(err, 'scores not found');
//     }
// });

// // calculate best 3 rounds scores
// app.get('/api/players/:userName/best-three-rounds', async (req, res) => {
//     const id = req.params.userName;
//     const filter = { userName: id };
//     const player = await PlayerModel.findOne(filter);

//     const mostRecentPlayerRounds = player.roundsPlayed.slice(0,20)
//     const bestScores = mostRecentPlayerRounds.map(round => round.eighteenHandicapStablefordScore).sort((a, b) => b - a).slice(0, 3);
//     const totalBestScores = bestScores.reduce((a, b) => a + b, 0);

//     try {
//         res.json(totalBestScores);
//     } catch (err) {
//         res.status(400).send(err, 'scores not found');
//     }
// });

// get a specific player's specific round
app.get('/api/players/:id/:score', async (req, res) => {
    const id = req.params.id;
    const filter = { id: id };
    const scoreId = Number(req.params.score);

    const player = await PlayerModel.findOne(filter);

    const score = player.roundsPlayed.find(round => round.id === scoreId);

    if (!score) {
        res.status(404).send('Score not found');
    }
    try {
        res.json(score);
    }
    catch (err) {
        res.status(400).send(err, 'no score found with that id');
    }
});

// delete a specific player's specific round
app.delete('/api/players/:id/:score', async (req, res) => {
    const id = req.params.id;
    const filter = { id: id };
    const scoreId = Number(req.params.score);

    const player = await PlayerModel.findOne(filter);

    const score = player.roundsPlayed.find(round => round.id === scoreId);

    if (!score) {
        res.status(404).send('Score not found');
    }
    try {
        player.roundsPlayed = player.roundsPlayed.filter(round => round.id !== scoreId);
        player.save();
        res.json(score);
    }
    catch (err) {
        res.status(400).send(err, 'no score found with that id');
    }
});



// create new player
app.post('/api/newplayer', (req, res) => {
    const player = new PlayerModel({
        id: Date.now(),
        email: req.body.email,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        userName: req.body.userName,
        totalScore: 0,
    });
    player.save().then((newPlayer) => {
        console.log('new player created');
        res.send(newPlayer);
    });
});

// update player
app.put('/api/players/:username/update-handicap-index', async (req, res) => {
    console.log('update player route hit')
    const id = req.params.username;
    const filter = { userName: id };
    const player = await PlayerModel.findOne(filter);

    if (!player) {
        res.status(404).send('Player not found');
    }
    try {
        player.handicapIndex = req.body.handicapIndex;
        player.save();
        res.json(player);
    }
    catch (err) {
        res.status(400).send(err, 'no player found with that name');
    }
});



// create new round
// app.post('/api/players/:id', async (req, res) => {
//     const id = req.body.id;
//     const filter = { id: id };
    
//     const round = new RoundModel({
//         id: Date.now(),
//         eagles: req.body.eagles,
//         birdies: req.body.birdies,
//         pars: req.body.pars,
//         bogeys: req.body.bogeys,
//         doubleBogeys: req.body.doubleBogeys,
//         tripleBogeys: req.body.tripleBogeys,
//         blobs: req.body.blobs,
//         slopeRating: req.body.slopeRating,
//         courseRating: req.body.courseRating,
//         course: req.body.course,
//         courseStarRating: req.body.courseStarRating,
//         datePlayed: req.body.datePlayed,

//         grossStablefordScore: req.body.grossStablefordScore,
//         eighteenHandicapStablefordScore: req.body.eighteenHandicapStablefordScore,
//         thirtySixHandicapStablefordScore: req.body.thirtySixHandicapStablefordScore,
//         slopeAdjustedStablefordScore: req.body.slopeAdjustedStablefordScore, 
//         slopeAdjustedEighteenHandicapStablefordScore: req.body.slopeAdjustedEighteenHandicapStablefordScore,
//         slopeAdjustedThirtySixHandicapStablefordScore: req.body.slopeAdjustedThirtySixHandicapStablefordScore,
//         courseHandicap: req.body.courseHandicap,
//     });
//     const player = await PlayerModel.findOne(filter);

//     const roundsPlayed = player.roundsPlayed || [];

//     const update = { roundsPlayed: [round, ...roundsPlayed] };

//     let doc = await PlayerModel.findOneAndUpdate(filter, update, {
//         new: true
//     });
//     res.json(doc);

// });

// create new round
app.post('/api/players/:userName/submit-new-round', async (req, res) => {
    console.log('atttempt to create new round');
    
    const id = req.body.userName;
    const filter = { userName: id };
    
    const round = new RoundModel({
        id: Date.now(),

        courseHandicap: req.body.courseHandicap,
        handicapIndex: req.body.handicapIndex,

        eagles: req.body.eagles,
        birdies: req.body.birdies,
        pars: req.body.pars,
        bogeys: req.body.bogeys,
        doubleBogeys: req.body.doubleBogeys,
        tripleBogeys: req.body.tripleBogeys,
        blobs: req.body.blobs,

        slopeRating: req.body.slopeRating,
        courseRating: req.body.courseRating,
        course: req.body.course,
        courseStarRating: req.body.courseStarRating,
        datePlayed: req.body.datePlayed,

        grossStablefordScore: req.body.grossStablefordScore,
        eighteenHandicapStablefordScore: req.body.eighteenHandicapStablefordScore,
        thirtySixHandicapStablefordScore: req.body.thirtySixHandicapStablefordScore,
        slopeAdjustedStablefordScore: req.body.slopeAdjustedStablefordScore, 
        slopeAdjustedEighteenHandicapStablefordScore: req.body.slopeAdjustedEighteenHandicapStablefordScore,
        slopeAdjustedThirtySixHandicapStablefordScore: req.body.slopeAdjustedThirtySixHandicapStablefordScore,
    });

    const player = await PlayerModel.findOne(filter);
    const roundsPlayed = player.roundsPlayed || [];

    const update = { roundsPlayed: [round, ...roundsPlayed] };
    player.handicapIndex = req.body.handicapIndex;

    // add round to bestRounds if there are less than 3 best rounds.
    if (player.bestRounds.length < 3) {
        console.log('round added to best rounds when less than 3');
        player.bestRounds.push(round);
        player.bestRounds.sort((a, b) => (
            b.slopeAdjustedEighteenHandicapStablefordScore-a.slopeAdjustedEighteenHandicapStablefordScore
        ));
    }
    
    // if there are 3 best rounds, check if the new round is better than the worst round.
    if (player.bestRounds.length > 2 && round.slopeAdjustedEighteenHandicapStablefordScore > player.bestRounds[2].slopeAdjustedEighteenHandicapStablefordScore) {
        player.bestRounds[2] = round;
        console.log('round added to besr rounds when more than 3');
        player.bestRounds.sort((a, b) => (
            b.slopeAdjustedEighteenHandicapStablefordScore-a.slopeAdjustedEighteenHandicapStablefordScore
            ));
    }
    // update total score
    player.totalScore = player.bestRounds.map(round => round.slopeAdjustedEighteenHandicapStablefordScore).reduce((a, b) => a + b, 0);
    console.log('total score: ', player.totalScore);
    player.save();


    let doc = await PlayerModel.findOneAndUpdate(filter, update, {
        new: true
    });
    res.json(doc);

});


// delete player
app.delete('/api/players/:id', async (req, res) => {
    const id = req.params.id;
    const filter = { id: id };
    const player = await PlayerModel.findOneAndDelete(filter);
    if (!player) {
        res.status(404).send('Player not found');
    }
    try {
        res.json(player);
    } catch (err) {
        res.status(500).send(err);
    }
});


app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
})