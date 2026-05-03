import { Errors } from '@utils/api-error';
import type { AddCartItemInput } from './validation';

export interface CartItemDTO {
  id: string;
  beatId: string;
  licenseType: 'basic' | 'premium' | 'exclusive';
}

export async function listCart(_userId: string): Promise<CartItemDTO[]> {
  throw Errors.notImplemented({ feature: 'cart.list' });
}

export async function addItem(_userId: string, _input: AddCartItemInput): Promise<CartItemDTO> {
  throw Errors.notImplemented({ feature: 'cart.add' });
}

export async function removeItem(_userId: string, _cartItemId: string): Promise<void> {
  throw Errors.notImplemented({ feature: 'cart.remove' });
}

export async function clearCart(_userId: string): Promise<void> {
  throw Errors.notImplemented({ feature: 'cart.clear' });
}
