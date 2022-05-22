const express = require("express");
const { isLoggedIn, isNotLoggedIn } = require("./middlewares");
const { Post, User, Hashtag, Heart, Comment } = require("../models");

const router = express.Router();

router.use((req, res, next) => {
  res.locals.user = req.user;
  res.locals.followerCount = req.user ? req.user.Followers.length : 0;
  res.locals.followingCount = req.user ? req.user.Followings.length : 0;
  res.locals.followerIdList = req.user
    ? req.user.Followings.map((f) => f.id)
    : [];
  next();
});

router.get("/profile", isLoggedIn, async (req, res, next) => {
  try {
    const posts = await Post.findAll({
      include: {
        model: User,
        attributes: ["id", "nick"],
      },
      order: [["createdAt", "DESC"]],
    });
    res.render("profile", {
      title: "Profile - prj-name",
      twits: posts,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.get("/modify", isLoggedIn, async (req, res, next) => {
  res.render("modify", { title: "Modify - prj-name" });
});

router.get("/join", isNotLoggedIn, (req, res) => {
  res.render("join", { title: "Join to - prj-name" });
});

router.get("/", async (req, res, next) => {
  try {
    const posts = await Post.findAll({
      include: [
        {
          model: User,
          attributes: ["id", "nick"],
        },
        {
          model: Comment,
          as: "comments",
          include: [
            {
              model: User,
            },
          ],
        },
        {
          model: Heart,
          as: "hearts",
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.render("main", {
      title: "prj-name",
      twits: posts,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.get("/hashtag", async (req, res, next) => {
  const query = req.query.hashtag;
  if (!query) {
    return res.redirect("/");
  }
  try {
    const hashtag = await Hashtag.findOne({ where: { title: query } });
    let posts = [];
    if (hashtag) {
      posts = await hashtag.getPosts({ include: [{ model: User }] });
    }

    return res.render("main", {
      title: `${query} | NodeBird`,
      twits: posts
    });
  } catch (error) {
    console.error(error);
    return next(error);
  }
});

module.exports = router;
