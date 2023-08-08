const express = require("express");
const {
  createBrand,
  updateBrand,
  deleteBrand,
  getBrand,
  getallBrand,
} = require("../controller/brandController");
const { authMidlleWare, isAdmin } = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/", authMidlleWare, isAdmin, createBrand);
router.put("/:id", authMidlleWare, isAdmin, updateBrand);
router.delete("/:id", authMidlleWare, isAdmin, deleteBrand);
router.get("/:id", getBrand);
router.get("/", getallBrand);

module.exports = router;