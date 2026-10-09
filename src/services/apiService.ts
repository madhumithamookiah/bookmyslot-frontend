import { apiUrl } from '../config/api'
import type {
  Booking,
  SlotRestriction,
  Announcement,
  Organization,
  OrganizationSettings,
  SportEntity,
  FacilityEntity,
  AuditLog,
  User,
  PlatformUser,
  PlatformUsersSummary,
  PlatformUsersFilters,
  PlatformUserDetails,
  PlatformUserStatus,
  PlatformAnalytics,
  AnalyticsFilterParams,
} from '../types';
import type { StoredAccount, PendingVerification } from '../store/authStore';

const SESSION_TOKEN_KEY = 'campus_sports_session_token_v2';

export function getStoredSessionToken(): string | null {
  if (typeof localStorage === 'undefined') return null;
  return localStorage.getItem(SESSION_TOKEN_KEY);
}

export function setStoredSessionToken(token: string | null) {
  if (typeof localStorage === 'undefined') return;
  if (token) {
    localStorage.setItem(SESSION_TOKEN_KEY, token);
  } else {
    localStorage.removeItem(SESSION_TOKEN_KEY);
  }
}

function getRequestOptions(method: 'GET' | 'POST' = 'GET', body?: any): RequestInit {
  const token = getStoredSessionToken();
  const headers: Record<string, string> = {};

  if (body) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    headers['X-Session-Token'] = token;
  }

  return {
    method,
    headers,
    credentials: 'include', // Includes HTTP-only cookies in all environments
    ...(body ? { body: JSON.stringify(body) } : {}),
  };
}

// ==========================================
// SERVER-SIDE AUTHENTICATION DB SERVICES
// ==========================================

export async function loginViaAPI(
  email: string,
  password: string,
  organizationId?: string
): Promise<{ success: boolean; error?: string; user?: User; sessionToken?: string }> {
  try {
    const res = await fetch(apiUrl('/api/db?action=login'),
      getRequestOptions('POST', { email, password, organizationId })
    );
    const data = await res.json();
    if (res.ok && data.success && data.sessionToken) {
      setStoredSessionToken(data.sessionToken);
      return { success: true, user: data.user, sessionToken: data.sessionToken };
    }
    return { success: false, error: data.error || 'Login failed' };
  } catch (err: any) {
    console.error('API login error:', err);
    return { success: false, error: err.message || 'Network error during login' };
  }
}

export async function logoutViaAPI(): Promise<boolean> {
  try {
    setStoredSessionToken(null);
    const res = await fetch(apiUrl('/api/db?action=logout'), getRequestOptions('POST', {}));
    const data = await res.json();
    return Boolean(data.success);
  } catch (err) {
    console.error('API logout error:', err);
    return false;
  }
}

export async function getMeFromAPI(): Promise<{ user: User; organization: any } | null> {
  try {
    const res = await fetch(apiUrl('/api/db?action=me'), getRequestOptions('GET'));
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.success || !data.user) return null;
    return { user: data.user, organization: data.organization };
  } catch (err) {
    console.error('API getMe error:', err);
    return null;
  }
}

export async function initiateSignupViaAPI(
  name: string,
  registrationNumber: string,
  email: string,
  password: string,
  organizationId?: string
): Promise<{ success: boolean; error?: string; email?: string; message?: string }> {
  try {
    const res = await fetch(apiUrl('/api/db?action=initiate_signup'),
      getRequestOptions('POST', { name, registrationNumber, email, password, organizationId })
    );
    const data = await res.json();
    if (res.ok && data.success) {
      return { success: true, email: data.email, message: data.message };
    }
    return { success: false, error: data.error || 'Failed to initiate signup' };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error during signup' };
  }
}

export async function verifySignupViaAPI(
  email: string,
  code: string,
  organizationId?: string
): Promise<{ success: boolean; error?: string; user?: User; sessionToken?: string }> {
  try {
    const res = await fetch(apiUrl('/api/db?action=verify_signup'),
      getRequestOptions('POST', { email, code, organizationId })
    );
    const data = await res.json();
    if (res.ok && data.success && data.user) {
      if (data.sessionToken) {
        setStoredSessionToken(data.sessionToken);
      }
      return { success: true, user: data.user, sessionToken: data.sessionToken };
    }
    return { success: false, error: data.error || 'Verification failed' };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error during verification' };
  }
}

