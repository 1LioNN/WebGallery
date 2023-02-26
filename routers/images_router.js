import { Router } from "express";
import { Image } from "../models/image.js";
import { Comment } from "../models/comment.js";
import { User } from "../models/user.js";
import multer from "multer";
import path from "path";

export const imagesRouter = Router();
const upload = multer({ dest: "uploads/" });

imagesRouter.post("/", upload.single("picture"), async (req, res) => {
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

imagesRouter.get("/:id", async (req, res) => {
  const image = await Image.findByPk(req.params.id, {
    include: { association: "User", attributes: ["username"] },
  });
  if (!image) {
    return res.status(404).json({ error: "Image does not exist" });
  }
  return res.json(image);
});

imagesRouter.delete("/:id/", async (req, res) => {
  const image = await Image.findByPk(req.params.id);
  if (!image) {
    return res.status(404).json({ error: "Image does not exist" });
  }

  await Comment.destroy({ where: { ImageId: image.id } });
  await image.destroy();
  return res.json(image);
});

imagesRouter.get("/:id/picture", async (req, res) => {
  let imageId = req.params.id;
  const image = await Image.findByPk(imageId);
  if (image === null) {
    return res.status(404).json({ errors: "Image not found." });
  }
  res.setHeader("Content-Type", image.picture.mimetype);
  res.sendFile(image.picture.path, { root: path.resolve() });
});
