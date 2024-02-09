import jwt from "jsonwebtoken";

const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader) {
      const token = authHeader.split(" ")[1];
      console.log(token);

      let decodedData;
      if (token) {
        decodedData = jwt.verify(token, "sEcReT");
        req.userId = decodedData?.id;
      }
    }

    next();
  } catch (error) {
    console.error(error);
    // Handle the error as needed, for example, sending an error response
    return res.status(401).json({ message: 'Unauthorized' });
  }
};

export default auth;
