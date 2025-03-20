var express = require('express');
var router = express.Router();
let userController = require('../controllers/users');
var { CreateSuccessRes, CreateErrorRes } = require('../utils/ResHandler');

// Middleware kiểm tra quyền người dùng
function verifyRole(role) {
    return function (req, res, next) {
        let token = req.headers['authorization'];
        if (!token) {
            return res.status(403).send({ success: false, message: "Token is required" });
        }
        token = token.split(" ")[1];
        let userRole = getUserRoleFromToken(token); 
        if (userRole !== role && userRole !== 'admin') {
            return res.status(403).send({ success: false, message: "You don't have permission to perform this action" });
        }
        next();
    };
}

// Route lấy danh sách người dùng (chỉ mod và admin có quyền, trừ người dùng hiện tại)
router.get('/', verifyRole('mod'), async function (req, res, next) {
  let users = await userController.GetAllUser();
  CreateSuccessRes(res, 200, users);
});

// Route tạo người dùng (chỉ admin có quyền)
router.post('/', verifyRole('admin'), async function (req, res, next) {
  let body = req.body;
  let newUser = await userController.CreateAnUser(body.username, body.password, body.email, body.role);
  CreateSuccessRes(res, 200, newUser);
});

// Route cập nhật người dùng (chỉ admin có quyền)
router.put('/:id', verifyRole('admin'), async function (req, res, next) {
  let updateUser = await userController.UpdateUser(req.params.id, req.body);
  CreateSuccessRes(res, 200, updateUser);
});

// Route xóa người dùng (chỉ admin có quyền)
router.delete('/:id', verifyRole('admin'), async function (req, res, next) {
  await userController.DeleteUser(req.params.id);
  CreateSuccessRes(res, 200, "User deleted");
});

module.exports = router;
