import { Op } from "sequelize";
import Error from "../entities/error.js";
import Weather from "../model/weather.model.js";
import Activity from "../model/activity.model.js";
import Outfit from "../model/outfit.model.js";
import OutfitWeather from "../model/outfit-weather.model.js";
import OutfitGarment from "../model/outfit-garment.model.js";
import UserLocation from "../model/user-location.model.js";
import Garment from "../model/garment.model.js";
import { BODY_PARTS, GARMENT_SEX } from "../constants.js";
import { getOutfitClo } from "../utils/get-outfit-clo.js";

const STATISTICS_RADIUS_KM = 50;
const LATITUDES_IN_KILOMETER = 1 / 111;
const LONGITUDES_IN_KILOMETER = 1 / 95;
const TEMPERATURE_DIFF = 1;
const WIND_SPEED_DIFF = 0.5;

const SATISFACTORY_CLO_DIFF_SHARE = 0.1;
const RECOMENDATIONS_STATISTICS_COUNT = 30;

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

export const getAllTime = async (req, res, next) => {
  const {
    user: { id: userId },
    temp,
    windSpeed,
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
  const tempRange = [temp - TEMPERATURE_DIFF, temp + TEMPERATURE_DIFF];
  const windSpeedRange = [
    windSpeed - WIND_SPEED_DIFF,
    windSpeed + WIND_SPEED_DIFF,
  ];

  const outfitsIds = await Weather.findAll({
    where: {
      [Op.and]: [
        { latitude: { [Op.between]: latitudeRange } },
        { longitude: { [Op.between]: longitudeRange } },
        {
          airTemperature: {
            [Op.between]: tempRange,
          },
        },
        { windSpeed: { [Op.between]: windSpeedRange } },
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

export const getRecomendation = async (req, res, next) => {
  const {
    user: { id: userId, sex: userSex },
    temp,
    windSpeed,
    activity,
    coordinates: [latitude, longitude],
  } = req.body;

  const excludedLayers = temp >= 10 ? [3] : [];

  const allGarments = await Garment.findAll({
    where: {
      sex: {
        [Op.in]: userSex
          ? [GARMENT_SEX.MALE, GARMENT_SEX.UNISEX]
          : [GARMENT_SEX.FEMALE, GARMENT_SEX.UNISEX],
      },
    },
  });
  const garmentsByBodyPartAndLayers = allGarments.reduce((res, garment) => {
    if (excludedLayers.includes(garment.layer)) {
      return res;
    }

    return {
      ...res,
      [garment.bodyPartId]: {
        ...res[garment.bodyPartId],
        [garment.layer]: [
          ...((res[garment.bodyPartId] && res[garment.bodyPartId].layer) || []),
          garment,
        ],
      },
    };
  }, {});

  const neededClo =
    temp >= 25.5 ? 0.6 - 0.18 * (temp - 25.5) : 0.6 + 0.18 * (22.2 - temp);

  const bodyPartsCombinations = Object.entries(
    garmentsByBodyPartAndLayers
  ).reduce((res, [bodyPartId, layers]) => {
    return {
      ...res,
      [bodyPartId]: [
        ...Object.entries(layers)
          .map(([layer, garments]) => {
            const biggerLayers = Object.entries(layers).filter(
              ([otherLayer]) => otherLayer > layer
            );

            return garments
              .map((garment) => [
                [garment],
                ...biggerLayers.map(([, topGarments]) => [
                  garment,
                  ...topGarments.map((topGarment) => topGarment),
                ]),
              ])
              .flat();
          })
          .flat(),
        ...([BODY_PARTS.BODY, BODY_PARTS.LEG].includes(bodyPartId) ? [] : [[]]),
      ],
    };
  }, {});

  const getGarmentsCombinations = (bodyPartsCombinations) => {
    if (bodyPartsCombinations.length > 2) {
      return getGarmentsCombinations([
        bodyPartsCombinations[0],
        getGarmentsCombinations(bodyPartsCombinations.slice(1)),
      ]);
    }

    return bodyPartsCombinations[0]
      .map((outfit) => {
        return bodyPartsCombinations[1].map((otherOutfit) => [
          ...outfit,
          ...otherOutfit,
        ]);
      })
      .flat();
  };

  const allPossibleOutfits = getGarmentsCombinations(
    Object.values(bodyPartsCombinations)
  );

  const fittingOutfits = allPossibleOutfits
    .sort((outfitA, outfitB) => {
      const outfitAClo = getOutfitClo(outfitA, windSpeed, activity);
      const outfitBClo = getOutfitClo(outfitB, windSpeed, activity);

      return (
        Math.abs(outfitAClo - neededClo) - Math.abs(outfitBClo - neededClo)
      );
    })
    .slice(0, RECOMENDATIONS_STATISTICS_COUNT);

  const recommendedOutfit =
    fittingOutfits
      .filter((outfit) =>
        [BODY_PARTS.BODY, BODY_PARTS.LEG, BODY_PARTS.FOOT].every((bodyPartId) =>
          outfit.some((garment) => garment.bodyPartId === bodyPartId)
        )
      )
      .reduce((completeOutfit, outfit) =>
        completeOutfit.length > outfit.length ? completeOutfit : outfit
      ) ||
    fittingOutfits.reduce((completeOutfit, outfit) =>
      completeOutfit.length > outfit.length ? completeOutfit : outfit
    );

  return res.status(200).json({
    fittingOutfits,
    recommendedOutfit,
    neededClo,
    outfitClo: getOutfitClo(recommendedOutfit, windSpeed, activity),
  });
};
