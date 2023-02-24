import { Comment } from "../models/comment.js";
import { Image } from "../models/image.js";
import { User } from "../models/user.js";
import {Router} from "express";
import { isAuthenticated } from "../middleware/auth.js";

export const commentsRouter = Router();

commentsRouter.post("/", async (req, res) => {
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
  
  commentsRouter.get("/", async (req, res) => {
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
  
  commentsRouter.delete("/:id/", async (req, res) => {
    const comment = await Comment.findByPk(req.params.id);
    if (!comment) {
      return res.status(404).json({ error: "Comment does not exist" });
    }
    await comment.destroy();
    return res.json(comment);
  });
