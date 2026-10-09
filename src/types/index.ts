export type ActivityCategory = 'indoor' | 'turf';

export interface SportActivity {
  id: string;
  name: string;
  category: ActivityCategory;
  description: string;
  iconName: string;
  defaultVenue: string;
  availableVenues: string[];
  durationMinutes: number;
  maxPlayers: number;
  popular?: boolean;
}

export interface TimeSlot {
  id: string;
  timeRange: string; // e.g. "08:00 AM - 09:00 AM"
  startTime: string; // "08:00"
  endTime: string;   // "09:00"
  isBooked?: boolean;
}

export const DEFAULT_ORGANIZATION_ID = 'org-default';

export type OrganizationType =
  | 'sports_club'
  | 'sports_academy'
  | 'sports_complex'
  | 'stadium'
  | 'sports_center'
  | 'educational_institution'
  | 'corporate'
  | 'other'
  | (string & {});

export type OrganizationStatus = 'active' | 'suspended' | 'pending';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  organizationType: OrganizationType;
  description?: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  logoUrl?: string;
  faviconUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  status: OrganizationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationSettings {
  organizationId: string;
  bookingDurationMinutes: number;
  openingTime: string;
  closingTime: string;
  advanceBookingDays: number;
  cancellationDeadlineHours: number;
  maxActiveBookingsPerUser: number;
  approvalMode: 'auto' | 'manual';
  paymentMode: 'free' | 'paid' | 'hybrid';
  timezone: string;
  memberIdentifierLabel: string;
  memberIdentifierRegex?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SportEntity {
  id: string;
  organizationId: string;
  name: string;
  category: ActivityCategory;
  description?: string;
  iconName: string;
  durationMinutes: number;
  maxPlayers: number;
  isPopular?: boolean;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface FacilityEntity {
  id: string;
  organizationId: string;
  sportId?: string;
  name: string;
  category: ActivityCategory;
  locationDetails?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Booking {
  id: string; // e.g. TT3108260300
  organizationId?: string;
  activityId: string;
  activityName: string;
  category: ActivityCategory;
  dateString: string; // e.g. "Sun, 31 Aug 2026"
  dateKey: string;    // e.g. "2026-08-31"
  timeSlot: string;   // e.g. "03:00 PM - 04:00 PM"
  venue: string;      // e.g. "Indoor Sports Room 2"
  userName: string;   // e.g. "Rahul Sharma"
  registrationNumber: string; // e.g. "22BCE1042"
  userEmail: string;  // e.g. "yourname@gmail.com"
  userId?: string;    // e.g. "user-17885..."
  bookedAt: string;
  status: 'confirmed' | 'cancelled' | 'completed';
  emailDeliveryStatus?: 'sent' | 'failed' | 'simulated';
  emailPreviewUrl?: string;
  emailError?: string;
  emailSender?: string;
  cancellationReason?: string;
  cancelledBy?: 'admin' | 'user';
  cancelledAt?: string;
  cancellationEmailStatus?: 'sent' | 'failed' | 'simulated';
  cancellationEmailError?: string;
}

export type UserRole = 'super_admin' | 'org_admin' | 'member';
export type UserStatus = 'active' | 'pending' | 'suspended' | 'disabled';

export interface User {
  id: string;
  organizationId?: string;
  name: string;
  email: string;
  registrationNumber?: string;
  role?: UserRole;
  status?: UserStatus;
  tokenVersion?: number;
  isGuest?: boolean;
  isVerified?: boolean;
  isAdmin?: boolean;
}

export interface AuditLog {
  id: string;
  organizationId?: string | null;
  userId?: string | null;
  userEmail?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  details?: Record<string, any>;
  ipAddress?: string | null;
  createdAt: string;
}

export type AdminTab = 'dashboard' | 'bookings' | 'restrict-slots' | 'announcements';

export interface SlotRestriction {
  id: string;
  organizationId?: string;
  facilityCategory: 'indoor' | 'turf' | 'all';
  facilityName: string;
  activityId?: string;    // e.g. 'carrom', 'chess', 'cricket-nets', 'pickle-ball', or 'all'
  activityName?: string;  // e.g. 'Carrom', 'Chess', 'Cricket Nets', 'All Games'
  type: 'date' | 'slot';
  dateKey: string;     // e.g. "2026-08-31"
  dateString: string;  // e.g. "31 Aug 2026"
  timeSlot: string;    // e.g. "03:00 PM - 06:00 PM" or "All Day"
  reason: 'Maintenance' | 'Event' | 'Holiday' | 'Weather' | 'Other';
  description?: string;
  createdAt: string;
}

export interface Announcement {
  id: string;
  organizationId?: string;
  title: string;
  message: string;
  priority: 'High' | 'Medium' | 'Low';
  publishDate: string; // e.g. "30 Aug 2026, 09:00 AM"
  isActive: boolean;
  createdAt: string;
}

export type SuperAdminTab =
  | 'dashboard'
  | 'organizations'
  | 'users'
  | 'analytics'
  | 'subscriptions'
  | 'audit-logs'
  | 'settings';

export interface PlatformMetrics {
  totalOrganizations: number;
  activeOrganizations: number;
  suspendedOrganizations: number;
  pendingOrganizations: number;
  totalUsers: number;
  totalBookings: number;
}

export interface PlatformRecentOrg {
  id: string;
  name: string;
  slug: string;
  organizationType: OrganizationType;
  status: OrganizationStatus;
  email?: string;
  createdAt: string;
  userCount: number;
}

export interface PlatformRecentActivity {
  id: string;
  organizationId?: string | null;
  organizationName?: string;
  userEmail: string;
  action: string;
  entityType: string;
  entityId?: string | null;
  createdAt: string;
}

export interface PlatformHealthStatus {
  database: 'operational' | 'degraded' | 'outage';
  authentication: 'operational' | 'degraded' | 'outage';
  organizations: 'operational' | 'degraded' | 'outage';
  bookingSystem: 'operational' | 'degraded' | 'outage';
}

export interface PlatformDashboardData {
  metrics: PlatformMetrics;
  statusDistribution: {
    active: number;
    pending: number;
    suspended: number;
  };
  recentOrganizations: PlatformRecentOrg[];
  recentActivity: PlatformRecentActivity[];
  platformHealth: PlatformHealthStatus;
}

export interface PlatformOrganization {
  id: string;
  name: string;
  slug: string;
  organizationType: OrganizationType;
  description?: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  logoUrl?: string;
  faviconUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  status: OrganizationStatus;
  userCount: number;
  facilityCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationListFilters {
  search?: string;
  status?: OrganizationStatus | 'all';
  organizationType?: OrganizationType | 'all';
  sortBy?: 'created_at' | 'name' | 'status';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export interface OrganizationPagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface OrganizationTenantStats {
  totalUsers: number;
  totalBookings: number;
  totalFacilities: number;
  totalSports: number;
  activeRestrictions: number;
}

export interface OrganizationDetails {
  organization: PlatformOrganization;
  stats: OrganizationTenantStats;
  settings?: OrganizationSettings | null;
}

export interface OrganizationProvisioningPayload {
  name: string;
  slug: string;
  organizationType: OrganizationType;
  description?: string;
  email: string;
  phone?: string;
  website?: string;
  initialAdmin: {
    name: string;
    email: string;
    password?: string;
    registrationNumber?: string;
  };
}


export type ViewType = 
  | 'login'
  | 'signup'
  | 'verify'
  | 'dashboard'
  | 'indoor-games'
  | 'turf-grounds'
  | 'booking-status'
  | 'announcements'
  | 'slot-selection'
  | 'confirm-booking'
  | 'booking-confirmed'
  | 'admin'
  | 'super-admin';

// ==========================================
// SUBSCRIPTION TYPES (PHASE 6)
// ==========================================

export type SubscriptionStatus = 'active' | 'expired' | 'cancelled';
export type PlanSlug = 'basic' | 'pro' | string;

export interface SubscriptionPlanLimit {
  id: string;
  planId: string;
  limitKey: 'max_facilities' | 'max_sports' | 'max_admins' | 'max_members' | string;
  limitValue: number | null; // null = unlimited
}

export interface SubscriptionPlanFeature {
  id: string;
  planId: string;
  featureKey: string;
  enabled: boolean;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  slug: PlanSlug;
  description?: string;
  price: number;
  currency: string;
  billingInterval: 'monthly' | 'yearly' | 'quarterly' | 'lifetime';
  isActive: boolean;
  limits: Record<string, number | null>;
  features: Record<string, boolean>;
  createdAt?: string;
  updatedAt?: string;
}

export interface OrganizationSubscription {
  id: string;
  organizationId: string;
  organizationName?: string;
  organizationSlug?: string;
  organizationEmail?: string;
  planId: string;
  planName?: string;
  planSlug?: PlanSlug;
  status: SubscriptionStatus;
  startsAt: string;
  endsAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionSummary {
  totalOrganizations: number;
  basicOrganizations: number;
  proOrganizations: number;
  missingSubscriptions: number;
}

export interface OrganizationEntitlements {
  organizationId: string;
  plan: {
    id: string;
    name: string;
    slug: string;
  };
  status: SubscriptionStatus;
  isSubscriptionActive: boolean;
  limits: {
    max_facilities: number | null;
    max_sports: number | null;
    max_admins: number | null;
    max_members: number | null;
    [key: string]: number | null;
  };
  features: {
    booking_management: boolean;
    sports_management: boolean;
    facility_management: boolean;
    slot_management: boolean;
    restrictions: boolean;
    announcements: boolean;
    organization_settings: boolean;
    organization_branding: boolean;
    advanced_customization: boolean;
    [key: string]: boolean;
  };
  usage: {
    facilities: number;
    sports: number;
    admins: number;
    members: number;
  };
}

export interface SubscriptionListFilters {
  search?: string;
  plan?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}

// ==========================================
// PLATFORM USERS TYPES (PHASE 7)
// ==========================================

export type PlatformUserRole = 'super_admin' | 'org_admin' | 'member';
export type PlatformUserStatus = 'active' | 'pending' | 'suspended' | 'disabled';

export interface PlatformUser {
  id: string;
  name: string;
  email: string;
  registrationNumber?: string;
  role: PlatformUserRole;
  status: PlatformUserStatus;
  isVerified: boolean;
  organizationId: string;
  organizationName: string;
  organizationSlug: string;
  organizationStatus: string;
  planSlug?: string;
  planName?: string;
  lastActivityAt?: string | null;
  createdAt: string;
}

export interface PlatformUsersSummary {
  totalUsers: number;
  superAdmins: number;
  orgAdmins: number;
  members: number;
  activeUsers: number;
  suspendedDisabledUsers: number;
}

export interface PlatformUsersFilters {
  search?: string;
  role?: string;
  status?: string;
  organizationId?: string;
  subscriptionPlan?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export interface PlatformUserDetails {
  user: PlatformUser;
  organization: {
    id: string;
    name: string;
    slug: string;
    status: string;
    organizationType: string;
  };
  subscription?: {
    planName: string;
    planSlug: string;
    status: string;
    startsAt: string;
    endsAt: string | null;
  } | null;
  recentActivity: Array<{
    id: string;
    action: string;
    entityType: string;
    createdAt: string;
    details?: any;
  }>;
}

// ==========================================
// PLATFORM ANALYTICS TYPES (PHASE 8)
// ==========================================

export type AnalyticsDateRangePreset =
  | 'today'
  | '7d'
  | '30d'
  | '90d'
  | 'this_year'
  | 'all_time'
  | 'custom';

export interface AnalyticsFilterParams {
  dateRange?: AnalyticsDateRangePreset;
  startDate?: string;
  endDate?: string;
}

export interface PlatformAnalyticsOverview {
  totalOrganizations: number;
  activeOrganizations: number;
  totalUsers: number;
  totalBookings: number;
  periodBookings: number;
  activeFacilities: number;
  activeSports: number;
  proOrganizations: number;
}

export interface OrganizationGrowthPoint {
  date: string;
  newOrganizations: number;
  cumulativeOrganizations: number;
}

export interface UserGrowthPoint {
  date: string;
  newUsers: number;
  cumulativeUsers: number;
  members: number;
  orgAdmins: number;
  superAdmins: number;
}

export interface BookingTrendPoint {
  date: string;
  bookings: number;
  confirmed: number;
  cancelled: number;
}

export interface BookingAnalyticsSummary {
  totalBookings: number;
  confirmedBookings: number;
  cancelledBookings: number;
  averageBookingsPerDay: number;
  busiestDate?: string | null;
  busiestTimeSlot?: string | null;
}

export interface TopOrganizationMetric {
  rank: number;
  id: string;
  name: string;
  slug: string;
  bookingsCount: number;
  usersCount: number;
  facilitiesCount: number;
  sportsCount: number;
  planSlug: string;
  status: string;
}

export interface OrganizationUsageMetric {
  id: string;
  name: string;
  slug: string;
  usersCount: number;
  sportsCount: number;
  facilitiesCount: number;
  bookingsCount: number;
  planSlug: string;
  status: string;
}

export interface SubscriptionDistributionMetric {
  planSlug: string;
  planName: string;
  count: number;
  percentage: number;
}

export interface SportUsageMetric {
  sportName: string;
  bookingsCount: number;
  organizationsCount: number;
}

export interface FacilityUsageMetric {
  facilityName: string;
  organizationName: string;
  bookingsCount: number;
}

export interface PlatformHealthMetrics {
  activeOrganizations: number;
  suspendedOrganizations: number;
  pendingOrganizations: number;
  activeUsers: number;
  suspendedUsers: number;
  disabledUsers: number;
  basicOrganizations: number;
  proOrganizations: number;
}

export interface RecentPlatformActivityItem {
  id: string;
  action: string;
  actorEmail?: string | null;
  entityType: string;
  entityId?: string | null;
  createdAt: string;
  details?: any;
}

export interface PlatformAnalytics {
  dateRange: AnalyticsDateRangePreset;
  startDate: string;
  endDate: string;
  overview: PlatformAnalyticsOverview;
  organizationGrowth: OrganizationGrowthPoint[];
  userGrowth: UserGrowthPoint[];
  bookingAnalytics: BookingAnalyticsSummary;
  bookingTrend: BookingTrendPoint[];
  topOrganizations: TopOrganizationMetric[];
  organizationUsage: OrganizationUsageMetric[];
  subscriptionDistribution: SubscriptionDistributionMetric[];
  sportsUsage: SportUsageMetric[];
  facilityUsage: FacilityUsageMetric[];
  platformHealth: PlatformHealthMetrics;
  recentActivity: RecentPlatformActivityItem[];
}

