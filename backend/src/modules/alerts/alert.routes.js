const express = require("express");
const alertController = require("./alert.controller");
const { authenticate } = require("../../middleware/auth.middleware");

const router = express.Router();

router.use(authenticate);

router.post("/", alertController.createAlert);
router.get("/", alertController.getAllAlerts);
router.patch("/:id", alertController.updateAlert);
router.delete("/:id", alertController.deleteAlert);
router.post("/test", alertController.testAlert);

module.exports = router;
