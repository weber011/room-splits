export interface PropertyReview {
  id: string;
  propertyId: string;
  tenantId: string;
  tenantName: string;
  tenantAvatar?: string;
  rating: number; // 1 to 5
  cleanlinessRating: number;
  foodRating: number;
  amenitiesRating: number;
  valueForMoneyRating: number;
  comment: string;
  isVerifiedResident: boolean;
  createdAt: string;
}
