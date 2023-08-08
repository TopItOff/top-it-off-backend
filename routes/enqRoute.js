const express = require("express");
const {
  createEnquiry,
  updateEnquiry,
  deleteEnquiry,
  getEnquiry,
  getallEnquiry,
} = require("../controller/enqController");
const { authMidlleWare, isAdmin } = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/", createEnquiry);
router.put("/:id", authMidlleWare, isAdmin, updateEnquiry);
router.delete("/:id", authMidlleWare, isAdmin, deleteEnquiry);
router.get("/:id", getEnquiry);
router.get("/", getallEnquiry);

module.exports = router;