export async function resendVerificationCodeViaAPI(
  email: string,
  organizationId?: string
): Promise<{ success: boolean; error?: string; message?: string }> {
  try {
    const res = await fetch(apiUrl('/api/db?action=resend_verification_code'),
      getRequestOptions('POST', { email, organizationId })
    );
    const data = await res.json();
    if (res.ok && data.success) {
      return { success: true, message: data.message };
    }
    return { success: false, error: data.error || 'Failed to resend code' };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error resending code' };
  }
}

export async function requestPasswordResetViaAPI(
  email: string,
  organizationId?: string
): Promise<{ success: boolean; error?: string; message?: string }> {
  try {
    const res = await fetch(apiUrl('/api/db?action=request_password_reset'),
      getRequestOptions('POST', { email, organizationId })
    );
    const data = await res.json();
    if (res.ok && data.success) {
      return { success: true, message: data.message };
    }
    return { success: false, error: data.error || 'Failed to request reset' };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error requesting reset' };
  }
}

export async function verifyPasswordResetViaAPI(
  email: string,
  code: string,
  newPassword: string,
  organizationId?: string
): Promise<{ success: boolean; error?: string; message?: string }> {
  try {
    const res = await fetch(apiUrl('/api/db?action=verify_password_reset'),
      getRequestOptions('POST', { email, code, newPassword, organizationId })
    );
    const data = await res.json();
    if (res.ok && data.success) {
      return { success: true, message: data.message };
    }
    return { success: false, error: data.error || 'Password reset failed' };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error resetting password' };
  }
}

export async function provisionOrganizationViaAPI(
  params: any
): Promise<{ success: boolean; error?: string; organization?: any; initialAdmin?: any }> {
  try {
    const res = await fetch(apiUrl('/api/db?action=provision_organization'),
      getRequestOptions('POST', params)
    );
    const data = await res.json();
    if (res.ok && data.success) {
      return { success: true, organization: data.organization, initialAdmin: data.initialAdmin };
    }
    return { success: false, error: data.error || 'Provisioning failed' };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error provisioning organization' };
  }
}

export async function setOrganizationStatusViaAPI(
  organizationId: string,
  status: string
): Promise<{ success: boolean; error?: string; status?: string }> {
  try {
    const res = await fetch(apiUrl('/api/db?action=set_organization_status'),
      getRequestOptions('POST', { organizationId, status })
    );
    const data = await res.json();
    if (res.ok && data.success) {
      return { success: true, status: data.status };
    }
    return { success: false, error: data.error || 'Status update failed' };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error updating status' };
  }
}

// ==========================================
// ORGANIZATIONS & TENANT DB SERVICES
// ==========================================

export async function fetchOrganizationsFromDB(): Promise<Organization[] | null> {
  try {
    const res = await fetch(apiUrl('/api/db?action=get_organizations'), getRequestOptions('GET'));
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.success || !Array.isArray(data.organizations)) return null;
    return data.organizations;
  } catch (err) {
    console.error('fetchOrganizations error:', err);
    return null;
  }
}

export async function fetchOrganizationFromDB(idOrSlug: string): Promise<Organization | null> {
  try {
    const param = idOrSlug.includes('org-')
      ? `id=${encodeURIComponent(idOrSlug)}`
      : `slug=${encodeURIComponent(idOrSlug)}`;
    const res = await fetch(apiUrl(`/api/db?action=get_organization&${param}`), getRequestOptions('GET'));
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.success || !data.organization) return null;
    return data.organization;
  } catch (err) {
    console.error('fetchOrganization error:', err);
    return null;
  }
}

export async function saveOrganizationToDB(organization: Organization): Promise<boolean> {
  try {
    const res = await fetch(apiUrl('/api/db?action=save_organization'),
      getRequestOptions('POST', { organization })
    );
    if (!res.ok) return false;
    const data = await res.json();
    return Boolean(data.success);
  } catch (err) {
    console.error('saveOrganization error:', err);
    return false;
  }
}

export async function fetchOrganizationSettingsFromDB(
  orgId: string = 'org-default'
): Promise<OrganizationSettings | null> {
  try {
    const res = await fetch(apiUrl(`/api/db?action=get_organization_settings&id=${encodeURIComponent(orgId)}`),
      getRequestOptions('GET')
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.success || !data.settings) return null;
    return data.settings;
  } catch (err) {
    console.error('fetchOrganizationSettings error:', err);
    return null;
  }
}

