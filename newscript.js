const configs = require("./data.js");

const CONSOLE_FIRST_HOURS = 10;

function calculateOptimalCompounding(config) {
  const {
    apy,
    initialDeposit,
    slippage,
    swapFee,
    gasPrice,
    timePeriod,
    assetOneBorrowApy,
    assetTwoBorrowApy,
    rebalanceFrequency,
    leverage,
    rebalanceSlippage,
    rebalanceSwapFee,
    disableRebalance,
  } = config;

  let compoundingAmount = initialDeposit;
  let rebalancingCostSum = 0;
  let rewardsCostSum = 0;
  let borrowCostSum = 0;
  const amountOfDepositInEachHour = [];

  for (let hour = 1; hour <= timePeriod; hour++) {
    const yieldAmount = (apy / timePeriod) * compoundingAmount;
    const fees = gasPrice + yieldAmount * (swapFee + slippage);
    rewardsCostSum += fees;

    if (hour % rebalanceFrequency === 0 && !disableRebalance) {
      const rebalanceCost =
        compoundingAmount * 0.5 * (rebalanceSlippage + rebalanceSwapFee) +
        gasPrice;
      compoundingAmount -= rebalanceCost;
      rebalancingCostSum += rebalanceCost;
    }

    compoundingAmount += yieldAmount - fees;
    amountOfDepositInEachHour.push(compoundingAmount);
  }

  for (let hour = 1; hour <= timePeriod; hour++) {
    borrowCostSum +=
      (amountOfDepositInEachHour[hour - 1] *
        leverage *
        (assetOneBorrowApy * 0.5)) /
      timePeriod;

    borrowCostSum +=
      (amountOfDepositInEachHour[hour - 1] *
        leverage *
        (assetTwoBorrowApy * 0.5)) /
      timePeriod;
  }

  const compoundingAPY =
    (compoundingAmount - borrowCostSum - initialDeposit) /
    (initialDeposit * (1 - leverage));

  return {
    compoundingAPY,
    rebalancingCostSum,
    rewardsCostSum,
    borrowCostSum,
    compoundingAmount,
  };
}

configs.forEach((config) => {
  const result = calculateOptimalCompounding(config);

  console.log(`LP Name: ${config.lpName}`);
  console.log(
    `Max Compounded APY: ${(result.compoundingAPY * 100).toFixed(2)}%`
  );
  console.log(`Rebalancing cost: ${result.rebalancingCostSum.toFixed(2)}`);
  console.log(`Rewards cost: ${result.rewardsCostSum.toFixed(2)}`);
  console.log(`Borrow cost: ${result.borrowCostSum.toFixed(2)}`);
  console.log(`Compounding Amount: ${result.compoundingAmount.toFixed(2)}`);
  console.log("---------------------------------------------");
});
