
function validate(schema) {
  return (req, res, next) => {
    const errors = [];

    for (const [key, rules] of Object.entries(schema)) {
      const val = req.body[key];


      if (rules.required && (val === undefined || val === null || val === "")) {
        errors.push(`Field '${key}' is required.`);
        continue;
      }

      if (val !== undefined && val !== null && val !== "") {

        if (rules.type && typeof val !== rules.type) {
          errors.push(`Field '${key}' must be of type '${rules.type}'.`);
          continue;
        }


        if (rules.enum && !rules.enum.includes(val)) {
          errors.push(
            `Field '${key}' must be one of: ${rules.enum.join(", ")}.`
          );
        }
        if (rules.pattern && rules.pattern instanceof RegExp && !rules.pattern.test(val)) {
          errors.push(`Field '${key}' is invalid.`);
        }
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed: Invalid input payload",
        errors,
      });
    }

    next();
  };
}

module.exports = validate;
