const express = require("express");
const {
  createColor,
  updateColor,
  deleteColor,
  getColor,
  getallColor,
} = require("../controller/colorController");
const { authMidlleWare, isAdmin } = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/", authMidlleWare, isAdmin, createColor);
router.put("/:id", authMidlleWare, isAdmin, updateColor);
router.delete("/:id", authMidlleWare, isAdmin, deleteColor);
router.get("/:id", getColor);
router.get("/", getallColor);

module.exports = router;