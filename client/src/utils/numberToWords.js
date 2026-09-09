/**
 * Converts a numeric amount to Indian English words format for professional invoices.
 * e.g., 4250 -> "Rupees Four Thousand Two Hundred and Fifty Only"
 */
export function numberToWords(amount) {
  if (!amount || isNaN(amount) || amount <= 0) {
    return 'Rupees Zero Only';
  }

  const singleDigits = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
    'Seventeen', 'Eighteen', 'Nineteen',
  ];

  const tensDigits = [
    '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety',
  ];

  function convertBelowThousand(n) {
    let str = '';
    if (n >= 100) {
      str += singleDigits[Math.floor(n / 100)] + ' Hundred ';
      n %= 100;
      if (n > 0) str += 'and ';
    }
    if (n >= 20) {
      str += tensDigits[Math.floor(n / 10)];
      if (n % 10 > 0) str += ' ' + singleDigits[n % 10];
    } else if (n > 0) {
      str += singleDigits[n];
    }
    return str.trim();
  }

  const num = Math.floor(amount);
  let words = '';

  const crore = Math.floor(num / 10000000);
  let remainder = num % 10000000;

  const lakh = Math.floor(remainder / 100000);
  remainder %= 100000;

  const thousand = Math.floor(remainder / 1000);
  remainder %= 1000;

  const hundred = remainder;

  if (crore > 0) {
    words += convertBelowThousand(crore) + ' Crore ';
  }
  if (lakh > 0) {
    words += convertBelowThousand(lakh) + ' Lakh ';
  }
  if (thousand > 0) {
    words += convertBelowThousand(thousand) + ' Thousand ';
  }
  if (hundred > 0) {
    words += convertBelowThousand(hundred) + ' ';
  }

  words = words.trim();
  return words ? `Rupees ${words} Only` : 'Rupees Zero Only';
}
