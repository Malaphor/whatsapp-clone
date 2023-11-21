import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import "dotenv/config";
import { UserModel } from "../models/Users.js";
import { MessagesModel } from "../models/Messages.js";

const router = express.Router();

const verifyJWT = (req, res, next) => {
  const token = req.headers["x-access-token"];
  if (!token) {
    res.json({ message: "No token recieved" });
  } else {
    jwt.verify(token, process.env.SECRET_TOKEN, (err, decoded) => {
      if (err) {
        console.log(err);
        res.json({ message: "Internal server error" });
      } else {
        req.userId = decoded.userId;
        next();
      }
    });
  }
};

router.post("/register", async (req, res) => {
  const { name, username, password } = req.body;

  const existingUser = await UserModel.findOne({ username });

  if (existingUser) {
    return res.json({ message: "User already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = new UserModel({ name, username, password: hashedPassword });
  const savedUser = await user.save();
  console.log(process.env.SECRET_TOKEN);

  savedUser.accessToken = jwt.sign(
    { userId: savedUser._id },
    process.env.SECRET_TOKEN
  );
  const newUser = await savedUser.save();

  res.json({
    message: "User registered successfully",
    accessToken: newUser.accessToken,
    name: newUser.name,
    picture: "",
  });
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await UserModel.findOne({ username });

    if (!user) {
      return res.json({ message: "User doesn't exist" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.json({ message: "Username or password is incorrect" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.SECRET_TOKEN);

    user.accessToken = token;
    await user.save();

    res.json({
      messege: "Login successful",
      accessToken: token,
      name: user.name,
      picture: user.picture,
    });
  } catch (err) {
    console.log(err);
    res.json({ message: "Internal server error" });
  }
});

router.post("/logout", verifyJWT, async (req, res) => {
  console.log(`id: ${req.userId}`);
  try {
    const user = await UserModel.findById(req.userId);
    user.accessToken = "";

    await user.save();

    res.json({ message: "Logged out" });
  } catch (err) {
    console.log(err);
    res.json({ message: "Internal server error" });
  }
});

router.get("/checkToken", async (req, res) => {
  try {
    const token = req.headers["x-access-token"];

    if (!token) {
      res.json({ message: "No token recieved" });
    } else {
      jwt.verify(token, process.env.SECRET_TOKEN, async (err, decoded) => {
        if (err) {
          res.json({ message: "Invalid token" });
        } else {
          const user = await UserModel.findById(decoded.userId);
          res
            .status(200)
            .json({ message: "Valid", name: user.name, picture: user.picture });
        }
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.put("/updateProfile", async (req, res) => {
  try {
    jwt.verify(
      req.body.accessToken,
      process.env.SECRET_TOKEN,
      async (err, decoded) => {
        if (err) {
          res.json({ message: "Invalid token" });
        } else {
          const user = await UserModel.findOne({
            accessToken: req.body.accessToken,
          });
          user.picture = req.body.profilePicture;

          const savedUser = await user.save();
          res.status(200).json({
            message: "Profile updated",
            picture: savedUser.picture,
          });
        }
      }
    );
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

export { router as userRouter };
