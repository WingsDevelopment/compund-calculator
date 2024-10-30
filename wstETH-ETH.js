const config = {
  apy: 0.1, // 10% annual percentage yield
  initialDeposit: 1000000, // in USD
  slippage: 0.001007, // for example: 0.5 -> 50% slippage
  swapFee: 0.001, // for example: 0.3 ->  30% swap fee
  gasPrice: 0.5, // fixed gas cost per compound in USD
  compundFrequency: 48,
  borrowApy: 0.027, // for example: 2.7 -> 0.027 % borrow APY
  timePeriod: 8760, // 365 days in hours
  levarage: 0.6666667, // for example: 0.6666667 -> 3x levarage, 2 / 3
};

// Function to calculate optimal compounding frequency
function calculateOptimalCompounding(config) {
  const {
    apy,
    initialDeposit,
    slippage,
    swapFee,
    gasPrice,
    timePeriod,
    borrowApy,
    compundFrequency,
    levarage,
  } = config;

  let deposit = initialDeposit;

  for (let hour = 1; hour <= timePeriod; hour++) {
    // Apply compounding based on the interval
    // (1+(r-((2/3)*b1)/k))^k)
    const yield =
      (apy / timePeriod - (levarage * borrowApy) / timePeriod) * deposit;

    const fees = (yield - gasPrice) * swapFee * slippage;
    if (hour % compundFrequency) {
      const compoundingCost = deposit * 0.5 * swapFee * slippage + gasPrice;
      deposit -= compoundingCost;
    }

    deposit += yield - fees;

    if (hour < 10) {
      console.table({
        hour,
        yield,
        deposit,
      });
    }
  }
  const compoundingAPY = (deposit - initialDeposit) / initialDeposit;

  return { compoundingAPY };
}

// Execute the function and log results
const result = calculateOptimalCompounding(config);

console.log(`Max Compounded APY: ${(result.compoundingAPY * 100).toFixed(2)}%`);
