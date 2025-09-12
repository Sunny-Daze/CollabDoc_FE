import { colors } from "../constants";

export const getRandomColor = (seed?: string) => {
  if (!seed) {
    const randomIndex = Math.floor(Math.random() * colors.length);
    return colors[randomIndex];
  }

  const index = seed.charCodeAt(0) % colors.length;
  return colors[index];
};
