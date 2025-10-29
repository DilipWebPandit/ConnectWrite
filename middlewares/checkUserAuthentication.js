import jwt from "jsonwebtoken";

export const verifyUser = (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.redirect("/signin");
    }

    jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
      if (err) {
        if (err.name === "TokenExpiredError") {
          req.session.message = "Session expired. Please sign in again.";
        } else {
          req.session.message = "Authentication failed.";
        }
        return res.redirect("/signin");
      }

      // req.user.userId = decoded;
      req.userId = decoded.id;

      next();
    });
  } catch (error) {
    res.redirect("/signin");
  }
};
