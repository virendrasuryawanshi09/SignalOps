const express = require("express");
const authController = require("./auth.controller");
const validate = require("../../middleware/validate.middleware");
const { registerSchema, loginSchema } = require("./auth.validation");
const { authenticate } = require("../../middleware/auth.middleware");

const router = express.Router();

router.post("/register", validate(registerSchema), authController.register);
router.post("/login", validate(loginSchema), authController.login);
router.post("/refresh-token", authController.refresh);
router.post("/logout", authenticate, authController.logout);

module.exports = router;
