import Activity from "../model/activity.model.js";
import OutfitGarment from "../model/outfit-garment.model.js";
import OutfitWeather from "../model/outfit-weather.model.js";
import Outfit from "../model/outfit.model.js";
import UserLocation from "../model/user-location.model.js";
import Weather from "../model/weather.model.js";

const STATS_MOCK = [
  {
    waypointsData: [
      {
        index: 0,
        coordinates: [44.7066578, 39.9110155].reverse(),
        activity: 212.10000000000002,
        addToFavorites: false,
        naming: "",
        forecast: { temp: 20.01, windSpeed: 2.02 },
      },
      {
        index: 1,
        coordinates: [44.627049836437976, 40.24056379924097].reverse(),
        activity: 300.29999999999995,
        addToFavorites: false,
        naming: "",
        forecast: { temp: 19.83, windSpeed: 3.05 },
      },
    ],
    timestamp: "2022-04-24T09:00:00.000Z",
    outfit: [
      { id: 16, clo: 0.08, layer: 1, bodyPartId: 3 },
      { id: 11, clo: 0.03, layer: 1, bodyPartId: 5 },
      { id: 10, clo: 0.03, layer: 3, bodyPartId: 5 },
      { id: 4, clo: 0.08, layer: 1, bodyPartId: 2 },
      { id: 6, clo: 0.03, layer: 1, bodyPartId: 1 },
    ],
    user: { id: 2 },
  },
  {
    waypointsData: [
      {
        index: 0,
        coordinates: [44.38256112030892, 40.58656594438132].reverse(),
        activity: 168,
        addToFavorites: false,
        naming: "",
        forecast: { temp: 19.84, windSpeed: 3.15 },
      },
      {
        index: 1,
        coordinates: [44.42105618409423, 40.21530137808588].reverse(),
        activity: 168,
        addToFavorites: false,
        naming: "",
        forecast: { temp: 21.55, windSpeed: 3.11 },
      },
    ],
    timestamp: "2022-04-24T09:00:00.000Z",
    outfit: [
      { id: 14, clo: 0.25, layer: 2, bodyPartId: 2 },
      { id: 2, clo: 0.24, layer: 2, bodyPartId: 3 },
      { id: 11, clo: 0.03, layer: 1, bodyPartId: 5 },
      { id: 9, clo: 0.1, layer: 3, bodyPartId: 5 },
    ],
    user: { id: 3 },
  },
  {
    waypointsData: [
      {
        index: 0,
        coordinates: [44.83300057343181, 41.031072696589526].reverse(),
        activity: 168,
        addToFavorites: false,
        naming: "",
        forecast: { temp: 20.97, windSpeed: 1.66 },
      },
      {
        index: 1,
        coordinates: [44.129918488780554, 40.59114624405154].reverse(),
        activity: 168,
        addToFavorites: false,
        naming: "",
        forecast: { temp: 22.68, windSpeed: 2.77 },
      },
    ],
    timestamp: "2022-04-24T09:00:00.000Z",
    outfit: [
      { id: 1, clo: 0.48, layer: 3, bodyPartId: 2 },
      { id: 3, clo: 0.06, layer: 2, bodyPartId: 5 },
      { id: 9, clo: 0.1, layer: 3, bodyPartId: 5 },
      { id: 7, clo: 0.2, layer: 1, bodyPartId: 6 },
      { id: 2, clo: 0.24, layer: 2, bodyPartId: 3 },
    ],
    user: { id: 4 },
  },
  {
    waypointsData: [
      {
        index: 0,
        coordinates: [44.53087654999343, 41.08720425123787].reverse(),
        activity: 168,
        addToFavorites: false,
        naming: "",
        forecast: { temp: 21.32, windSpeed: 1.79 },
      },
      {
        index: 1,
        coordinates: [44.467748078619756, 40.21319576613295].reverse(),
        activity: 168,
        addToFavorites: false,
        naming: "",
        forecast: { temp: 19.43, windSpeed: 3.14 },
      },
    ],
    timestamp: "2022-04-24T09:00:00.000Z",
    outfit: [
      { id: 11, clo: 0.03, layer: 1, bodyPartId: 5 },
      { id: 15, clo: 0.34, layer: 2, bodyPartId: 2 },
      { id: 2, clo: 0.24, layer: 2, bodyPartId: 3 },
    ],
    user: { id: 5 },
  },
];

export const createStatsMockData = () => {
  return Promise.all(
    STATS_MOCK.map(
      async ({
        user: { id: userId },
        waypointsData,
        timestamp,
        outfit: selectedOutfit,
      }) => {
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
            selectedOutfit.map(({ id }) => ({
              garmentId: id,
              outfitId: outfit.id,
            }))
          ),
          Activity.bulkCreate(
            waypointsData.map(({ activity }, index) => ({
              timestamp,
              intensivity: activity,
              userLocationId: userLocations[index].id,
            }))
          ),
        ]);
      }
    )
  );
};
