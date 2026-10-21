import { auth } from './firebase';

const BASE = process.env.REACT_APP_API_BASE_URL || '';

async function authedRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const user = auth.currentUser;

  if (!user) {
    throw new Error('Please sign in again.');
  }

  const token = await user.getIdToken();

  const response = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(init.headers || {})
    }
  });

  let body: any = null;
  try {
    body = await response.json();
  } catch {
    body = null;
  }

  if (response.status === 403) {
    throw new Error('This account does not have admin access.');
  }

  if (!response.ok) {
    throw new Error(body?.error || `Request failed (${response.status})`);
  }

  return body as T;
}

const text = (value: unknown): string =>
  value === null || value === undefined ? '' : String(value);

export interface PatientQuery {
  id: string;
  patientName: string;
  contactNumber: string;
  email: string;
  whatsappNumber: string;
  queryDetails: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface QueryStats {
  total: number;
  pending: number;
  contacted: number;
  closed: number;
}

export interface QueryStatus {
  id: string;
  status: string;
  updatedAt?: string;
}

const normalizeQuery = (raw: any): PatientQuery => ({
  id: text(raw?.id),
  patientName: text(raw?.patientName),
  contactNumber: text(raw?.contactNumber),
  email: text(raw?.email),
  whatsappNumber: text(raw?.whatsappNumber),
  queryDetails: text(raw?.queryDetails),
  status: text(raw?.status) || 'pending',
  createdAt: text(raw?.createdAt),
  updatedAt: text(raw?.updatedAt)
});

export async function fetchQueries(): Promise<{ queries: PatientQuery[]; returned: number }> {
  const body = await authedRequest<{ data?: unknown; meta?: any }>('/api/queries');

  const queries = (Array.isArray(body?.data) ? body.data : []).map(normalizeQuery);

  return {
    queries,
    returned: body?.meta?.returned ?? queries.length
  };
}

export async function fetchQueryStats(): Promise<QueryStats> {
  const body = await authedRequest<{ data?: any }>('/api/queries/stats');
  const data = body?.data || {};

  const toNumber = (value: unknown) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  return {
    total: toNumber(data.total),
    pending: toNumber(data.pending),
    contacted: toNumber(data.contacted),
    closed: toNumber(data.closed)
  };
}

export async function updateQueryStatus(id: string, status: string): Promise<QueryStatus> {
  const body = await authedRequest<{ data?: any }>(`/api/queries/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  });

  return {
    id: text(body?.data?.id) || id,
    status: text(body?.data?.status) || status,
    updatedAt: text(body?.data?.updatedAt)
  };
}
