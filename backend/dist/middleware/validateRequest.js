export const validateRequest = (schema) => {
    return (req, res, next) => {
        try {
            schema.parse(req.body);
            next();
        }
        catch (error) {
            return res.status(400).json({
                message: "Validation failed",
                errors: error.issues.map((issue) => issue.message)
            });
        }
    };
};
//# sourceMappingURL=validateRequest.js.map