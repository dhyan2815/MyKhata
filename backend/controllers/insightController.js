// backend/controllers/insightController.js

import Transaction from '../models/transactionModel.js';
import moment from 'moment';

// Helper: Sum by category
const sumByCategory = (txns) => {
  return txns.reduce((acc, txn) => {
    acc[txn.category] = (acc[txn.category] || 0) + txn.amount;
    return acc;
  }, {});
};

// Insight 1: Category spending change
function categorySpendingChange(thisMonthSums, lastMonthSums) {
  const insights = [];
  for (const category in thisMonthSums) {
    const thisMonthTotal = thisMonthSums[category];
    const lastMonthTotal = lastMonthSums[category] || 0;
    if (lastMonthTotal === 0 && thisMonthTotal > 0) {
      insights.push(`You started spending on ${category} this month.`);
    } else if (lastMonthTotal > 0) {
      const percentChange = ((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100;
      if (Math.abs(percentChange) >= 10) {
        const moreOrLess = percentChange > 0 ? 'more' : 'less';
        insights.push(
          `You spent ${Math.abs(percentChange).toFixed(1)}% ${moreOrLess} on ${category} this month compared to last month.`
        );
      }
    }
  }
  return insights;
}

// Insight 2: Highest spending category
function highestSpendingCategory(thisMonthSums) {
  let highestCategory = null;
  let highestAmount = 0;
  for (const [category, amount] of Object.entries(thisMonthSums)) {
    if (amount > highestAmount) {
      highestAmount = amount;
      highestCategory = category;
    }
  }
  return highestCategory
    ? [`Your highest spending category this month is ${highestCategory}.`]
    : [];
}

// Insight 3: No spending this month but spent last month
function noSpendingThisMonth(lastMonthSums, thisMonthSums) {
  const insights = [];
  for (const category in lastMonthSums) {
    if (!thisMonthSums[category] && lastMonthSums[category] > 0) {
      insights.push(`You didn’t spend anything on ${category} this month.`);
    }
  }
  return insights;
}

// Insight 4: Savings insight
function savingsInsight(thisMonthTxns, lastMonthTxns) {
  const sumExpenses = (txns) => txns.filter(t => t.amount > 0 && (t.type === 'expense' || !t.type)).reduce((acc, t) => acc + t.amount, 0);
  const thisMonthExpenses = sumExpenses(thisMonthTxns);
  const lastMonthExpenses = sumExpenses(lastMonthTxns);
  if (lastMonthExpenses > 0) {
    const savingsChange = ((lastMonthExpenses - thisMonthExpenses) / lastMonthExpenses) * 100;
    if (savingsChange > 0) {
      return [`You saved ${savingsChange.toFixed(1)}% more this month compared to last month.`];
    } else if (savingsChange < 0) {
      return [`You spent ${Math.abs(savingsChange).toFixed(1)}% more this month compared to last month.`];
    }
  }
  return [];
}

// Insight 5: Recurring expenses
function recurringExpenses(thisMonthSums, lastMonthSums) {
  const insights = [];
  for (const category in thisMonthSums) {
    if (lastMonthSums[category] && thisMonthSums[category] > 0 && lastMonthSums[category] > 0) {
      insights.push(`You have recurring expenses in ${category}.`);
    }
  }
  return insights;
}

// Insight 6: Spending streaks
function spendingStreaks(threeMonthsTxns, now, endOfThisMonth) {
  const streaks = {};
  threeMonthsTxns.forEach(txn => {
    const month = moment(txn.date).format('YYYY-MM');
    if (!streaks[txn.category]) streaks[txn.category] = new Set();
    streaks[txn.category].add(month);
  });
  const insights = [];
  for (const [category, months] of Object.entries(streaks)) {
    if (months.size >= 3) {
      insights.push(`You’ve spent on ${category} for 3 consecutive months.`);
    }
  }
  return insights;
}

// @desc    Get spending insights for the logged-in user
// @route   GET /api/insights
// @access  Private
const getSpendingInsights = async (req, res) => {
  try {
    const userId = req.user._id;
    const now = moment();
    const startOfThisMonth = now.clone().startOf('month');
    const endOfThisMonth = now.clone().endOf('month');
    const startOfLastMonth = now.clone().subtract(1, 'month').startOf('month');
    const endOfLastMonth = now.clone().subtract(1, 'month').endOf('month');

    // Fetch transactions for this month
    const thisMonthTxns = await Transaction.find({
      user: userId,
      date: { $gte: startOfThisMonth.toDate(), $lte: endOfThisMonth.toDate() },
    });

    // Fetch transactions for last month
    const lastMonthTxns = await Transaction.find({
      user: userId,
      date: { $gte: startOfLastMonth.toDate(), $lte: endOfLastMonth.toDate() },
    });

    // Fetch transactions for the last 3 months
    const startOfThreeMonthsAgo = now.clone().subtract(2, 'month').startOf('month');
    const threeMonthsTxns = await Transaction.find({
      user: userId,
      date: { $gte: startOfThreeMonthsAgo.toDate(), $lte: endOfThisMonth.toDate() },
    });

    const thisMonthSums = sumByCategory(thisMonthTxns);
    const lastMonthSums = sumByCategory(lastMonthTxns);

    // Collect all insights
    let insights = [];
    insights = insights.concat(
      categorySpendingChange(thisMonthSums, lastMonthSums),
      highestSpendingCategory(thisMonthSums),
      noSpendingThisMonth(lastMonthSums, thisMonthSums),
      savingsInsight(thisMonthTxns, lastMonthTxns),
      recurringExpenses(thisMonthSums, lastMonthSums),
      spendingStreaks(threeMonthsTxns, now, endOfThisMonth)
    );

    // Remove duplicate insights
    const uniqueInsights = [...new Set(insights)];

    res.json({ insights: uniqueInsights });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to generate insights' });
  }
};

export { getSpendingInsights };