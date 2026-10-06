/**
 * Feature: Owners
 * Description: Property owner portal for bed occupancy management, rent collection & visit approvals
 */

export interface OwnerDashboardStats {
  totalProperties: number;
  occupiedBeds: number;
  totalBeds: number;
  monthlyRevenue: number;
  pendingVisitsCount: number;
  openComplaintsCount: number;
}
