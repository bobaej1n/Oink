const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const { Post, Hashtag, Heart, Comment } = require("../models");
const { isLoggedIn } = require("./middlewares");

const router = express.Router();

try {
  fs.readdirSync("uploads");
} catch (error) {
  console.error("uploads 폴더가 없어 uploads 폴더를 생성합니다.");
  fs.mkdirSync("uploads");
}

const upload = multer({
  storage: multer.diskStorage({
    destination(req, file, cb) {
      cb(null, "uploads/");
    },
    filename(req, file, cb) {
      const ext = path.extname(file.originalname);
      cb(null, path.basename(file.originalname, ext) + Date.now() + ext);
    },
  }),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

router.post("/img", isLoggedIn, upload.single("img"), (req, res) => {
  console.log(req.file);
  res.json({
    url: `/img/${req.file.filename}`,
  });
});

const upload2 = multer();
router.post("/", isLoggedIn, upload2.none(), async (req, res, next) => {
  try {
    console.log(req.user);
    const post = await Post.create({
      content: req.body.content,
      img: req.body.url,
      UserId: req.user.id,
    });
    const hashtags = req.body.content.match(/#[^\s#]*/g);
    if (hashtags) {
      const result = await Promise.all(
        hashtags.map((tag) => {
          return Hashtag.findOrCreate({
            where: {
              title: tag.slice(1).toLowerCase(),
            },
          });
        })
      );
      await post.addHashtags(result.map((r) => r[0]));
    }
    res.redirect("/");
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.post("/comment", isLoggedIn, async (req, res, next) => {
  try {
    const comment = await Comment.create({
      userId: req.user.id,
      postId: req.body.postId,
      content: req.body.content
    });

    const post = await Post.findOne({
      where: {id: req.body.postId}
    });

    post.addComments(comment)

      res.redirect("/");
      console.log(res)
      
} catch (error) {
  console.error(error);
  next(error);
}
});

router.delete("/comment", async (req, res, next) => {
  try {
    const { id } = req.body;

    const comment = await Comment.findOne({
      where: {
        id: id
      },
    });

    if (comment) {
      comment.destroy({
        id
      });
      res.status = 200;
      res.json({
        result: "deleted",
      });
    } else {
      res.status = 404;
      res.json({
        result: "comment not found",
      });
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.delete("/", async (req, res, next) => {
  try {
    const { id } = req.body;
    const post = await Post.findOne({
      where: {
        id: id
      },
    });

    if (post) {
      post.destroy({
        id
      });
      res.status = 200;
      res.json({
        result: "deleted",
      });
    } else {
      res.status = 404;
      res.json({
        result: "post not found",
      });
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});


module.exports = router;
