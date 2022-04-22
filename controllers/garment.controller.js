import { Op } from "sequelize";
import Error from "../entities/error.js";
import Garment from "../model/garment.model.js";
import Wardrobe from "../model/wardrobe.model.js";

export const getGarments = async (req, res, next) => {
  const {
    user: { id: userId },
  } = req.body;

  const garments = await Garment.findAll({ include: "owners" });
  const garmentsMapped = garments.map((garment) => ({
    ...garment.toJSON(),
    isOwned: garment.owners.some(({ id }) => userId === +id),
  }));

  return res.status(200).json(garmentsMapped);
};

export const addGarment = async (req, res, next) => {
  const { naming, imageData, clo, layer, sex, saveData, bodyPartId } = req.body;

  const newGarment = await Garment.create({
    naming,
    imageData,
    saveData,
    clo,
    layer,
    sex,
    bodyPartId,
  });

  return res.status(201).json({
    message: "Garment created successfully",
    id: newGarment.id,
  });
};

export const addToWardrobe = async (req, res, next) => {
  const {
    user: { id: userId },
    garmentId,
  } = req.body;

  await Wardrobe.create({ userId, garmentId });

  return res.status(201).json({
    message: "Garment added to wardrobe successfully",
  });
};

export const removeFromWardrobe = async (req, res, next) => {
  const {
    user: { id: userId },
    garmentId,
  } = req.body;

  await Wardrobe.destroy({
    where: {
      [Op.and]: {
        userId,
        garmentId,
      },
    },
  });

  return res.status(200).json({
    message: "Garment removed from the wardrobe successfully",
  });
};
