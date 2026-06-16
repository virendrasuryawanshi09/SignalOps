const express = require("express");
const logController = require("./log.controller");
const validate = require("../../middleware/validate.middleware");
const { ingestLogSchema } = require("./log.validation");
const { authenticate } = require("../../middleware/auth.middleware");

const router = express.Router();

router.post("/", validate(ingestLogSchema), logController.createLog);
router.get("/", authenticate, logController.getAllLogs);
router.get("/:id", authenticate, logController.getLogById);

module.exports = router;
