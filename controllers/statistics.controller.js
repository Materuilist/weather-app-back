import { Op } from "sequelize";
import Error from "../entities/error.js";
import Weather from "../model/weather.model.js";
import Activity from "../model/activity.model.js";
import Outfit from "../model/outfit.model.js";
import OutfitWeather from "../model/outfit-weather.model.js";
import OutfitGarment from "../model/outfit-garment.model.js";
import UserLocation from "../model/user-location.model.js";
import Garment from "../model/garment.model.js";

const STATISTICS_RADIUS_KM = 50;
const LATITUDES_IN_KILOMETER = 1 / 111;
const LONGITUDES_IN_KILOMETER = 1 / 95;

export const getToday = async (req, res, next) => {
  const {
    user: { id: userId },
    timestamp,
    radius = STATISTICS_RADIUS_KM,
    coordinates: [latitude, longitude],
  } = req.body;

  const latitudeRange = [
    latitude - LATITUDES_IN_KILOMETER * radius,
    latitude + LATITUDES_IN_KILOMETER * radius,
  ];
  const longitudeRange = [
    longitude - LONGITUDES_IN_KILOMETER * radius,
    longitude + LONGITUDES_IN_KILOMETER * radius,
  ];

  const outfitsIds = await Weather.findAll({
    where: {
      [Op.and]: [
        { latitude: { [Op.between]: latitudeRange } },
        { longitude: { [Op.between]: longitudeRange } },
      ],
    },
    include: "userOutfits",
  }).then((weathers) =>
    weathers.map(({ userOutfits }) => userOutfits.map(({ id }) => id)).flat()
  );

  const outfitsGarmentsIds = await OutfitGarment.findAll({
    where: { outfitId: { [Op.in]: outfitsIds } },
  }).then((outfitsGarments) =>
    outfitsGarments.map(({ outfitId, garmentId }) => ({ outfitId, garmentId }))
  );

  const garments = await Garment.findAll({
    where: {
      id: {
        [Op.in]: outfitsGarmentsIds.map(({ garmentId }) => garmentId),
      },
    },
  });

  const outfits = outfitsGarmentsIds.reduce(
    (res, { outfitId, garmentId }) => ({
      ...res,
      [outfitId]: [
        ...(res[outfitId] || []),
        garments.find(({ id }) => id === garmentId),
      ],
    }),
    {}
  );

  const garmentsPoints = garments.reduce(
    (res, { id }) => ({
      ...res,
      [id]: outfitsGarmentsIds.filter(({ garmentId }) => garmentId === id)
        .length,
    }),
    {}
  );

  const outfitsPoints = Object.entries(outfits).reduce(
    (res, [outfitId, garments]) => ({
      ...res,
      [outfitId]: garments.reduce((sum, { id }) => sum + garmentsPoints[id], 0),
    }),
    {}
  );

  const mostPopularOutfitId = Object.entries(outfitsPoints).reduce(
    (maxId, [outfitId, points]) =>
      !maxId || outfitsPoints[maxId] < points ? outfitId : maxId,
    null
  );
  const mostPopularOutfit = outfits[mostPopularOutfitId];

  return res.status(200).json({ outfits, mostPopularOutfit });
};
