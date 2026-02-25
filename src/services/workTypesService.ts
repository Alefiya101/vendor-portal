import { projectId, publicAnonKey } from '../utils/supabase/info';

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-155272a3`;

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${publicAnonKey}`
};

// Get all work types
export async function getAllWorkTypes(): Promise<string[]> {
  try {
    const response = await fetch(`${API_URL}/kv?key=fabric_work_types`, {
      method: 'GET',
      headers
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.value || [];
  } catch (error) {
    console.error('Error fetching work types:', error);
    return [];
  }
}

// Add new work type
export async function addWorkType(workType: string): Promise<void> {
  try {
    const existingTypes = await getAllWorkTypes();
    
    // Check if already exists (case-insensitive)
    const exists = existingTypes.some(
      type => type.toLowerCase() === workType.toLowerCase()
    );
    
    if (exists) {
      return; // Already exists, no need to add
    }
    
    const updatedTypes = [...existingTypes, workType];
    
    const response = await fetch(`${API_URL}/kv`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ key: 'fabric_work_types', value: updatedTypes })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error adding work type:', error);
    throw error;
  }
}

// Initialize with default work types
export async function initializeDefaultWorkTypes(): Promise<void> {
  try {
    const existing = await getAllWorkTypes();
    
    if (existing.length > 0) {
      return; // Already initialized
    }
    
    const defaultWorkTypes = [
      'Plain',
      'Embroidery',
      'Zari Work',
      'Sequin Work',
      'Mirror Work',
      'Thread Work',
      'Stone Work',
      'Pearl Work',
      'Beadwork',
      'Applique Work',
      'Patchwork',
      'Block Print',
      'Screen Print',
      'Digital Print',
      'Hand Painted',
      'Tie & Dye',
      'Bandhani',
      'Leheriya',
      'Batik',
      'Kalamkari',
      'Ajrakh',
      'Chikankari',
      'Phulkari',
      'Kantha',
      'Gota Patti',
      'Aari Work',
      'Kasuti',
      'Toda',
      'Kutch',
      'Banjara'
    ];
    
    const response = await fetch(`${API_URL}/kv`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ key: 'fabric_work_types', value: defaultWorkTypes })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error initializing default work types:', error);
  }
}
