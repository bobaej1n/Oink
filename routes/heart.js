const express = require('express');
const {
    Post,
    Heart,
    User
} = require('../models');
const {
    isLoggedIn
} = require('./middlewares');

const router = express.Router();

router.use(express.json()); // 전송받은 데이터 json으로 받기

router.post('/', isLoggedIn, async (req, res, next) => {
    try {

        const {
            userId,
            postId
        } = req.body;

        const heart = await Heart.findOne({
            where: {
                userId: userId,
                postId: postId
            }
        });

        if (heart) {
            res.status = 409;
            res.json({
                result: "heart duplicated"
            });
        } else {
            await Heart.create({
                userId,
                postId
            });
            res.status = 201;
            res.json({
                result: "created"
            });
        }
    } catch (error) {
        console.log(error);
        next(error);
    }

});

router.delete('/', async (req, res, next) => {
    try {

        const {
            userId,
            postId
        } = req.body;

        const heart = await Heart.findOne({
            where: {
                userId: userId,
                postId: postId
            }
        });

        if (heart) {
            heart.destroy({
                userId,
                postId
            });
            res.status = 200;
            res.json({
                result: "deleted"
            });

        } else {
            res.status = 404;
            res.json({
                result: "heart not found"
            });
        }

    } catch (error) {
        console.log(error);
        next(error);
    }

});

module.exports = router;