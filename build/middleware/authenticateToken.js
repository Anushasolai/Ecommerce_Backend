"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    if (!token)
        return res.sendStatus(401); // Unauthorized
    try {
        // Synchronously verify the token
        const decoded = jsonwebtoken_1.default.verify(token, process.env.ACCESS_TOKEN_SECRET || '');
        // Attach the user object to the request
        req.user = decoded;
        next();
    }
    catch (err) {
        // Token verification failed
        return res.sendStatus(403); // Forbidden
    }
};
exports.default = authenticateToken;
//# sourceMappingURL=authenticateToken.js.map