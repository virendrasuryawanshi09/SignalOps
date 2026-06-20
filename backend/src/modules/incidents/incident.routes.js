const express = require("express");
const incidentController = require("./incident.controller");
const { authenticate } = require("../../middleware/auth.middleware");

const router = express.Router();

router.use(authenticate);


router.get("/", incidentController.getAllIncidents);
router.get("/:id", incidentController.getIncidentById);
router.patch("/:id/status", incidentController.updateStatus);
router.patch("/:id/assignee", incidentController.assignUser);


router.post("/:id/analyze", incidentController.analyzeIncident);

module.exports = router;
