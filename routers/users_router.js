import { Router } from "express";
import { User } from "../models/user.js";
import bcrypt from "bcrypt";
import { Sequelize } from "sequelize";

export const usersRouter = Router();
const saltRounds = 10;
const salt = bcrypt.genSaltSync(saltRounds);

usersRouter.get("/", async (req, res) => {
  const offset = req.query.page * 6;
  const limit = 6;
  const users = await User.findAll({
    offset,
    limit,
    order: [["createdAt", "DESC"]],
    where: {
      id: {
        [Sequelize.Op.not]: req.session.userId,
      },
    },
  });
  const total = (await User.count()) - 1;
  return res.json({ users, total });
});

usersRouter.post("/signup", async (req, res) => {
  const user = await User.findOne({ where: { username: req.body.username } });
  if (!user) {
    const newUser = User.build({
      username: req.body.username,
    });

    let password = req.body.password;
    password = bcrypt.hashSync(password, salt);
    newUser.password = password;

    try {
      await newUser.save();
    } catch {
      return res.status(422).json({ error: "User creation failed." });
    }
    return res.json({
      username: newUser.username,
    });
  }
  return res.json({ message: "Username is taken." });
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
  return res.redirect("/");
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
    username: user.username,
    userId : user.id,
  };
  return res.json(currentUser);
});
