// Cập nhật auth.js để chỉ yêu cầu đăng nhập cho các route ngoại trừ '/me' và '/changepassword'
router.use('/me', checkLogin);
router.use('/changepassword', checkLogin);
router.use('/*', checkLogin); // Các route khác yêu cầu đăng nhập
