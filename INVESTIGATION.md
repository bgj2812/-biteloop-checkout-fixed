# Biteloop checkout investigation

## Reconciliation (delivered orders only)
- Delivered orders: 145
- Correct total: 7,067,420 paise (₹70,674.20)
- Amount actually charged: 6,497,210 paise (₹64,972.10)
- Overcharged: 0 paise (₹0.00)
- Undercharged: 570,210 paise (₹5,702.10)
- Delivered orders charged incorrectly: 39

Cancelled orders (11) are excluded because PRICING.md says they are refunded in full.

## Bugs fixed
1. `src/pricing.js`, `couponIsValid`: compared the UTC date substring to the coupon expiry date. Rules require the India calendar date. Use `istDate(order.placed_at)`.
2. `src/pricing.js`, `discountOf`: percentage discounts were not capped at `max_discount_paise`.
3. `src/pricing.js`, `gstOf`: GST was rounded down instead of to the nearest paisa (half up).

## Prevention
Add boundary tests for UTC timestamps that fall on a different IST date, percentage coupons above their cap, and GST values at/around half-paisa boundaries. Add an order-level reconciliation test over a representative fixture so the live pricing path is compared with the written pricing rules.
