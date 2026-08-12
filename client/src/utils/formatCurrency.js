/**
 * Utility to format numerical amounts into Indian Rupee (INR) currency format.
 * Examples:
 *  50000 -> ₹50,000
 *  125000 -> ₹1,25,000
 *  1250000 -> ₹12,50,000
 *
 * @param {number|string} amount
 * @returns {string} Formatted INR currency string
 */
export const formatCurrency = (amount) => {
  const num = Number(amount);
  if (isNaN(num) || amount === null || amount === undefined) {
    return '₹0';
  }

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(num);
};

/**
 * Utility to format large numerical amounts into compact Indian Rupee (INR) format.
 * Examples:
 *  5454565700000 -> ₹5,45,456.57 Cr
 *  12500000       -> ₹1.25 Cr
 *  500000         -> ₹5.00 L
 *  -1234567       -> -₹12.35 L
 *
 * @param {number|string} amount
 * @returns {string} Compact formatted INR currency string
 */
export const formatCompactCurrency = (amount) => {
  const num = Number(amount);
  if (isNaN(num) || amount === null || amount === undefined) {
    return '₹0';
  }

  const absNum = Math.abs(num);
  const sign = num < 0 ? '-' : '';

  if (absNum >= 10000000) { // >= 1 Crore
    const inCr = absNum / 10000000;
    // For very large crore values, show with commas but limited decimals
    const formatted = inCr.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return `${sign}₹${formatted} Cr`;
  }

  if (absNum >= 100000) { // >= 1 Lakh
    const inLakh = absNum / 100000;
    return `${sign}₹${inLakh.toFixed(2)} L`;
  }

  return formatCurrency(amount);
};

export default formatCurrency;
