import { Op } from "sequelize";
import Error from "../entities/error.js";
import Weather from "../model/weather.model.js";
import Activity from "../model/activity.model.js";
import Outfit from "../model/outfit.model.js";
import OutfitWeather from "../model/outfit-weather.model.js";
import OutfitGarment from "../model/outfit-garment.model.js";
import UserLocation from "../model/user-location.model.js";

export const assessOutfit = async (req, res, next) => {
  const {
    user: { id: userId, sex },
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
      const effectiveWindSpeed = windSpeed + 0.004 * (activity - 105);
      const layersClos = selectedOutfit.reduce((res, { clo, layer }) => {
        const effectiveClo = clo * effectiveWindSpeed;

        return { ...res, [layer]: (res.layer || 0) + effectiveClo };
      }, {});
      const totalClo = Object.values(layersClos).reduce(
        (sum, layerCloSum) => sum + layerCloSum * 0.8,
        0
      );

      const neededClo =
        temp >= 25.5 ? 0.6 - 0.18 * (temp - 25.5) : 0.6 + 0.18 * (22.2 - temp);

      return totalClo / neededClo;
    }
  );

  return res.status(201).json({ message: "All created", estimations });
};
