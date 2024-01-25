// Generate a random 5-digit integer
function generateRandomInteger() {
  // Generate a random number between 0 and 1
  const randomFraction = Math.random();

  // Scale the random number to the range [10000, 99999] (5-digit integer range)
  const randomInteger = Math.floor(randomFraction * 90000) + 10000;

  return randomInteger;
}

export default generateRandomInteger;
