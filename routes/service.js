const express = require("express");
const router = express.Router();

const { createService } = require("../controller/service");

router.post("/",createService);

module.exports = router;
