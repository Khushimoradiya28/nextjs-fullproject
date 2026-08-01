/**
 * Predefined avatar color palette
 */
const AVATAR_COLORS = [
  '#e74c3c',
  '#e67e22',
  '#f39c12',
  '#27ae60',
  '#16a085',
  '#2980b9',
  '#8e44ad',
  '#d35400',
  '#c0392b',
  '#1abc9c',
  '#2ecc71',
  '#3498db',
  '#9b59b6',
  '#e91e63',
  '#ff5722',
  '#607d8b',
  '#795548',
  '#009688',
  '#673ab7',
];

/**
 * Get a random avatar color from the palette
 */
const getRandomAvatarColor = () => {
  const index = Math.floor(Math.random() * AVATAR_COLORS.length);
  return AVATAR_COLORS[index];
};

module.exports = {
  AVATAR_COLORS,
  getRandomAvatarColor,
};
