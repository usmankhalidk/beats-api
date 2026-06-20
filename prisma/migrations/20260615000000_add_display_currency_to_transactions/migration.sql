-- Multi-currency display support. Settlement stays in NGN (charge_currency,
-- amount, fees, total). These columns capture what the buyer saw in their
-- chosen display currency at the moment of payment, for receipts/order history.
ALTER TABLE `transactions`
  ADD COLUMN `display_currency` VARCHAR(10) NULL,
  ADD COLUMN `display_amount` DOUBLE NULL,
  ADD COLUMN `display_fees` DOUBLE NULL DEFAULT 0,
  ADD COLUMN `display_total` DOUBLE NULL;
