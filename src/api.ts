// Google Apps Script Web App URL
// Deployed: April 11, 2026
export const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxWRpK0GMJU--FwmMiz8pLpGDLBEVUoBZYO4_MN0dVjU_xjmtHFYOJmm5ITO8DNXTxZwA/exec';

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
    console.log('Sending update request:', { action: 'updateClientStatus', recordId, status, notes });
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
    
    console.log('Response status:', response.status);
    const text = await response.text();
    console.log('Response text:', text);
    
    // Check if response is empty or not valid JSON
    if (!text || text.trim() === '') {
      return { success: false, message: 'Empty response from server' };
    }
    
    try {
      return JSON.parse(text);
    } catch {
      return { success: false, message: 'Failed to parse response: ' + text.substring(0, 200) };
    }
  } catch (err: any) {
    console.error('Fetch error:', err);
    throw new Error(err.message || 'Network error: ' + err.toString());
  }
}

// Content APIs - fetch from Google Sheets

export interface Announcement {
  id: number;
  type: string;
  badge: string;
  date: string;
  title: string;
  body: string;
}

export interface LiveUpdate {
  id: number;
  title: string;
  description: string;
  link: string;
  date: string;
  category: string;
}

export interface Resource {
  id: number;
  category: string;
  title: string;
  description: string;
  link: string;
  tags: string[];
}

// Call Google Apps Script Web App API (GET requests)
async function callScriptAPIGet<T>(action: string): Promise<T> {
  const url = new URL(SCRIPT_URL);
  url.searchParams.set('action', action);
  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }
  return response.json();
}

export async function getAnnouncements(): Promise<{ success: boolean; announcements: Announcement[] }> {
  return callScriptAPIGet<{ success: boolean; announcements: Announcement[] }>('getAnnouncements');
}

export async function getLiveUpdates(): Promise<{ success: boolean; updates: LiveUpdate[] }> {
  return callScriptAPIGet<{ success: boolean; updates: LiveUpdate[] }>('getLiveUpdates');
}

export async function getResources(): Promise<{ success: boolean; resources: Resource[] }> {
  return callScriptAPIGet<{ success: boolean; resources: Resource[] }>('getResources');
}