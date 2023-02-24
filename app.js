import express from "express";
import bodyParser from "body-parser";
import { sequelize } from "./datasource.js";
import { Image } from "./models/image.js";
import { Comment } from "./models/comment.js";
import { User } from "./models/user.js";
import multer from "multer";
import path from "path";

export const app = express();
const PORT = 3000;
const upload = multer({ dest: "uploads/" });
app.use(express.static("static"));
try {
  await sequelize.authenticate();
  // Automatically detect all of your defined models and create (or modify) the tables for you.
  // This is not recommended for production-use, but that is a topic for a later time!
  await sequelize.sync({ alter: { drop: false } });
  console.log("Connection has been established successfully.");
} catch (error) {
  console.error("Unable to connect to the database:", error);
}

app.use(bodyParser.json());

app.use(function (req, res, next) {
  console.log("HTTP request", req.method, req.url, req.body);
  next();
});

app.post("/api/images/", upload.single("picture"), async (req, res) => {
  const user = await User.findOne({ where: { username: req.body.author } });
  if (!user) {
    return res.status(404).json({ error: "User does not exist" });
  }
  if (!(req.file && req.file.mimetype.startsWith("image/"))) {
    return res.status(400).json({ error: "Please upload an image file" });
  }

  const image = await Image.create({
    title: req.body.title,
    picture: req.file,
    UserId: user.id,
  });
  return res.json(image);
});

app.get("/api/images", async (req, res) => {
  const offset = req.query.page;
  const limit = 1;
  console.log(offset, limit);
  const images = await Image.findAll({
    offset,
    limit,
    order: [["createdAt", "DESC"]],
    include: { association: "User", attributes: ["username"] },
  });
  const total = await Image.count();
  return res.json({ images, total });
});

app.delete("/api/images/:id/", async (req, res) => {
  const image = await Image.findByPk(req.params.id);
  if (!image) {
    return res.status(404).json({ error: "Image does not exist" });
  }
  await image.destroy();
  return res.json(image);
});

app.post("/api/comments/", async (req, res) => {
  const user = await User.findOne({ where: { username: req.body.author } });
  const image = await Image.findByPk(req.body.ImageId);

  if (!image || !user) {
    return res.status(404).json({ error: "Image or User does not exist" });
  }

  const comment = await Comment.create({
    content: req.body.content,
    UserId: user.id,
    ImageId: req.body.ImageId,
  });
  return res.json(comment);
});

app.get("/api/comments/", async (req, res) => {
  const imageId = req.query.imageId;
  const offset = req.query.page * 10;
  const limit = 10;
  const comments = await Comment.findAll({
    offset,
    limit,
    order: [["createdAt", "DESC"]],
    where: {
      ImageId: imageId,
    },
    include: { association: "User", attributes: ["username"] },
  });
  const total = await Comment.count({ where: { ImageId: imageId } });
  return res.json({ comments, total });
});

app.delete("/api/comments/:id/", async (req, res) => {
  const comment = await Comment.findByPk(req.params.id);
  if (!comment) {
    return res.status(404).json({ error: "Comment does not exist" });
  }
  await comment.destroy();
  return res.json(comment);
});

app.delete("/api/comments/", async (req, res) => {
  const imageId = req.query.imageId;
  await Comment.destroy({ where: { ImageId: imageId } });
  return res.json({ message: "All comments deleted" });
});

app.post("/api/users/", async (req, res) => {
  const user = await User.findOne({ where: { username: req.body.username } });
  if (!user) {
    const newUser = await User.create({
      username: req.body.username,
    });
    return res.json(newUser);
  }
  return res.json({ message: "User already exists" });
});

app.get("/api/images/:id/picture", async (req, res) => {
  let imageId = req.params.id;
  const image = await Image.findByPk(imageId);
  if (image === null) {
    return res.status(404).json({ errors: "Image not found." });
  }
  res.setHeader("Content-Type", image.picture.mimetype);
  res.sendFile(image.picture.path, { root: path.resolve() });
});

app.listen(PORT, (err) => {
  if (err) console.log(err);
  else console.log("HTTP server on http://localhost:%s", PORT);
});
