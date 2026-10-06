/**
 * Feature: Checkout
 * Description: Step-by-step room booking checkout flow with tenant details & payment gateway trigger
 */

export interface CheckoutSummary {
  propertyTitle: string;
  sharingType: string;
  moveInDate: string;
  monthlyRent: number;
  securityDeposit: number;
  platformFee: number;
  grandTotal: number;
}
