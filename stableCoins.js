// Define the configuration object to set parameters
const config = {
  apy: 0.3, // 30% annual percentage yield
  initialDeposit: 1000000, // in USD
  slippage: 0.005, // for example: 0.005 -> 0.5% slippage
  swapFee: 0.003, // for example: 0.003 -> 0.3% swap fee
  gasPrice: 0.5, // fixed gas cost per compound in USD
  maxHours: 24, // maximum compounding interval to test in hours (up to 24 hours)
};

// Function to calculate optimal compounding frequency
function calculateOptimalCompounding(config) {
  const { apy, initialDeposit, slippage, swapFee, gasPrice, maxHours } = config;
  let optimalFrequency = 0;
  let maxCompoundedAPY = 0;

  // Loop over each possible compounding interval in hours
  for (
    let hoursBetweenCompounds = 1;
    hoursBetweenCompounds <= maxHours;
    hoursBetweenCompounds++
  ) {
    let deposit = initialDeposit; // Reset deposit for each interval test

    // Simulate 365 days (8760 hours)
    for (let hour = 1; hour <= 8760; hour++) {
      // Apply compounding based on the interval
      if (hour % hoursBetweenCompounds === 0) {
        const dailyYield = (apy / 8760) * deposit;
        const yield = dailyYield * hoursBetweenCompounds;

        const fees = (yield - gasPrice) * swapFee * slippage;
        deposit += yield - fees;
      }
    }

    // Calculate APY for the given compounding frequency
    const compoundingAPY = (deposit - initialDeposit) / initialDeposit;
    console.table({
      hoursBetweenCompounds,
      APY: `${(compoundingAPY * 100).toFixed(2)}%`,
    });

    // Update optimal frequency if this APY is the highest
    if (compoundingAPY > maxCompoundedAPY) {
      maxCompoundedAPY = compoundingAPY;
      optimalFrequency = hoursBetweenCompounds;
    }
  }

  return {
    optimalFrequency,
    maxCompoundedAPY,
  };
}

// Execute the function and log results
const result = calculateOptimalCompounding(config);
console.log(
  `Optimal Compounding Frequency: Every ${result.optimalFrequency} hours`
);
console.log(
  `Max Compounded APY: ${(result.maxCompoundedAPY * 100).toFixed(2)}%`
);
