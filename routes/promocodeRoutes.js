const express = require("express");
const router = express.Router();

const {
  createPromocode,
  updatePromocode,
  deletePromo,
  applyPromocode,
  getAllPromos
} = require("../controllers/promoServices");

const { firebaseAuth } = require("../middlewares/firebaseAuth");
const { allowedTo } = require('../controllers/authServices');

// ----------------------
// ADMIN ROUTES
// ----------------------
router.post("/", firebaseAuth, allowedTo("admin"), createPromocode);
router.patch("/:id", firebaseAuth, allowedTo("admin"), updatePromocode);
router.delete("/:id", firebaseAuth, allowedTo("admin"), deletePromo);
router.get('/',firebaseAuth,allowedTo('admin'), getAllPromos)

// ----------------------
// PUBLIC ROUTE
// ----------------------
router.post("/apply", firebaseAuth, applyPromocode);

module.exports = router;
