var express = require('express');
var router = express.Router();
let categoryModel = require('../schemas/category');

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

// Route lấy danh sách danh mục (không cần đăng nhập)
router.get('/', async function (req, res, next) {
  let categories = await categoryModel.find();
  res.status(200).send({
    success: true,
    data: categories
  });
});

// Route lấy thông tin chi tiết danh mục (không cần đăng nhập)
router.get('/:id', async function (req, res, next) {
  try {
    let id = req.params.id;
    let category = await categoryModel.findById(id);
    res.status(200).send({
      success: true,
      data: category
    });
  } catch (error) {
    res.status(404).send({
      success: false,
      message: "không có id phù hợp"
    });
  }
});

// Route tạo danh mục (chỉ mod và admin có quyền)
router.post('/', verifyRole('mod'), async function (req, res, next) {
  try {
    let newCategory = new categoryModel({
      name: req.body.name,
      description: req.body.description
    });
    await newCategory.save();
    res.status(200).send({
      success: true,
      data: newCategory
    });
  } catch (error) {
    res.status(404).send({
      success: false,
      message: error.message
    });
  }
});

// Route cập nhật danh mục (chỉ mod và admin có quyền)
router.put('/:id', verifyRole('mod'), async function (req, res, next) {
  try {
    let updatedCategory = await categoryModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).send({
      success: true,
      data: updatedCategory
    });
  } catch (error) {
    res.status(404).send({
      success: false,
      message: error.message
    });
  }
});

// Route xóa danh mục (chỉ admin có quyền)
router.delete('/:id', verifyRole('admin'), async function (req, res, next) {
  try {
    await categoryModel.findByIdAndDelete(req.params.id);
    res.status(200).send({
      success: true,
      message: "Danh mục đã bị xóa"
    });
  } catch (error) {
    res.status(404).send({
      success: false,
      message: "Không tìm thấy danh mục"
    });
  }
});

module.exports = router;
