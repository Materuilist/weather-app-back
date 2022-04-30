import { Op } from "sequelize";
import { BODY_PARTS, GARMENT_SEX } from "../constants.js";
import Error from "../entities/error.js";
import Garment from "../model/garment.model.js";
import Role from "../model/role.model.js";
import User from "../model/user.model.js";
import TokenProcessor from "../services/token-processor.js";
import { getOutfitClo } from "../utils/get-outfit-clo.js";

const RECOMENDATIONS_STATISTICS_COUNT = 30;

export const parseUser = async (req, res, next) => {
  if (!req.headers.authorization) {
    return next(new Error(401, "Ошибка при получении пользователя!"));
  }
  const token = req.headers.authorization.split(" ")[1];
  const login = await TokenProcessor.decodeToken(token);

  if (!login) {
    return next(new Error(401, "Ошибка при получении пользователя!"));
  }

  const user = await User.findOne({ where: { login }, include: "role" });

  if (!user) {
    return next(new Error(401, "Ошибка при получении пользователя!"));
  }

  req.body.user = user;
  next();
};

export const getOutfitRecomendations = async ({
  userSex,
  temp,
  windSpeed,
  activity,
}) => {
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
    temp >= 25.5
      ? 0.6 - 0.18 * (temp - 25.5)
      : temp <= 22.2
      ? 0.6 + 0.18 * (22.2 - temp)
      : 0.6;

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

  const BODY_PARTS_POINTS = {
    [BODY_PARTS.LEG]: 5,
    [BODY_PARTS.BODY]: 2,
    [BODY_PARTS.FOOT]: 1,
  };
  const estimateOutfitCompletion = (outfit) =>
    Object.entries(BODY_PARTS_POINTS).reduce(
      (points, [bodyPartId, point]) =>
        outfit.some((garment) => garment.bodyPartId === +bodyPartId)
          ? points + point
          : points,
      0
    );

  const fittingOutfits = allPossibleOutfits
    .sort((outfitA, outfitB) => {
      const outfitAClo = getOutfitClo(outfitA, windSpeed, activity);
      const outfitBClo = getOutfitClo(outfitB, windSpeed, activity);

      return (
        Math.abs(outfitAClo - neededClo) - Math.abs(outfitBClo - neededClo)
      );
    })
    .slice(0, RECOMENDATIONS_STATISTICS_COUNT)
    .sort(
      (outfitA, outfitB) =>
        estimateOutfitCompletion(outfitB) - estimateOutfitCompletion(outfitA)
    );

  const recommendedOutfit = fittingOutfits[0];

  return {
    fittingOutfits,
    recommendedOutfit,
    neededClo,
    outfitClo: getOutfitClo(recommendedOutfit, windSpeed, activity),
  };
};
