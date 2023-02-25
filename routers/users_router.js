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

  usersRouter.post("/signin", async (req, res) => {
    const user = await User.findOne({
      where: {
        username: req.body.username,
      },
    });
    if (user === null) {
      return res.status(401).json({ error: "Incorrect username or password." });
    }
    const hash = user.password;
    const password = req.body.password;
    const result = bcrypt.compareSync(password, hash);
  
    if (!result) {
      return res.status(401).json({ error: "Incorrect username or password." });
    }
    req.session.userId = user.id;
    return res.json(user);
  });

  usersRouter.get("/signout", function (req, res, next) {
    req.session.destroy();
  });

  usersRouter.get("/me", async (req, res) => {
    // TODO: implement a route that returns the user's info from the database
    if (req.session.userId === undefined) {
      return res.status(401).json({ error: "Unauthorized." });
    }
    const user = await User.findByPk(req.session.userId);
    if (user === null) {
      return res.status(404).json({ errors: "User not found." });
    }
    const currentUser = {
        username : user.username
    };
    console.log(currentUser);
    return res.json(currentUser);
  });
  