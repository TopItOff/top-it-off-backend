const express = require('express');
const { createUser,
    userLogin,
    getUser,
    getSingleUser,
    deleteUser,
    updateUser,
    blockUser,
    unblockUser,
    handleRefreshToken,
    logout,
    updatePassword,
    forgotPasswordToken,
    resetPassword,
    loginAdmin,
    getWishlist,
    saveAddress,
    userCart,
    getUserCart,
    emptyCart,
    applyCoupon,
    createOrder,
    getOrders,
    updateOrderStatus
} = require('../controller/userController');
const { authMidlleWare, isAdmin } = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/register', createUser)
router.post('/login', userLogin)
router.post("/admin-login", loginAdmin);
router.put('/order/update-order/:id', authMidlleWare, isAdmin, updateOrderStatus)

router.get('/wishlist',authMidlleWare, getWishlist)
router.get('/get-orders',authMidlleWare, getOrders)
router.post("/cart",authMidlleWare ,userCart);
router.get("/cart",authMidlleWare ,getUserCart);
router.delete("/empty-cart",authMidlleWare ,emptyCart);

router.post("/cart/apply-coupon",authMidlleWare ,applyCoupon);
router.post("/cart/case-order",authMidlleWare ,createOrder);

router.put('/password',authMidlleWare, updatePassword)
router.post('/forgot-password-token', forgotPasswordToken)
router.put('/reset-password/:token', resetPassword)

router.get('/all-user', getUser)
router.get('/refresh', handleRefreshToken)
router.get('/logout', logout)
router.get('/:id', authMidlleWare, isAdmin, getSingleUser)

router.put('/save-address',authMidlleWare, saveAddress),
router.delete('/:id', deleteUser)
router.put('/edit-user', authMidlleWare, updateUser)
router.put('/block-user/:id', authMidlleWare, isAdmin, blockUser)
router.put('/unblock-user/:id', authMidlleWare, isAdmin, unblockUser)
module.exports = router