export async function saveOrganizationSettingsToDB(
  settings: OrganizationSettings
): Promise<boolean> {
  try {
    const res = await fetch(apiUrl('/api/db?action=save_organization_settings'),
      getRequestOptions('POST', { settings })
    );
    if (!res.ok) return false;
    const data = await res.json();
    return Boolean(data.success);
  } catch (err) {
    console.error('saveOrganizationSettings error:', err);
    return false;
  }
}

export async function fetchSportsFromDB(orgId: string = 'org-default'): Promise<SportEntity[] | null> {
  try {
    const res = await fetch(apiUrl(`/api/db?action=get_sports&id=${encodeURIComponent(orgId)}`),
      getRequestOptions('GET')
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.success || !Array.isArray(data.sports)) return null;
    return data.sports;
  } catch (err) {
    console.error('fetchSports error:', err);
    return null;
  }
}

export async function saveSportToDB(sport: SportEntity): Promise<boolean> {
  try {
    const res = await fetch(apiUrl('/api/db?action=save_sport'),
      getRequestOptions('POST', { sport })
    );
    if (!res.ok) return false;
    const data = await res.json();
    return Boolean(data.success);
  } catch (err) {
    console.error('saveSport error:', err);
    return false;
  }
}

export async function fetchFacilitiesFromDB(orgId: string = 'org-default'): Promise<FacilityEntity[] | null> {
  try {
    const res = await fetch(apiUrl(`/api/db?action=get_facilities&id=${encodeURIComponent(orgId)}`),
      getRequestOptions('GET')
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.success || !Array.isArray(data.facilities)) return null;
    return data.facilities;
  } catch (err) {
    console.error('fetchFacilities error:', err);
    return null;
  }
}

export async function saveFacilityToDB(facility: FacilityEntity): Promise<boolean> {
  try {
    const res = await fetch(apiUrl('/api/db?action=save_facility'),
      getRequestOptions('POST', { facility })
    );
    if (!res.ok) return false;
    const data = await res.json();
    return Boolean(data.success);
  } catch (err) {
    console.error('saveFacility error:', err);
    return false;
  }
}

// ==========================================
// USERS & AUTHENTICATION DB SERVICES
// ==========================================

export async function fetchUsersFromDB(orgId?: string): Promise<StoredAccount[] | null> {
  try {
    const query = orgId ? `&organization_id=${encodeURIComponent(orgId)}` : '';
    const res = await fetch(apiUrl(`/api/db?action=get_users${query}`), getRequestOptions('GET'));
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.success || !Array.isArray(data.users)) return null;
    return data.users;
  } catch (err) {
    console.error('fetchUsers error:', err);
    return null;
  }
}

export async function saveUserToDB(user: StoredAccount): Promise<boolean> {
  try {
    const res = await fetch(apiUrl('/api/db?action=save_user'),
      getRequestOptions('POST', { user })
    );
    if (!res.ok) return false;
    const data = await res.json();
    return Boolean(data.success);
  } catch (err) {
    console.error('saveUser error:', err);
    return false;
  }
}

export async function savePendingVerificationToDB(pending: PendingVerification): Promise<boolean> {
  try {
    const res = await fetch(apiUrl('/api/db?action=save_pending_verification'),
      getRequestOptions('POST', { pending })
    );
    if (!res.ok) return false;
    const data = await res.json();
    return Boolean(data.success);
  } catch (err) {
    console.error('savePendingVerification error:', err);
    return false;
  }
}

export async function deletePendingVerificationFromDB(email: string, orgId?: string): Promise<void> {
  try {
    await fetch(apiUrl('/api/db?action=delete_pending_verification'),
      getRequestOptions('POST', { email, organizationId: orgId || 'org-default' })
    );
  } catch (err) {
    console.error('deletePendingVerification error:', err);
  }
}

// ==========================================
// BOOKINGS DB SERVICES
// ==========================================

