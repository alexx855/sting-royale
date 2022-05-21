export const coordFromString = (str: string): [number, number] => {
  const [x, y] = str.split(',');
  return [+x, +y];
};
