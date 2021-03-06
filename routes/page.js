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
      include: [
        {
          model: User,
          attributes: ["id", "nick", "profileImg"],
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
      order: [["createdAt", "DESC"], [{model: Comment, as: "comments"},'createdAt', "ASC"]],
    });

    res.render("profile", {
      title: "Profile - Oink",
      twits: posts,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.get("/modify", isLoggedIn, async (req, res, next) => {
  res.render("modify", { title: "Modify - Oink" });
});

router.get("/join", isNotLoggedIn, (req, res) => {
  res.render("join", { title: "Join to - Oink" });
});

router.get("/", async (req, res, next) => {
  try {
    const posts = await Post.findAll({
      include: [
        {
          model: User,
          attributes: ["id", "nick", "profileImg"],
        },
        {
          model: Comment,
          as: "comments",
          include: [
            {
              model: User,
              attributes: ["nick", "profileImg"],
            },
          ],
        },
        {
          model: Heart,
          as: "hearts",
        },
      ],
      order: [["createdAt", "DESC"], [{model: Comment, as: "comments"},'createdAt', "ASC"]],
    });

    res.render("main", {
      title: "Oink",
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
    const nick = await User.findOne({ where : { nick: query}})
    let posts = [];
    if (hashtag) {
      posts = await hashtag.getPosts({ include: [{ model: User }] });
    }
    if(nick) {
      posts = await nick.getPosts({ include: [{ model: User }] });
    }

    return res.render("main", {
      title: `${query} | NodeBird`,
      twits: posts,
    });
  } catch (error) {
    console.error(error);
    return next(error);
  }
});

router.get('/modify',isLoggedIn, async (req, res, next) => {
  try {
    const posts = await Post.findAll({
      include: {
        model: User,
        attributes: ['id', 'nick', 'profileImg'],
      },
      order: [['createdAt', 'DESC']],
    });

    const comments = await Comment.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.render('main', {
      title: 'Oink',
      twits: posts,
      comments:comments,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.post("/modify/:id", isLoggedIn, async (req, res, next) =>{

  console.log(req.body);

  try{
    const post = await Post.findOne({
      where : {id : req.params.id}
    });

    if (post){
      const mosdify = await post.update({
        content: req.body.content
        
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
    
    }
    res.redirect("/");
  } catch(error){
    console.error(error);
    next(error);
  }
});

module.exports = router;
