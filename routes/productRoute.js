const express = require('express');
const {
    createProduct,
    getAproduct,
    getAllProducts,
    updateProduct,
    deleteProduct,
    addToWishlist,
    rating,
    uploadImage, 
    deleteImage} = require('../controller/productController');
const router = express.Router();
const { isAdmin, authMidlleWare } = require('../middlewares/authMiddleware');
const { uploadPhoto, productImgResize } = require('../middlewares/uploadImages');

router.get('/', getAllProducts);
router.get('/:id', getAproduct);
router.put('/addToWishList', authMidlleWare, addToWishlist);
router.put('/rating', authMidlleWare, rating);

router.post('/', authMidlleWare, isAdmin, createProduct);
router.put('/upload/', authMidlleWare, isAdmin,
    uploadPhoto.array("images", 10),
    productImgResize,
    uploadImage
)
router.put('/:id', authMidlleWare, isAdmin, updateProduct);
router.delete('/:id', authMidlleWare, isAdmin, deleteProduct);
router.delete('/delete-img/:id', authMidlleWare, isAdmin, deleteImage);

module.exports = router;