/**
 * Pricing Service for Roadside Assistance
 * Handles server-side price estimation and final invoice calculation
 */

const calculateEstimate = ({ basePrice, perKmRate = 0, distanceKm = 0 }) => {
  const base = Math.max(0, Number(basePrice) || 0);
  const kmRate = Math.max(0, Number(perKmRate) || 0);
  const distance = Math.max(0, Number(distanceKm) || 0);

  const distanceCharge = Math.round(kmRate * distance);
  const estimatedSubtotal = base + distanceCharge;
  const estimatedTax = Math.round(estimatedSubtotal * 0.05); // 5% GST
  const estimatedTotal = estimatedSubtotal + estimatedTax;

  return {
    base,
    distanceRate: kmRate,
    estimatedDistanceKm: distance,
    estimatedSubtotal,
    estimatedTax,
    estimatedTotal,
    currency: 'INR',
  };
};

const calculateFinalPrice = ({
  basePrice,
  distanceRate = 0,
  distanceKm = 0,
  additionalCharges = [],
}) => {
  const base = Math.max(0, Number(basePrice) || 0);
  const kmRate = Math.max(0, Number(distanceRate) || 0);
  const distance = Math.max(0, Number(distanceKm) || 0);

  const distanceCharge = Math.round(kmRate * distance);

  const validatedAdditionalCharges = Array.isArray(additionalCharges)
    ? additionalCharges
        .filter((item) => item && typeof item.description === 'string' && Number(item.amount) > 0)
        .map((item) => ({
          description: item.description.trim(),
          amount: Math.round(Number(item.amount)),
        }))
    : [];

  const additionalTotal = validatedAdditionalCharges.reduce((sum, item) => sum + item.amount, 0);

  const subtotal = base + distanceCharge + additionalTotal;
  const taxes = Math.round(subtotal * 0.05); // 5% Tax
  const total = subtotal + taxes;

  return {
    base,
    distanceRate: kmRate,
    distanceCharge,
    additionalCharges: validatedAdditionalCharges,
    subtotal,
    taxes,
    total,
    currency: 'INR',
  };
};

module.exports = {
  calculateEstimate,
  calculateFinalPrice,
};
