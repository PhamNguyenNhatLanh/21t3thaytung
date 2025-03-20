var express = require('express');
var router = express.Router();
let userController = require('../controllers/users')
var { CreateSuccessRes, CreateErrorRes } = require('../utils/ResHandler')
let jwt = require('jsonwebtoken')
let constants = require('../utils/constants')

/* GET users listing. */
router.get('/', async function (req, res, next) {
  try {
    if (!req.header || !req.headers.authorization) {
      throw new Error("ban chua dang nhap")
    }
    let authorization = req.headers.authorization;
    if(authorization.startsWith("Bearer")){
      let token = authorization.split(" ")[1];
      let result = jwt.verify(token,constants.SECRET_KEY)
      if(result){
        let users = await userController.GetAllUser();
        CreateSuccessRes(res, 200, users);
      }else{
        throw new Error("ban chua dang nhap")
      }
    }else{
      throw new Error("ban chua dang nhap")
    }
  } catch (error) {
    next(error)
  } 
});
router.get('/:id', async function (req, res, next) {
  try {
    let user = await userController.GetUserById(req.params.id)
    CreateSuccessRes(res, 200, user);
  } catch (error) {
    CreateErrorRes(res, 404, error);
  }
});
router.post('/', async function (req, res, next) {
  try {
    let body = req.body
    let newUser = await userController.CreateAnUser(body.username, body.password, body.email, body.role);
    CreateSuccessRes(res, 200, newUser);
  } catch (error) {
    next(error);
  }
})
router.put('/:id', async function (req, res, next) {
  try {
    let updateUser = await userController.UpdateUser(req.params.id, req.body);
    CreateSuccessRes(res, 200, updateUser);
  } catch (error) {
    next(error);
  }
})



module.exports = router;