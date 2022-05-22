const express = require('express');
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const { isLoggedIn } = require('./middlewares');
const User = require('../models/user');

const router = express.Router();

try {
  fs.readdirSync("profileImg");
} catch (error) {
  console.error("profileImg 폴더가 없어 profileImg 폴더를 생성합니다.");
  fs.mkdirSync("profileImg");
}

const profileImgUpload = multer({
  storage: multer.diskStorage({
    destination(req, file, cb) {
      cb(null, "profileImg/");
    },
    filename(req, file, cb) {
      const ext = path.extname(file.originalname);
      cb(null, path.basename("profileImg") + ext);
    },
  }),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

router.post("/profileImg", isLoggedIn, profileImgUpload.single("profileImg"), (req, res) => {
  console.log(req.file);
  res.json({
    url: `/profileImg/${req.file.filename}`,
  });
});

router.post('/:id/follow', isLoggedIn, async (req, res, next) => {
  try {
    const user = await User.findOne({ where: { id: req.user.id } });
    if (user) {
      await user.addFollowing(parseInt(req.params.id, 10));
      res.send('success');
    } else {
      res.status(404).send('no user');
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
});

const upload2 = multer();

router.post('/:id/modify', isLoggedIn, upload2.none(), async (req, res, next) => {
  let body = req.body
  try {
    const user = await User.findOne({ where: { id: req.user.id } });
    if (user) {
      await user.update({
        profileImg: body.url,
        nick: body.nickname,
        email: body.email,
      })
      res.redirect('/modify');
    } else {
      res.status(404).send('no user');
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;
