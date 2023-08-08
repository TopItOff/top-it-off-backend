const express = require('express');
const { createBlog, updateBlog, getABlog, getAllBlog, deleteBlog, liketheBlog, disliketheBlog, uploadImage } = require('../controller/blogController');
const {authMidlleWare, isAdmin} = require('../middlewares/authMiddleware');
const { uploadPhoto, blogImgResize } = require('../middlewares/uploadImages');
const router = express.Router()


router.post('/',authMidlleWare, isAdmin, createBlog);
router.put('/upload/:id', authMidlleWare, isAdmin,
    uploadPhoto.array('images',2),
    blogImgResize,
    uploadImage
)
router.put('/likes', authMidlleWare, liketheBlog)
router.put('/dislikes', authMidlleWare, disliketheBlog)
router.put('/:id',authMidlleWare, isAdmin, updateBlog);
router.get('/:id', getABlog);
router.get('/', getAllBlog);
router.delete('/:id', authMidlleWare, isAdmin, deleteBlog);


module.exports = router;