export async function fetchBookingsFromDB(orgId?: string): Promise<Booking[] | null> {
  try {
    const query = orgId ? `&organization_id=${encodeURIComponent(orgId)}` : '';
    const res = await fetch(apiUrl(`/api/db?action=get_bookings${query}`), getRequestOptions('GET'));
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.success || !Array.isArray(data.bookings)) return null;
    return data.bookings;
  } catch (err) {
    console.error('fetchBookings error:', err);
    return null;
  }
}

export async function saveBookingToDB(booking: Booking): Promise<boolean> {
  try {
    const res = await fetch(apiUrl('/api/db?action=save_booking'),
      getRequestOptions('POST', { booking })
    );
    if (!res.ok) return false;
    const data = await res.json();
    return Boolean(data.success);
  } catch (err) {
    console.error('saveBooking error:', err);
    return false;
  }
}

// ==========================================
// RESTRICTED SLOTS DB SERVICES
// ==========================================

export async function fetchRestrictedSlotsFromDB(orgId?: string): Promise<SlotRestriction[] | null> {
  try {
    const query = orgId ? `&organization_id=${encodeURIComponent(orgId)}` : '';
    const res = await fetch(apiUrl(`/api/db?action=get_restricted_slots${query}`), getRequestOptions('GET'));
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.success || !Array.isArray(data.slots)) return null;
    return data.slots;
  } catch (err) {
    console.error('fetchRestrictedSlots error:', err);
    return null;
  }
}

export async function saveRestrictedSlotToDB(slot: SlotRestriction): Promise<boolean> {
  try {
    const res = await fetch(apiUrl('/api/db?action=save_restricted_slot'),
      getRequestOptions('POST', { slot })
    );
    if (!res.ok) return false;
    const data = await res.json();
    return Boolean(data.success);
  } catch (err) {
    console.error('saveRestrictedSlot error:', err);
    return false;
  }
}

export async function deleteRestrictedSlotFromDB(id: string): Promise<boolean> {
  try {
    const res = await fetch(apiUrl('/api/db?action=delete_restricted_slot'),
      getRequestOptions('POST', { id })
    );
    if (!res.ok) return false;
    const data = await res.json();
    return Boolean(data.success);
  } catch (err) {
    console.error('deleteRestrictedSlot error:', err);
    return false;
  }
}

// ==========================================
// ANNOUNCEMENTS DB SERVICES
// ==========================================

export async function fetchAnnouncementsFromDB(orgId?: string): Promise<Announcement[] | null> {
  try {
    const query = orgId ? `&organization_id=${encodeURIComponent(orgId)}` : '';
    const res = await fetch(apiUrl(`/api/db?action=get_announcements${query}`), getRequestOptions('GET'));
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.success || !Array.isArray(data.announcements)) return null;
    return data.announcements;
  } catch (err) {
    console.error('fetchAnnouncements error:', err);
    return null;
  }
}

export async function saveAnnouncementToDB(announcement: Announcement): Promise<boolean> {
  try {
    const res = await fetch(apiUrl('/api/db?action=save_announcement'),
      getRequestOptions('POST', { announcement })
    );
    if (!res.ok) return false;
    const data = await res.json();
    return Boolean(data.success);
  } catch (err) {
    console.error('saveAnnouncement error:', err);
    return false;
  }
}

export async function deleteAnnouncementFromDB(id: string): Promise<boolean> {
  try {
    const res = await fetch(apiUrl('/api/db?action=delete_announcement'),
      getRequestOptions('POST', { id })
    );
    if (!res.ok) return false;
    const data = await res.json();
    return Boolean(data.success);
  } catch (err) {
    console.error('deleteAnnouncement error:', err);
    return false;
  }
}

// ==========================================
// AUDIT LOG DB SERVICES
// ==========================================

export async function fetchAuditLogsFromDB(orgId?: string): Promise<AuditLog[] | null> {
  try {
    const query = orgId ? `&organization_id=${encodeURIComponent(orgId)}` : '';
    const res = await fetch(apiUrl(`/api/db?action=get_audit_logs${query}`), getRequestOptions('GET'));
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.success || !Array.isArray(data.logs)) return null;
    return data.logs;
  } catch (err) {
    console.error('fetchAuditLogs error:', err);
    return null;
  }
}

// ==========================================
// SUPER ADMIN PLATFORM SERVICES
// ==========================================

