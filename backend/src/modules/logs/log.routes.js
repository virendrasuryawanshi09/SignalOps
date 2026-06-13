const express = require("express");
const logController = require("./log.controller");
const { authenticate } = require("../../middleware/auth.middleware");

const router = express.Router();

router.post("/", logController.createLog);
router.get("/", authenticate, logController.getAllLogs);
router.get("/:id", authenticate, logController.getLogById);

module.exports = router;
