const router = require("express").Router();
const Restaurant = require("../models/Restaurant.model");
const cloudinary = require("../middlewares/cloudinary.js");

const isAuthenticated = require("../middlewares/auth.middlewares");

//! Acordarse para revisar los path del cloudinary
// POST '/api/restaurant/create' => crear nuevo restaurante
router.post(
  "/create",
  isAuthenticated,
  cloudinary.single("restaurant-img"),
  async (req, res, next) => {
    const { name, location, cuisinType, phoneNumber } = req.body;
    let userRole = req.payload.role;
    const restaurantCreate = {
      name,
      location,
      cuisinType,
      phoneNumber,
      photos: req.file?.path,
    };

    try {
      if (userRole === "owner" || userRole === "admin") {
        await Restaurant.create(restaurantCreate);
        res.status(201).json("Restaurant Create success");
      } else {
        res.status(401).json("validar usuario");
      }
    } catch (error) {
      next(error);
    }
  }
);
// GET '/restaurants' => get info from the restaurants
router.get("/", async (req, res, next) => {
  try {
    const response = await Restaurant.find().select("name");
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});
// GET '/restaurante/:restaurantID' => vista especifica de restaurante
router.get("/:restId", async (req, res, next) => {
  const { restId } = req.params;
  try {
    const response = await Restaurant.findById(restId);
    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
});

// DELETE '/restaurante/:restaurantID'=> delete especific de restaurante
router.delete("/:restId", isAuthenticated, async (req, res, next) => {
  const { restId } = req.params;
  let userRole = req.payload.role;
  try {
    if (userRole === "owner" || userRole === "admin") {
      await Restaurant.findByIdAndDelete(restId);
      res.status(200).json("Restaurante borrado");
    } else {
      res.status(401).json("Needs a validated user");
    }
  } catch (error) {
    next(error);
  }
});

// PATCH '/restaurante/:restaurantID' => edit especific de restaurante
router.patch(
  "/:restId/edit",
  isAuthenticated,
  cloudinary.single("restaurant-img"),
  async (req, res, next) => {
    let userRole = req.payload.role;
    const { restId } = req.params;
    const { name, location, cuisinType, phoneNumber } = req.body;
    const restUpdate = {
      name,
      location,
      cuisinType,
      phoneNumber,
      photos: req.file?.path,
    };
    try {
      if (userRole === "owner" || userRole === "admin") {
        await Restaurant.findByIdAndUpdate(restId, restUpdate);
        res.status(201).json("Restaurante actualizado");
      } else {
        res.status(401).json("Needs validated user");
      }
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