export async function fetchPlatformDashboardFromDB(): Promise<{
  success: boolean;
  data?: import('../types').PlatformDashboardData;
  error?: string;
}> {
  try {
    const res = await fetch(apiUrl('/api/db?action=get_platform_dashboard'), getRequestOptions('GET'));
    const json = await res.json();
    if (!res.ok || !json.success) {
      return { success: false, error: json.error || 'Failed to fetch platform dashboard metrics' };
    }
    return { success: true, data: json.data };
  } catch (err: any) {
    console.error('fetchPlatformDashboard error:', err);
    return { success: false, error: err.message || 'Network error fetching platform metrics' };
  }
}

export async function fetchPlatformOrganizationsFromDB(params?: {
  search?: string;
  status?: string;
  type?: string;
  sortBy?: string;
  sortOrder?: string;
  page?: number;
  pageSize?: number;
}): Promise<{
  success: boolean;
  metrics?: {
    totalOrganizations: number;
    activeOrganizations: number;
    pendingOrganizations: number;
    suspendedOrganizations: number;
  };
  organizations?: import('../types').PlatformOrganization[];
  pagination?: import('../types').OrganizationPagination;
  error?: string;
}> {
  try {
    const q = new URLSearchParams();
    if (params?.search) q.set('search', params.search);
    if (params?.status && params.status !== 'all') q.set('status', params.status);
    if (params?.type && params.type !== 'all') q.set('type', params.type);
    if (params?.sortBy) q.set('sortBy', params.sortBy);
    if (params?.sortOrder) q.set('sortOrder', params.sortOrder);
    if (params?.page) q.set('page', String(params.page));
    if (params?.pageSize) q.set('pageSize', String(params.pageSize));

    const res = await fetch(apiUrl(`/api/db?action=get_platform_organizations&${q.toString()}`), getRequestOptions('GET'));
    const json = await res.json();
    if (!res.ok || !json.success) {
      return { success: false, error: json.error || 'Failed to fetch organizations' };
    }
    return {
      success: true,
      metrics: json.metrics,
      organizations: json.organizations,
      pagination: json.pagination,
    };
  } catch (err: any) {
    console.error('fetchPlatformOrganizations error:', err);
    return { success: false, error: err.message || 'Network error fetching organizations' };
  }
}

export async function fetchPlatformOrganizationDetailsFromDB(orgId: string): Promise<{
  success: boolean;
  organization?: import('../types').PlatformOrganization;
  stats?: import('../types').OrganizationTenantStats;
  settings?: import('../types').OrganizationSettings | null;
  error?: string;
}> {
  try {
    const res = await fetch(apiUrl(`/api/db?action=get_platform_organization&id=${encodeURIComponent(orgId)}`), getRequestOptions('GET'));
    const json = await res.json();
    if (!res.ok || !json.success) {
      return { success: false, error: json.error || 'Failed to fetch organization details' };
    }
    return {
      success: true,
      organization: json.organization,
      stats: json.stats,
      settings: json.settings,
    };
  } catch (err: any) {
    console.error('fetchPlatformOrganizationDetails error:', err);
    return { success: false, error: err.message || 'Network error fetching organization details' };
  }
}

export async function provisionOrganizationFromDB(payload: import('../types').OrganizationProvisioningPayload): Promise<{
  success: boolean;
  organization?: any;
  initialAdmin?: any;
  error?: string;
}> {
  try {
    const res = await fetch(apiUrl('/api/db?action=provision_organization'), getRequestOptions('POST', payload));
    const json = await res.json();
    if (!res.ok || !json.success) {
      return { success: false, error: json.error || 'Failed to provision organization' };
    }
    return { success: true, organization: json.organization, initialAdmin: json.initialAdmin };
  } catch (err: any) {
    console.error('provisionOrganization error:', err);
    return { success: false, error: err.message || 'Network error provisioning organization' };
  }
}

export async function setPlatformOrganizationStatus(orgId: string, status: import('../types').OrganizationStatus): Promise<{
  success: boolean;
  status?: import('../types').OrganizationStatus;
  error?: string;
}> {
  try {
    const res = await fetch(apiUrl('/api/db?action=set_organization_status'), getRequestOptions('POST', { organizationId: orgId, status }));
    const json = await res.json();
    if (!res.ok || !json.success) {
      return { success: false, error: json.error || 'Failed to update organization status' };
    }
    return { success: true, status: json.status };
  } catch (err: any) {
    console.error('setPlatformOrganizationStatus error:', err);
    return { success: false, error: err.message || 'Network error updating organization status' };
  }
}

