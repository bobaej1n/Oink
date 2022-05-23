const express = require('express');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const { Post, User, Heart } = require('../models');

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

// 팔로잉 게시글 보기 
router.get('/following', async (req, res, next) => {
  try {
    const posts = await Post.findAll({
      include: {
        model: User,
        attributes: ['id', 'nick'],
      },
      order: [['createdAt', 'DESC']],
    });
    const following = true
    res.render('posts', {
      title: 'Posts - prj-name',
      twits: posts,
      following: following,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

// 팔로워 게시글 보기
router.get('/follower', async (req, res, next) => {
  try {
    const posts = await Post.findAll({
      include: {
        model: User,
        attributes: ['id', 'nick'],
      },
      order: [['createdAt', 'DESC']],
    });
    const follower = true
    res.render('posts', {
      title: 'Posts - prj-name',
      twits: posts,
      follower: follower,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

// 좋아요한 게시글 보기
router.get('/like', async (req, res, next) => {
  try {
    const posts = await Post.findAll({
      include: {
        model: User,
        attributes: ['id', 'nick'],
      },
      order: [['createdAt', 'DESC']],
    });
    const hearts = await Heart.findAll({
      include: [{ all: true }]
    });
    const like = true
    res.render('posts', {
      title: 'Posts - prj-name',
      twits: posts,
      hearts: hearts,
      like: like,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

module.exports = router;
