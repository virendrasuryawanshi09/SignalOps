const express = require("express");
const traceController = require("./trace.controller");
const { authenticate } = require("../../middleware/auth.middleware");

const router = express.Router();


router.post("/", traceController.createTrace);


router.get("/", authenticate, traceController.getAllTraces);
router.get("/:traceId", authenticate, traceController.getTraceById);

module.exports = router;
