import jwt from "jsonwebtoken";

const isAuthenticated = async (req, res, next) => {
  // const token = req.headers.authorization;
  let token = req.cookies.token
    ? req.cookies?.token
    : req.headers?.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  const decodedToken = await jwt.verify(token, process.env.JWT_SECRET);

  req.user = decodedToken._id;

  next();
};

export default isAuthenticated;
