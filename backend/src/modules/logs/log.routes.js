const express = require("express");
const logController = require("./log.controller");

const router = express.Router();

router.post("/", logController.createLog);
router.get("/", logController.getAllLogs);
router.get("/:id", logController.getLogById);

module.exports = router;
