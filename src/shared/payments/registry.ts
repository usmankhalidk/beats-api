import { Errors } from '@utils/api-error';
import { paystackGateway } from './paystack';
import { flutterwaveGateway } from './flutterwave';
import { opayGateway } from './opay';
import type { GatewayAlias, PaymentGateway } from './types';

const GATEWAYS: Record<GatewayAlias, PaymentGateway> = {
  paystack: paystackGateway,
  flutterwave: flutterwaveGateway,
  opay: opayGateway,
};

export function isGatewayAlias(value: string): value is GatewayAlias {
  return value === 'paystack' || value === 'flutterwave' || value === 'opay';
}

/** Resolve a gateway implementation by alias. Throws if the alias is unknown. */
export function getGateway(alias: string): PaymentGateway {
  if (!isGatewayAlias(alias)) {
    throw Errors.notFound({ resource: 'payment_gateway', alias });
  }
  return GATEWAYS[alias];
}

export { GATEWAYS };
