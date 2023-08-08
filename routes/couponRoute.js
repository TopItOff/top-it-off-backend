const express = require("express");
const {
  createCoupon,
  getAllCoupons,
  updateCoupon,
  deleteCoupon,
  getCoupon,
} = require("../controller/couponController");
const {authMidlleWare, isAdmin  } = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/", authMidlleWare, isAdmin, createCoupon);
router.get("/", authMidlleWare, isAdmin, getAllCoupons);
router.get("/:id", authMidlleWare, isAdmin, getCoupon);
router.put("/:id", authMidlleWare, isAdmin, updateCoupon);
router.delete("/:id", authMidlleWare, isAdmin, deleteCoupon);

module.exports = router;