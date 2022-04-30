import { Op } from "sequelize";
import Error from "../entities/error.js";
import Weather from "../model/weather.model.js";
import Activity from "../model/activity.model.js";
import Outfit from "../model/outfit.model.js";
import OutfitWeather from "../model/outfit-weather.model.js";
import OutfitGarment from "../model/outfit-garment.model.js";
import UserLocation from "../model/user-location.model.js";
import { getOutfitClo } from "../utils/get-outfit-clo.js";
import { getOutfitRecomendations } from "./shared.controller.js";

const FROECAST_INACCURACY = 0.1;

export const assessOutfit = async (req, res, next) => {
  const {
    user: { id: userId, sex: userSex },
    waypointsData,
    timestamp,
    outfit: selectedOutfit,
  } = req.body;

  const [weathers, userLocations, outfit] = await Promise.all([
    Weather.bulkCreate(
      waypointsData.map(({ forecast, coordinates }) => ({
        timestamp,
        latitude: coordinates[0],
        longitude: coordinates[1],
        windSpeed: forecast.windSpeed,
        airTemperature: forecast.temp,
      }))
    ),
    UserLocation.bulkCreate(
      waypointsData.map(({ coordinates, addToFavorites, naming }) => ({
        naming: addToFavorites ? naming : null,
        latitude: coordinates[0],
        longitude: coordinates[1],
      }))
    ),
    Outfit.create({ userId }),
  ]);

  await Promise.all([
    OutfitWeather.bulkCreate(
      weathers.map(({ id }) => ({ weatherId: id, outfitId: outfit.id }))
    ),
    OutfitGarment.bulkCreate(
      selectedOutfit.map(({ id }) => ({ garmentId: id, outfitId: outfit.id }))
    ),
    Activity.bulkCreate(
      waypointsData.map(({ activity }, index) => ({
        timestamp,
        intensivity: activity,
        userLocationId: userLocations[index].id,
      }))
    ),
  ]);

  // estimate
  const estimations = waypointsData.map(
    ({ activity, forecast: { temp, windSpeed } }) => {
      const totalClo = getOutfitClo(selectedOutfit, windSpeed, activity);

      const neededClo =
        temp >= 25.5
          ? 0.6 - 0.18 * (temp - 25.5)
          : temp <= 22.2
          ? 0.6 + 0.18 * (22.2 - temp)
          : 0.6;

      return totalClo / neededClo;
    }
  );

  const satisfactory_clo_bounds = [
    1 - FROECAST_INACCURACY,
    1 + FROECAST_INACCURACY,
  ];
  const meanEstimation =
    estimations.reduce((sum, estimation) => sum + estimation, 0) /
    estimations.length;
  let recomendations;

  if (
    meanEstimation < satisfactory_clo_bounds[0] ||
    meanEstimation > satisfactory_clo_bounds[1]
  ) {
    const meanActivity =
      waypointsData.reduce((sum, { activity }) => sum + activity, 0) /
      waypointsData.length;
    const meanTemp =
      waypointsData.reduce((sum, { forecast: { temp } }) => sum + temp, 0) /
      waypointsData.length;
    const meanWindSpeed =
      waypointsData.reduce(
        (sum, { forecast: { windSpeed } }) => sum + windSpeed,
        0
      ) / waypointsData.length;

    const { fittingOutfits } = await getOutfitRecomendations({
      userSex,
      temp: meanTemp,
      activity: meanActivity,
      windSpeed: meanWindSpeed,
    });
    recomendations = fittingOutfits.slice(0, 5);
  }

  return res.status(201).json({
    message: "All created",
    estimations,
    meanEstimation,
    recomendations,
  });
};
