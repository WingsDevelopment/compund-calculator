const config = {
  apy: 0.1089, // 10% annual percentage yield
  initialDeposit: 1000000, // in USD
  slippage: 0.01, // for example: 0.5 -> 50% slippage
  swapFee: 0.00605, // for example: 0.3 ->  30% swap fee
  gasPrice: 0.5, // fixed gas cost per compound in USD
  rebalanceSlippage: 0.0005, // for example: 0.5 -> 50% slippage
  rebalanceSwapFee: 0.0001, // for example: 0.3 ->  30% swap fee
  rebalanceFrequency: 48, // for example: 48 -> 2 days
  disableRebalance: false,
  borrowApy: 0.027, // for example: 2.7 -> 0.027 % borrow APY
  timePeriod: 8760, // 365 days in hours
  levarage: 0.6666667, // for example: 0.6666667 -> 3x levarage, 2 / 3
};
const CONSOLE_FIRST_HOURS = 10;

let rebalancingCostSum = 0;
let rewardsCostSum = 0;
let borrowCostSum = 0;
let compoundingAmount = 0;

const amountOfDepositInEachHour = [];

console.log("Hour = hour of compounding");
console.log(
  "Yield = value in dollars after borrowing apy per for specific hour"
);
console.log("Depost = new deposit after compounding");
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
    rebalanceFrequency,
    levarage,
    rebalanceSlippage,
    rebalanceSwapFee,
    disableRebalance,
  } = config;
  compoundingAmount = initialDeposit;

  for (let hour = 1; hour <= timePeriod; hour++) {
    const yield = (apy / timePeriod) * compoundingAmount;

    const fees = gasPrice + yield * (swapFee + slippage);
    rewardsCostSum += fees;

    if (hour % rebalanceFrequency === 0 && !disableRebalance) {
      const rebalanceCost =
        compoundingAmount * 0.5 * (rebalanceSlippage + rebalanceSwapFee) +
        gasPrice;
      compoundingAmount -= rebalanceCost;
      rebalancingCostSum += rebalanceCost;
    }

    compoundingAmount += yield - fees;
    amountOfDepositInEachHour.push(compoundingAmount);
  }

  for (let hour = 1; hour <= timePeriod; hour++) {
    borrowCostSum +=
      (amountOfDepositInEachHour[hour - 1] * levarage * borrowApy) / timePeriod;
  }

  const compoundingAPY =
    (compoundingAmount - borrowCostSum - initialDeposit) /
    (initialDeposit * (1 - levarage));

  return { compoundingAPY };
}

// Execute the function and log results
const result = calculateOptimalCompounding(config);

console.log(`Max Compounded APY: ${(result.compoundingAPY * 100).toFixed(2)}%`);
console.log(`Rebalancing cost: ${rebalancingCostSum.toFixed(2)}`);
console.log(`Rewards cost: ${rewardsCostSum.toFixed(2)}`);
console.log(`Borrow cost: ${borrowCostSum.toFixed(2)}`);
console.log(`Compounding Amount: ${compoundingAmount.toFixed(2)}`);
