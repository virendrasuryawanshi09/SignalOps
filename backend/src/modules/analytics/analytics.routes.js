const express = require("express");
const analyticsController = require("./analytics.controller");
const { authenticate } = require("../../middleware/auth.middleware");

const router = express.Router();


router.use(authenticate);

router.get("/error-trends", analyticsController.getErrorTrends);
router.get("/severity-distribution", analyticsController.getSeverityDistribution);
router.get("/service-health", analyticsController.getServiceHealth);
router.get("/mttr", analyticsController.getMTTR);

module.exports = router;
