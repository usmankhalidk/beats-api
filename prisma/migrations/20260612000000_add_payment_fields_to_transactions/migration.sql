-- Add payment-gateway plumbing columns to `transactions`.
ALTER TABLE `transactions`
  ADD COLUMN `gateway` VARCHAR(20) NULL,
  ADD COLUMN `gateway_reference` VARCHAR(255) NULL,
  ADD COLUMN `charge_currency` VARCHAR(10) NULL,
  ADD COLUMN `billing` TEXT NULL;

-- Fast lookup of a pending transaction from a gateway webhook/callback.
CREATE INDEX `transactions_gateway_reference_idx` ON `transactions` (`gateway_reference`);
