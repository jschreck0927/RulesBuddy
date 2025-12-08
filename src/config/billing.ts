// INDIVIDUAL SUBSCRIPTION PRICES
export const individualPrices = {
  bronzeMonthly: process.env.NEXT_PUBLIC_STRIPE_BRONZE_MONTHLY_PRICE_ID || '',
  bronzeAnnual: process.env.NEXT_PUBLIC_STRIPE_BRONZE_ANNUAL_PRICE_ID || '',

  silverMonthly: process.env.NEXT_PUBLIC_STRIPE_SILVER_MONTHLY_PRICE_ID || '',
  silverAnnual: process.env.NEXT_PUBLIC_STRIPE_SILVER_ANNUAL_PRICE_ID || '',

  goldMonthly: process.env.NEXT_PUBLIC_STRIPE_GOLD_MONTHLY_PRICE_ID || '',
  goldAnnual: process.env.NEXT_PUBLIC_STRIPE_GOLD_ANNUAL_PRICE_ID || '',
};

// GROUP SEAT PRICES — must use this name because checkout imports groupSeatPrices
export const groupSeatPrices = {
  bronzeSeatAnnual:
    process.env.NEXT_PUBLIC_STRIPE_BRONZE_SEAT_ANNUAL_PRICE_ID || '',
  silverSeatAnnual:
    process.env.NEXT_PUBLIC_STRIPE_SILVER_SEAT_ANNUAL_PRICE_ID || '',
  goldSeatAnnual:
    process.env.NEXT_PUBLIC_STRIPE_GOLD_SEAT_ANNUAL_PRICE_ID || '',
};
