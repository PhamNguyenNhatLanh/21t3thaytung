var express = require('express');
var router = express.Router();
let roleController = require('../controllers/roles');
var { CreateSuccessRes, CreateErrorRes } = require('../utils/ResHandler');

// Route lấy danh sách vai trò (không cần đăng nhập)
router.get('/', async function (req, res, next) {
  let roles = await roleController.GetAllRole();
  CreateSuccessRes(res, 200, roles);
});

// Route tạo vai trò (chỉ admin có quyền)
router.post('/', verifyRole('admin'), async function (req, res, next) {
  let newRole = await roleController.CreateRole(req.body.name);
  CreateSuccessRes(res, 200, newRole);
});

// Route cập nhật vai trò (chỉ admin có quyền)
router.put('/:id', verifyRole('admin'), async function (req, res, next) {
  let updatedRole = await roleController.UpdateRole(req.params.id, req.body);
  CreateSuccessRes(res, 200, updatedRole);
});

// Route xóa vai trò (chỉ admin có quyền)
router.delete('/:id', verifyRole('admin'), async function (req, res, next) {
  await roleController.DeleteRole(req.params.id);
  CreateSuccessRes(res, 200, "Role deleted");
});

module.exports = router;
