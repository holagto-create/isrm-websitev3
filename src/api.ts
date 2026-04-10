// Google Apps Script Web App URL
// Deployed: April 11, 2026
export const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwr_6gh7L-78cotjpIDpOsWxo3Tw6L7S7Gv7ryKyogUJwzj5i1jLy5c-xkB2pLctEZxpA/exec';

export const OFFICER_PASSWORD = 'ISRM2026'; // Officer portal password

export interface URSClient {
  'Record ID': string;
  'Client Name': string;
  'Email': string;
  'Research Title': string;
  'Service Type': string;
  'Payment Status': string;
  'Status': string;
  'URS Share 60% (₱)': number;
  'Drive Folder URL': string;
  'Date': string;
  'Course/Department': string;
  'Total Fee (₱)': number;
  'ORS #': string;
  'Assigned URS': string;
  'Unit Share 40% (₱)': number;
}

export interface URSSummary {
  totalClients: number;
  inProgress: number;
  completed: number;
  newClients: number;
  totalEarnings: number;
}

export interface URSClientResponse {
  success: boolean;
  ursName: string;
  clients: URSClient[];
  summary: URSSummary;
}

export interface ValidationResponse {
  success: boolean;
  valid: boolean;
  name?: string;
  message?: string;
}

export interface DashboardData {
  clients: URSClient[];
  urs: any[];
  financial: {
    grossFees: number;
    ursHonoraria: number;
    unitShare: number;
    paidCount: number;
    pendingCount: number;
    completedCount: number;
    inProgressCount: number;
    newCount: number;
    totalCount: number;
  };
}

export interface UpdateStatusResponse {
  success: boolean;
  message: string;
  recordId?: string;
  status?: string;
  notesAdded?: boolean;
}

// Call Google Apps Script Web App API
async function callScriptAPI<T>(action: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(SCRIPT_URL);
  url.searchParams.set('action', action);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }
  
  return response.json();
}

// Validate URS credentials
export async function validateURSCredentials(name: string, email: string, password: string): Promise<ValidationResponse> {
  return callScriptAPI<ValidationResponse>('validateURSCredentials', { name, email, password });
}

// Get clients for a specific URS
export async function getURSClients(ursName: string): Promise<URSClientResponse> {
  return callScriptAPI<URSClientResponse>('getURSClients', { ursName });
}

// Get all dashboard data (for Officer)
export async function getDashboardData(): Promise<DashboardData> {
  return callScriptAPI<DashboardData>('getDashboardData');
}

// Update client status (for URS)
export async function updateClientStatus(recordId: string, status: string, notes?: string): Promise<UpdateStatusResponse> {
  try {
    const response = await fetch(SCRIPT_URL, {
      method: 'POST',
      mode: 'cors',
      redirect: 'follow',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        action: 'updateClientStatus',
        recordId,
        status,
        notes: notes || ''
      })
    });
    
    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch {
      return { success: false, message: text || 'Failed to parse response' };
    }
  } catch (err: any) {
    throw new Error(err.message || 'Network error');
  }
}