// ==========================================
// SUPER ADMIN SUBSCRIPTION DB SERVICES (PHASE 6)
// ==========================================

export async function fetchSubscriptionPlansFromDB(): Promise<{
  success: boolean;
  plans?: import('../types').SubscriptionPlan[];
  error?: string;
}> {
  try {
    const res = await fetch(apiUrl('/api/db?action=get_subscription_plans'), getRequestOptions('GET'));
    const json = await res.json();
    if (!res.ok || !json.success) {
      return { success: false, error: json.error || 'Failed to load subscription plans' };
    }
    return { success: true, plans: json.plans };
  } catch (err: any) {
    console.error('fetchSubscriptionPlans error:', err);
    return { success: false, error: err.message || 'Network error fetching subscription plans' };
  }
}

export async function fetchPlatformSubscriptionsFromDB(filters: import('../types').SubscriptionListFilters = {}): Promise<{
  success: boolean;
  subscriptions?: import('../types').OrganizationSubscription[];
  pagination?: import('../types').OrganizationPagination;
  summary?: import('../types').SubscriptionSummary;
  error?: string;
}> {
  try {
    const q = new URLSearchParams();
    if (filters.search) q.append('search', filters.search);
    if (filters.plan && filters.plan !== 'all') q.append('plan', filters.plan);
    if (filters.status && filters.status !== 'all') q.append('status', filters.status);
    if (filters.page) q.append('page', String(filters.page));
    if (filters.pageSize) q.append('pageSize', String(filters.pageSize));

    const res = await fetch(apiUrl(`/api/db?action=get_platform_subscriptions&${q.toString()}`), getRequestOptions('GET'));
    const json = await res.json();
    if (!res.ok || !json.success) {
      return { success: false, error: json.error || 'Failed to load platform subscriptions' };
    }
    return {
      success: true,
      subscriptions: json.subscriptions,
      pagination: json.pagination,
      summary: json.summary,
    };
  } catch (err: any) {
    console.error('fetchPlatformSubscriptions error:', err);
    return { success: false, error: err.message || 'Network error fetching subscriptions' };
  }
}

export async function fetchOrganizationSubscriptionFromDB(orgId: string): Promise<{
  success: boolean;
  subscription?: any;
  entitlements?: import('../types').OrganizationEntitlements;
  error?: string;
}> {
  try {
    const res = await fetch(apiUrl(`/api/db?action=get_organization_subscription&organizationId=${encodeURIComponent(orgId)}`), getRequestOptions('GET'));
    const json = await res.json();
    if (!res.ok || !json.success) {
      return { success: false, error: json.error || 'Failed to load organization subscription' };
    }
    return { success: true, subscription: json.subscription };
  } catch (err: any) {
    console.error('fetchOrganizationSubscription error:', err);
    return { success: false, error: err.message || 'Network error fetching organization subscription' };
  }
}

export async function changeOrganizationPlanInDB(orgId: string, planSlug: string): Promise<{
  success: boolean;
  plan?: any;
  error?: string;
}> {
  try {
    const res = await fetch(apiUrl('/api/db?action=change_organization_plan'), getRequestOptions('POST', { organizationId: orgId, planSlug }));
    const json = await res.json();
    if (!res.ok || !json.success) {
      return { success: false, error: json.error || 'Failed to change subscription plan' };
    }
    return { success: true, plan: json.plan };
  } catch (err: any) {
    console.error('changeOrganizationPlan error:', err);
    return { success: false, error: err.message || 'Network error changing subscription plan' };
  }
}

export async function setOrganizationSubscriptionStatusInDB(orgId: string, status: import('../types').SubscriptionStatus): Promise<{
  success: boolean;
  status?: import('../types').SubscriptionStatus;
  error?: string;
}> {
  try {
    const res = await fetch(apiUrl('/api/db?action=set_organization_subscription_status'), getRequestOptions('POST', { organizationId: orgId, status }));
    const json = await res.json();
    if (!res.ok || !json.success) {
      return { success: false, error: json.error || 'Failed to update subscription status' };
    }
    return { success: true, status: json.status };
  } catch (err: any) {
    console.error('setOrganizationSubscriptionStatus error:', err);
    return { success: false, error: err.message || 'Network error updating subscription status' };
  }
}

