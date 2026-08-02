import { verifyToken } from "../utils/jwtHelper.js";

export const authGuard = (req, res, next) => {
    const authHeader = req.get("Authorization");
    if (!authHeader) {
        req.isAuth = false;
        return next();
    }

    const token = authHeader.split(" ")[1];
    if (!token || token === "") {
        req.isAuth = false;
        return next();
    }

    try {
        const decoded = verifyToken(token);
        if (!decoded) {
            req.isAuth = false;
            return next();
        }
        req.isAuth = true;
        req.userId = decoded.id;
        next();
    } catch (err) {
        req.isAuth = false;
        return next();
    }
};

export default authGuard;
