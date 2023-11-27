const { Router } = require("express");

const router = Router();
const PlayerModel = require("../models/PLAYERS").Player;


router.get("/", async (req, res) => {
    console.log("get all players route hit");
    PlayerModel.find({}, (err, result) => {
      if (err) {
        res.send(err);
      } else {
        res.json(result);
      }
    });
  });


module.exports = router;