// ==========================================
// SUPER ADMIN: PLATFORM USERS (PHASE 7)
// ==========================================

export async function fetchPlatformUsersFromDB(filters?: PlatformUsersFilters): Promise<{
  success: boolean;
  users?: PlatformUser[];
  summary?: PlatformUsersSummary;
  total?: number;
  page?: number;
  pageSize?: number;
  totalPages?: number;
  error?: string;
}> {
  try {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.role && filters.role !== 'all') params.append('role', filters.role);
    if (filters?.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters?.organizationId && filters.organizationId !== 'all') params.append('organizationId', filters.organizationId);
    if (filters?.subscriptionPlan && filters.subscriptionPlan !== 'all') params.append('subscriptionPlan', filters.subscriptionPlan);
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);
    if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);
    if (filters?.page) params.append('page', String(filters.page));
    if (filters?.pageSize) params.append('pageSize', String(filters.pageSize));

    const query = params.toString() ? `&${params.toString()}` : '';
    const res = await fetch(apiUrl(`/api/db?action=get_platform_users${query}`), getRequestOptions('GET'));
    const json = await res.json();
    if (!res.ok || !json.success) {
      return { success: false, error: json.error || 'Failed to fetch platform users' };
    }
    return {
      success: true,
      users: json.users,
      summary: json.summary,
      total: json.total,
      page: json.page,
      pageSize: json.pageSize,
      totalPages: json.totalPages,
    };
  } catch (err: any) {
    console.error('fetchPlatformUsers error:', err);
    return { success: false, error: err.message || 'Network error fetching platform users' };
  }
}

export async function fetchPlatformUserDetailsFromDB(userId: string): Promise<{
  success: boolean;
  user?: PlatformUserDetails;
  error?: string;
}> {
  try {
    const res = await fetch(apiUrl(`/api/db?action=get_platform_user_details&userId=${encodeURIComponent(userId)}`),
      getRequestOptions('GET')
    );
    const json = await res.json();
    if (!res.ok || !json.success) {
      return { success: false, error: json.error || 'Failed to fetch platform user details' };
    }
    return { success: true, user: json.user };
  } catch (err: any) {
    console.error('fetchPlatformUserDetails error:', err);
    return { success: false, error: err.message || 'Network error fetching user details' };
  }
}

export async function setPlatformUserStatusInDB(
  userId: string,
  status: PlatformUserStatus
): Promise<{
  success: boolean;
  status?: PlatformUserStatus;
  user?: any;
  error?: string;
}> {
  try {
    const res = await fetch(apiUrl('/api/db?action=set_platform_user_status'),
      getRequestOptions('POST', { userId, status })
    );
    const json = await res.json();
    if (!res.ok || !json.success) {
      return { success: false, error: json.error || 'Failed to update user status' };
    }
    return { success: true, status: json.status, user: json.user };
  } catch (err: any) {
    console.error('setPlatformUserStatus error:', err);
    return { success: false, error: err.message || 'Network error updating user status' };
  }
}

// ==========================================
// SUPER ADMIN: PLATFORM ANALYTICS (PHASE 8)
// ==========================================

export async function fetchPlatformAnalyticsFromDB(filters?: AnalyticsFilterParams): Promise<{
  success: boolean;
  analytics?: PlatformAnalytics;
  error?: string;
}> {
  try {
    const params = new URLSearchParams();
    if (filters?.dateRange) params.append('dateRange', filters.dateRange);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);

    const query = params.toString() ? `&${params.toString()}` : '';
    const res = await fetch(apiUrl(`/api/db?action=get_platform_analytics${query}`), getRequestOptions('GET'));
    const json = await res.json();
    if (!res.ok || !json.success) {
      return { success: false, error: json.error || 'Failed to fetch platform analytics' };
    }
    return { success: true, analytics: json.analytics };
  } catch (err: any) {
    console.error('fetchPlatformAnalytics error:', err);
    return { success: false, error: err.message || 'Network error fetching platform analytics' };
  }
}

// ==========================================
// REAL-TIME SUBSCRIPTION HELPERS
// ==========================================

export function subscribeToRealtimeChanges(_onUpdate?: () => void) {
  return () => {};
}


