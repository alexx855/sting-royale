export const trimAddress = (address: string): string => {
  return '0x...' + address.substring(address.length - 3, address.length);
};
