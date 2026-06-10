const express = require("express");
const authController = require("./auth.controller");
const { authenticate } = require("../../middleware/auth.middleware");

const router = express.Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/refresh-token", authController.refresh);
router.post("/logout", authenticate, authController.logout);

module.exports = router;
