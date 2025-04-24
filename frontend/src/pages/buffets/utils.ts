// Utility for generating pickup codes
export const generatePickupCode = (): string => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const letter1 = letters.charAt(Math.floor(Math.random() * letters.length));
    const letter2 = letters.charAt(Math.floor(Math.random() * letters.length));
    const number = Math.floor(Math.random() * 10);
    return `${letter1}${letter2}${number}`;
};
