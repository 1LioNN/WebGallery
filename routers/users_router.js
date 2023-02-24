import { Router } from "express";
import { User } from "../models/user.js";
import bcrypt from "bcrypt";

export const usersRouter = Router();

usersRouter.post("/", async (req, res) => {
    const user = await User.findOne({ where: { username: req.body.username } });
    if (!user) {
      const newUser = await User.create({
        username: req.body.username,
      });
      return res.json(newUser);
    }
    return res.json({ message: "User already exists" });
  });
