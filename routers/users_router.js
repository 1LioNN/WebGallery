import { Router } from "express";
import { User } from "../models/user.js";
import { Image } from "../models/image.js";
import bcrypt from "bcrypt";
import { Sequelize } from "sequelize";

export const usersRouter = Router();
const saltRounds = 10;
const salt = bcrypt.genSaltSync(saltRounds);

usersRouter.get("/", async (req, res) => {
  const offset = req.query.page * 6;
  const limit = 6;
  let users = await User.findAll({
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
  users = users.sort((a, b) => b.id - a.id);
  console.log(users);
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
    userId: user.id,
  };
  return res.json(currentUser);
});

usersRouter.get("/:id/image", async (req, res) => {
  const id = req.params.id;
  const offset = req.query.page;
  const limit = 1;
  const images = await Image.findAll({
    offset,
    limit,
    where: { UserId: id },
    order: [["createdAt", "DESC"]],
    include: { association: "User", attributes: ["username"] },
  });
  const total = await Image.count({
    where: { UserId: id },
  });
  return res.json({ images, total });
});
