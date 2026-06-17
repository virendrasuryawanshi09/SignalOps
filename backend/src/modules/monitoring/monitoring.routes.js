const express = require("express");
const monitoringController = require("./monitoring.controller");

const router = express.Router();

router.get("/health", monitoringController.getHealth);
router.get("/ready", monitoringController.getReady);
router.get("/metrics", monitoringController.getMetrics);

module.exports = router;
