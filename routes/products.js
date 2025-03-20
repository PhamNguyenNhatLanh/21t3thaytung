var express = require('express');
const { ConnectionCheckOutFailedEvent } = require('mongodb');
var router = express.Router();
let productModel = require('../schemas/product');
let CategoryModel = require('../schemas/category');

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

function buildQuery(obj) {
  let result = {};
  if (obj.name) {
    result.name = new RegExp(obj.name, 'i');
  }
  result.price = {};
  if (obj.price) {
    if (obj.price.$gte) {
      result.price.$gte = obj.price.$gte;
    } else {
      result.price.$gte = 0;
    }
    if (obj.price.$lte) {
      result.price.$lte = obj.price.$lte;
    } else {
      result.price.$lte = 10000;
    }
  } else {
    result.price.$gte = 0;
    result.price.$lte = 10000;
  }
  return result;
}

// Route lấy danh sách sản phẩm (không cần đăng nhập)
router.get('/', async function (req, res, next) {
  let products = await productModel.find(buildQuery(req.query)).populate("category");
  res.status(200).send({
    success: true,
    data: products
  });
});

// Route lấy thông tin chi tiết sản phẩm (không cần đăng nhập)
router.get('/:id', async function (req, res, next) {
  try {
    let id = req.params.id;
    let product = await productModel.findById(id);
    res.status(200).send({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(404).send({
      success: false,
      message: "không có id phù hợp"
    });
  }
});

// Route tạo sản phẩm (chỉ mod và admin có quyền)
router.post('/', verifyRole('mod'), async function (req, res, next) {
  try {
    let cate = await CategoryModel.findOne({ name: req.body.category });
    if (cate) {
      let newProduct = new productModel({
        name: req.body.name,
        price: req.body.price,
        quantity: req.body.quantity,
        category: cate._id
      });
      await newProduct.save();
      res.status(200).send({
        success: true,
        data: newProduct
      });
    } else {
      res.status(404).send({
        success: false,
        message: "Danh mục không tồn tại"
      });
    }
  } catch (error) {
    res.status(404).send({
      success: false,
      message: error.message
    });
  }
});

// Route cập nhật sản phẩm (chỉ mod và admin có quyền)
router.put('/:id', verifyRole('mod'), async function (req, res, next) {
  try {
    let updatedProduct = await productModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).send({
      success: true,
      data: updatedProduct
    });
  } catch (error) {
    res.status(404).send({
      success: false,
      message: error.message
    });
  }
});

// Route xóa sản phẩm (chỉ admin có quyền)
router.delete('/:id', verifyRole('admin'), async function (req, res, next) {
  try {
    await productModel.findByIdAndDelete(req.params.id);
    res.status(200).send({
      success: true,
      message: "Sản phẩm đã bị xóa"
    });
  } catch (error) {
    res.status(404).send({
      success: false,
      message: "Không tìm thấy sản phẩm"
    });
  }
});

module.exports = router;
