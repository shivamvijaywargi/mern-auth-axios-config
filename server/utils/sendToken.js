const sendJWTToken = async (res, user, statusCode = 500) => {
  const token = await user.getJWTToken();

  // Setting options for cookies
  const options = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRY * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  // Sending token in cookie
  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    user,
    token,
  });
};

export default sendJWTToken;
