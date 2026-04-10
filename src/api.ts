// Google Apps Script Web App URL
// Deployed: April 11, 2026
export const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzwUtqQ8uIumhqR2OePgNOH7OpVInhBbX-f5QJSXIbjISlZ_MDq3xHdRhmOCSMEeaEamQ/exec';

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
export async function validateURSCredentials(name: string, email: string): Promise<ValidationResponse> {
  return callScriptAPI<ValidationResponse>('validateURSCredentials', { name, email });
}

// Get clients for a specific URS
export async function getURSClients(ursName: string): Promise<URSClientResponse> {
  return callScriptAPI<URSClientResponse>('getURSClients', { ursName });
}