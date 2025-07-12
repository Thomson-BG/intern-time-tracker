// src/utils/adminCredentialsApi.ts

// Use Apps Script URL from environment variable
const SCRIPT_URL = import.meta.env.VITE_TIME_TRACKER_API as string;

export interface AdminCredential {
  fullName: string;
  email: string;
  loginName: string;
  password: string;
  role: 'Admin' | 'Manager';
  active: boolean;
}

export interface LoginResult {
  success: boolean;
  role?: 'Admin' | 'Manager';
  fullName?: string;
  email?: string;
}

/**
 * Validate login credentials against Google Sheets "Admin Credentials" sheet
 */
export async function validateCredentials(loginName: string, password: string): Promise<LoginResult> {
  if (!SCRIPT_URL) {
    throw new Error('TIME_TRACKER_API is not configured. Please check your environment variables.');
  }

  try {
    const response = await fetch(`${SCRIPT_URL}?type=credentials`);
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!Array.isArray(data)) {
      throw new Error("Invalid data format received from credentials data source");
    }

    // Find matching credential (data format: [fullName, email, loginName, password, role, active])
    const credential = data.find((row: any[]) => {
      const [fullName, email, rowLoginName, rowPassword, role, active] = row;
      return rowLoginName === loginName && rowPassword === password && active === true;
    });

    if (credential) {
      const [fullName, email, rowLoginName, rowPassword, role, active] = credential;
      return {
        success: true,
        role: role as 'Admin' | 'Manager',
        fullName,
        email
      };
    }

    return { success: false };
  } catch (error) {
    console.error('Error validating credentials:', error);
    throw error;
  }
}

/**
 * Create a new admin or manager account in Google Sheets
 */
export async function createCredential(credential: AdminCredential): Promise<void> {
  if (!SCRIPT_URL) {
    throw new Error('TIME_TRACKER_API is not configured. Please check your environment variables.');
  }

  try {
    const credentialEntry = {
      type: 'credential',
      fullName: credential.fullName,
      email: credential.email,
      loginName: credential.loginName,
      password: credential.password,
      role: credential.role,
      active: credential.active
    };

    const response = await fetch(SCRIPT_URL, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'text/plain, application/json'
      },
      body: JSON.stringify(credentialEntry),
      mode: 'cors',
      credentials: 'omit'
    });
    
    if (!response.ok) {
      let errorMessage = `API error: ${response.status} ${response.statusText}`;
      try {
        const errorText = await response.text();
        if (errorText) {
          errorMessage += ` - ${errorText}`;
        }
      } catch (e) {
        // Ignore errors reading response body
      }
      throw new Error(errorMessage);
    }
  } catch (error) {
    console.error('Error creating credential:', error);
    throw error;
  }
}

/**
 * Get all admin credentials for management
 */
export async function getAllCredentials(): Promise<AdminCredential[]> {
  if (!SCRIPT_URL) {
    throw new Error('TIME_TRACKER_API is not configured. Please check your environment variables.');
  }

  try {
    const response = await fetch(`${SCRIPT_URL}?type=credentials`);
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!Array.isArray(data)) {
      throw new Error("Invalid data format received from credentials data source");
    }

    return data.map((row: any[]) => ({
      fullName: row[0],
      email: row[1],
      loginName: row[2],
      password: row[3],
      role: row[4] as 'Admin' | 'Manager',
      active: row[5] === true || row[5] === 'TRUE' || row[5] === 'true'
    }));
  } catch (error) {
    console.error('Error fetching credentials:', error);
    throw error;
  }
}

/**
 * Delete/deactivate a credential
 */
export async function deactivateCredential(loginName: string): Promise<void> {
  if (!SCRIPT_URL) {
    throw new Error('TIME_TRACKER_API is not configured. Please check your environment variables.');
  }

  try {
    const deactivateEntry = {
      type: 'deactivate_credential',
      loginName: loginName
    };

    const response = await fetch(SCRIPT_URL, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'text/plain, application/json'
      },
      body: JSON.stringify(deactivateEntry),
      mode: 'cors',
      credentials: 'omit'
    });
    
    if (!response.ok) {
      let errorMessage = `API error: ${response.status} ${response.statusText}`;
      try {
        const errorText = await response.text();
        if (errorText) {
          errorMessage += ` - ${errorText}`;
        }
      } catch (e) {
        // Ignore errors reading response body
      }
      throw new Error(errorMessage);
    }
  } catch (error) {
    console.error('Error deactivating credential:', error);
    throw error;
  }
}