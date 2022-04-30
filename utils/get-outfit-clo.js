export const getOutfitClo = (outfit, windSpeed, activity) => {
  const effectiveWindSpeed = windSpeed + 0.004 * (activity - 105);

  return outfit.reduce((cloSum, { clo, layer, bodyPartId }) => {
    const effectiveClo = clo * effectiveWindSpeed - 0.25;
    const isIntrinsicLayer =
      outfit.reduce(
        (lowestLayer, garment) =>
          garment.bodyPartId === bodyPartId && garment.layer < lowestLayer
            ? garment.layer
            : lowestLayer,
        3
      ) === layer;

    return cloSum + effectiveClo * (isIntrinsicLayer ? 1 : 0.8);
  }, 0);
};
