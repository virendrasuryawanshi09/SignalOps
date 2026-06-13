const express = require("express");
const deploymentController = require("./deployment.controller");
const { authenticate } = require("../../middleware/auth.middleware");

const router = express.Router();

router.use(authenticate);

router.post("/", deploymentController.createDeployment);
router.get("/", deploymentController.getAllDeployments);

module.exports = router;
