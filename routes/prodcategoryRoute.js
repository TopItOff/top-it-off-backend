const express = require("express");
const {
  createCategory,
  updateCategory,
  deleteCategory,
  getCategory,
  getallCategory,
} = require("../controller/pductCategoryController");
const { authMidlleWare, isAdmin } = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/", authMidlleWare, isAdmin, createCategory);
router.put("/:id", authMidlleWare, isAdmin, updateCategory);
router.delete("/:id", authMidlleWare, isAdmin, deleteCategory);
router.get("/:id", getCategory);
router.get("/", getallCategory);

module.exports = router;