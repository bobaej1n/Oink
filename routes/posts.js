const express = require('express');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const { Post, User } = require('../models');

const router = express.Router();

router.use((req, res, next) => {
  res.locals.user = req.user;
  res.locals.followerCount = req.user ? req.user.Followers.length : 0;
  res.locals.followingCount = req.user ? req.user.Followings.length : 0;
  res.locals.myFollowerIdList = req.user ? req.user.Followings.map(f => f.id) : [];
  res.locals.myFollowingIdList = req.user ? req.user.Followers.map(f => f.id) : [];
  next();
});

router.get('/profile', isLoggedIn, (req, res) => {
  res.render('profile', { title: 'Profile - prj-name' });
});

router.get('/join', isNotLoggedIn, (req, res) => {
  res.render('join', { title: 'Join to - prj-name' });
});

router.get('/following', async (req, res, next) => {
  try {
    console.log("/posts/following")
    const posts = await Post.findAll({
      include: {
        model: User,
        attributes: ['id', 'nick'],
      },
      order: [['createdAt', 'DESC']],
    });
    const following = true
    res.render('posts', {
      title: 'prj-name',
      twits: posts,
      following: following,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.get('/follower', async (req, res, next) => {
  try {
    console.log("/posts/following")
    const posts = await Post.findAll({
      include: {
        model: User,
        attributes: ['id', 'nick'],
      },
      order: [['createdAt', 'DESC']],
    });
    const following = false
    res.render('posts', {
      title: 'prj-name',
      twits: posts,
      following: following,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
});



module.exports = router;
