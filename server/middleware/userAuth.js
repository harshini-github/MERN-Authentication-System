import jwt from "jsonwebtoken";

const userAuth = async (req, res, next) => {
  try {
    // get token from cookie
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Login Again"
      });
    }

    // verify token
    const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);

    // attach user id to request
    req.userId = tokenDecode.id;

    // proceed to controller
    next();

  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized. Login Again"
    });
  }
};

export default userAuth;

  
