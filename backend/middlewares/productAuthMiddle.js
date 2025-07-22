import jwt from "jsonwebtoken";

export const ensureAuthenticated = (req, res, next) => {
  const auth = req.headers["authorization"];
  if (!auth) {
    return res.status(401).json({
      message: "Unauthorized",
      success: false,
      error: true,
    });
  }

  try {
    const decoded = jwt.verify(auth, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.log(error);
    res.status(401).json({
      message: "Unauthorized JWT Token is required",
      success: false,
      error: true,
    });
  }
};
