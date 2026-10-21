import type { Trial, Site, Eligibility, Outcome } from '../data/trials';

// In development, Create React App forwards /api requests to the backend
// using the "proxy" setting in package.json. In production, Firebase Hosting
// rewrites /api/** to the Cloud Function (see firebase.json).
const BASE = process.env.REACT_APP_API_BASE_URL || '';

class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function request<T>(path: string): Promise<T> {
  const response = await fetch(`${BASE}${path}`);

  let body: any = null;
  try {
    body = await response.json();
  } catch {
    body = null;
  }

  if (!response.ok) {
    throw new ApiError(body?.error || `Request failed (${response.status})`, response.status);
  }

  return body as T;
}

const text = (value: unknown): string =>
  value === null || value === undefined ? '' : String(value);

const num = (value: unknown): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const list = <T,>(value: unknown): T[] => (Array.isArray(value) ? (value as T[]) : []);

const unique = (values: string[]): string[] =>
  Array.from(new Set(values.filter(Boolean))).sort((a, b) => a.localeCompare(b));

const normalizeSite = (raw: any): Site => ({
  name: text(raw?.name),
  address: text(raw?.address),
  city: text(raw?.city),
  state: text(raw?.state),
  contactPerson: text(raw?.contactPerson),
  phone: text(raw?.phone)
});

const normalizeEligibility = (raw: any): Eligibility => ({
  minAge: text(raw?.minAge),
  maxAge: text(raw?.maxAge),
  gender: text(raw?.gender),
  inclusionCriteria: text(raw?.inclusionCriteria),
  exclusionCriteria: text(raw?.exclusionCriteria)
});

const normalizeOutcome = (raw: any): Outcome => ({
  type: text(raw?.type),
  name: text(raw?.name),
  timeframe: text(raw?.timeframe)
});

/**
 * Firestore documents may be incomplete. Normalising here keeps the existing
 * pages safe from missing fields (for example an empty eligibility object).
 */
export const normalizeTrial = (raw: any): Trial => ({
  id: text(raw?.id),
  ctriNumber: text(raw?.ctriNumber),
  title: text(raw?.title),
  scientificTitle: text(raw?.scientificTitle),
  phase: text(raw?.phase),
  condition: text(raw?.condition),
  intervention: text(raw?.intervention),
  sponsor: text(raw?.sponsor),
  sponsorType: text(raw?.sponsorType),
  recruitmentStatus: text(raw?.recruitmentStatus),
  enrollmentTarget: num(raw?.enrollmentTarget),
  enrolled: num(raw?.enrolled),
  startDate: text(raw?.startDate),
  completionDate: text(raw?.completionDate),
  studyType: text(raw?.studyType),
  studyDesign: text(raw?.studyDesign),
  allocation: text(raw?.allocation),
  masking: text(raw?.masking),
  principalInvestigator: text(raw?.principalInvestigator),
  piAffiliation: text(raw?.piAffiliation),
  sites: list<any>(raw?.sites).map(normalizeSite),
  eligibility: normalizeEligibility(raw?.eligibility),
  outcomes: list<any>(raw?.outcomes).map(normalizeOutcome),
  briefSummary: text(raw?.briefSummary),
  locations: list<unknown>(raw?.locations).map(text).filter(Boolean),
  state: text(raw?.state),
  district: text(raw?.district),
  contactPerson: text(raw?.contactPerson),
  contactEmail: text(raw?.contactEmail),
  contactPhone: text(raw?.contactPhone),
  ethicsCommittee: text(raw?.ethicsCommittee),
  dcgIApproval: text(raw?.dcgIApproval),
  lastUpdated: text(raw?.lastUpdated),
  sourceUrl: text(raw?.sourceUrl)
});

export interface TrialPagination {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export interface TrialFilters {
  q?: string;
  condition?: string;
  state?: string;
  phase?: string;
  status?: string;
  limit?: number;
  offset?: number;
}

export async function fetchTrials(filters: TrialFilters = {}): Promise<{
  trials: Trial[];
  pagination?: TrialPagination;
}> {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.set(key, String(value));
    }
  });

  const queryString = params.toString();
  const body = await request<{ data?: unknown; pagination?: TrialPagination }>(
    `/api/trials${queryString ? `?${queryString}` : ''}`
  );

  return {
    trials: list<any>(body?.data).map(normalizeTrial),
    pagination: body?.pagination
  };
}

export async function fetchTrial(id: string): Promise<Trial | null> {
  try {
    const body = await request<{ data?: unknown }>(`/api/trials/${encodeURIComponent(id)}`);
    return body?.data ? normalizeTrial(body.data) : null;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

export interface TrialStats {
  total: number;
  recruiting: number;
  conditions: string[];
  states: string[];
  phases: string[];
}

export async function fetchStats(): Promise<TrialStats> {
  const body = await request<{ data?: any }>('/api/trials/stats');
  const data = body?.data || {};

  return {
    total: num(data.total),
    recruiting: num(data.recruiting),
    conditions: unique(list<unknown>(data.conditions).map(text)),
    states: unique(list<unknown>(data.states).map(text)),
    phases: unique(list<unknown>(data.phases).map(text))
  };
}
