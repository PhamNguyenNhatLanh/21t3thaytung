var express = require('express');
var router = express.Router();
let userController = require('../controllers/users')
var { CreateSuccessRes, CreateErrorRes } = require('../utils/ResHandler')
let jwt = require('jsonwebtoken')
let constants = require('../utils/constants')

/* GET users listing. */
router.post('/login', async function (req, res, next) {
    try {
        let body = req.body;
        let username = body.username;
        let password = body.password
        let result = await userController.Login(username, password);
        let token = jwt.sign({
            id:result._id,
            expire: new Date(Date.now()+24*3600*1000)
        },constants.SECRET_KEY)
        CreateSuccessRes(res, 200,token );
    } catch (error) {
        next(error)
    }
});
router.post('/signup', async function (req, res, next) {
    try {
        let body = req.body;
        let username = body.username;
        let password = body.password;
        let email = body.email
        let result = await userController.CreateAnUser(
            username, password,email,'user');
        let token = jwt.sign({
            id:result._id,
            expire: new Date(Date.now()+24*3600*1000)
        },constants.SECRET_KEY)
        CreateSuccessRes(res, 200,token );
    } catch (error) {
        next(error)
    }
});

module.exports = router;