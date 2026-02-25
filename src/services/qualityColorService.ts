import { projectId, publicAnonKey } from '../utils/supabase/info';

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-155272a3`;

export interface ColorOption {
  number: string;
  name: string;
  hexCode?: string;
  sampleImage?: string;
  pantoneCode?: string;
  fabricType?: string;
  notes?: string;
}

export interface Quality {
  id: string;
  name: string;
  description?: string;
  colors: ColorOption[];
  createdAt: string;
}

export interface ProcessCost {
  id: string;
  name: string;
  defaultCost: number;
  isOptional: boolean;
}

// Default process costs based on the handwritten list
export const DEFAULT_PROCESS_COSTS: ProcessCost[] = [
  { id: 'fabric', name: 'Fabric', defaultCost: 0, isOptional: true },
  { id: 'fusing', name: 'Fusing', defaultCost: 0, isOptional: true },
  { id: 'stitching', name: 'Stitching', defaultCost: 0, isOptional: true },
  { id: 'stone', name: 'Stone', defaultCost: 0, isOptional: true },
  { id: 'handwork', name: 'Handwork', defaultCost: 0, isOptional: true },
  { id: 'hanger', name: 'Hanger', defaultCost: 0, isOptional: true },
  { id: 'cover', name: 'Cover', defaultCost: 0, isOptional: true },
  { id: 'packing', name: 'Packing', defaultCost: 0, isOptional: true },
  { id: 'transportation', name: 'Transportation', defaultCost: 0, isOptional: true },
  { id: 'designer', name: 'Designer', defaultCost: 0, isOptional: true },
];

// Get all qualities
export async function getAllQualities(): Promise<Quality[]> {
  try {
    const response = await fetch(`${API_URL}/kv?key=qualities`, {
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch qualities');
    }

    const data = await response.json();
    return data.value || [];
  } catch (error) {
    console.error('Error fetching qualities:', error);
    return [];
  }
}

// Get quality by ID
export async function getQualityById(qualityId: string): Promise<Quality | null> {
  try {
    const qualities = await getAllQualities();
    return qualities.find(q => q.id === qualityId) || null;
  } catch (error) {
    console.error('Error fetching quality:', error);
    return null;
  }
}

// Create new quality
export async function createQuality(quality: Omit<Quality, 'id' | 'createdAt'>): Promise<Quality> {
  try {
    const newQuality: Quality = {
      ...quality,
      id: `QUAL-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    const qualities = await getAllQualities();
    qualities.unshift(newQuality);

    const response = await fetch(`${API_URL}/kv`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify({
        key: 'qualities',
        value: qualities,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create quality');
    }

    return newQuality;
  } catch (error) {
    console.error('Error creating quality:', error);
    throw error;
  }
}

// Update quality
export async function updateQuality(qualityId: string, updates: Partial<Quality>): Promise<Quality> {
  try {
    const qualities = await getAllQualities();
    const index = qualities.findIndex(q => q.id === qualityId);

    if (index === -1) {
      throw new Error('Quality not found');
    }

    qualities[index] = { ...qualities[index], ...updates };

    const response = await fetch(`${API_URL}/kv`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify({
        key: 'qualities',
        value: qualities,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to update quality');
    }

    return qualities[index];
  } catch (error) {
    console.error('Error updating quality:', error);
    throw error;
  }
}

// Delete quality
export async function deleteQuality(qualityId: string): Promise<void> {
  try {
    const qualities = await getAllQualities();
    const filtered = qualities.filter(q => q.id !== qualityId);

    const response = await fetch(`${API_URL}/kv`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify({
        key: 'qualities',
        value: filtered,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to delete quality');
    }
  } catch (error) {
    console.error('Error deleting quality:', error);
    throw error;
  }
}

// Get colors for a specific quality
export async function getColorsForQuality(qualityId: string): Promise<ColorOption[]> {
  try {
    const quality = await getQualityById(qualityId);
    return quality?.colors || [];
  } catch (error) {
    console.error('Error fetching colors for quality:', error);
    return [];
  }
}

// Add color to quality
export async function addColorToQuality(qualityId: string, color: ColorOption): Promise<Quality> {
  try {
    const quality = await getQualityById(qualityId);
    if (!quality) {
      throw new Error('Quality not found');
    }

    quality.colors.push(color);
    return await updateQuality(qualityId, { colors: quality.colors });
  } catch (error) {
    console.error('Error adding color to quality:', error);
    throw error;
  }
}

// Remove color from quality
export async function removeColorFromQuality(qualityId: string, colorNumber: string): Promise<Quality> {
  try {
    const quality = await getQualityById(qualityId);
    if (!quality) {
      throw new Error('Quality not found');
    }

    quality.colors = quality.colors.filter(c => c.number !== colorNumber);
    return await updateQuality(qualityId, { colors: quality.colors });
  } catch (error) {
    console.error('Error removing color from quality:', error);
    throw error;
  }
}

// Bulk import qualities from CSV
export async function bulkImportQualities(formData: FormData): Promise<void> {
  try {
    const file = formData.get('file') as File;
    if (!file) {
      throw new Error('No file provided');
    }

    const text = await file.text();
    const lines = text.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      throw new Error('CSV file must contain at least a header row and one data row');
    }

    // Skip header row
    const dataLines = lines.slice(1);
    
    // Parse CSV and group by quality
    const qualityMap = new Map<string, { name: string; description: string; colors: ColorOption[] }>();
    
    dataLines.forEach(line => {
      // Parse CSV line (handle quoted fields)
      const regex = /("([^"]*)"|([^,]*))/g;
      const fields: string[] = [];
      let match;
      
      while ((match = regex.exec(line)) !== null) {
        fields.push(match[2] || match[3] || '');
      }
      
      if (fields.length >= 2) {
        const [qualityName, description, colorNumber, colorName, hexCode, sampleImage, pantoneCode, fabricType, notes] = fields;
        
        if (!qualityMap.has(qualityName)) {
          qualityMap.set(qualityName, {
            name: qualityName.trim(),
            description: description?.trim() || '',
            colors: []
          });
        }
        
        if (colorNumber && colorName) {
          const quality = qualityMap.get(qualityName)!;
          quality.colors.push({
            number: colorNumber.trim(),
            name: colorName.trim(),
            hexCode: hexCode?.trim() || undefined,
            sampleImage: sampleImage?.trim() || undefined,
            pantoneCode: pantoneCode?.trim() || undefined,
            fabricType: fabricType?.trim() || undefined,
            notes: notes?.trim() || undefined
          });
        }
      }
    });

    // Get existing qualities
    const existingQualities = await getAllQualities();
    
    // Create new qualities
    for (const [qualityName, qualityData] of qualityMap.entries()) {
      // Check if quality already exists
      const existing = existingQualities.find(q => q.name.toLowerCase() === qualityName.toLowerCase());
      
      if (existing) {
        // Merge colors (avoid duplicates)
        const existingColorNumbers = new Set(existing.colors.map(c => c.number));
        const newColors = qualityData.colors.filter(c => !existingColorNumbers.has(c.number));
        
        if (newColors.length > 0) {
          await updateQuality(existing.id, {
            colors: [...existing.colors, ...newColors]
          });
        }
      } else {
        // Create new quality
        await createQuality({
          name: qualityData.name,
          description: qualityData.description,
          colors: qualityData.colors
        });
      }
    }
  } catch (error) {
    console.error('Error bulk importing qualities:', error);
    throw error;
  }
}

// Predefined color palette for quick selection
export const PREDEFINED_COLORS = [
  // Basic Colors
  { name: 'White', hexCode: '#FFFFFF' },
  { name: 'Black', hexCode: '#000000' },
  { name: 'Red', hexCode: '#FF0000' },
  { name: 'Blue', hexCode: '#0000FF' },
  { name: 'Green', hexCode: '#00FF00' },
  { name: 'Yellow', hexCode: '#FFFF00' },
  { name: 'Orange', hexCode: '#FFA500' },
  { name: 'Purple', hexCode: '#800080' },
  { name: 'Pink', hexCode: '#FFC0CB' },
  { name: 'Brown', hexCode: '#A52A2A' },
  { name: 'Gray', hexCode: '#808080' },
  { name: 'Navy', hexCode: '#000080' },
  
  // Indian Ethnic Fashion Colors
  { name: 'Mustard Yellow', hexCode: '#FFB800' },
  { name: 'Maroon', hexCode: '#800000' },
  { name: 'Rust', hexCode: '#B7410E' },
  { name: 'Teal', hexCode: '#008080' },
  { name: 'Emerald Green', hexCode: '#50C878' },
  { name: 'Royal Blue', hexCode: '#4169E1' },
  { name: 'Peacock Blue', hexCode: '#33A1C9' },
  { name: 'Magenta', hexCode: '#FF00FF' },
  { name: 'Fuchsia', hexCode: '#FF77FF' },
  { name: 'Gold', hexCode: '#FFD700' },
  { name: 'Silver', hexCode: '#C0C0C0' },
  { name: 'Beige', hexCode: '#F5F5DC' },
  { name: 'Cream', hexCode: '#FFFDD0' },
  { name: 'Ivory', hexCode: '#FFFFF0' },
  { name: 'Coral', hexCode: '#FF7F50' },
  { name: 'Peach', hexCode: '#FFDAB9' },
  { name: 'Mint Green', hexCode: '#98FF98' },
  { name: 'Lavender', hexCode: '#E6E6FA' },
  { name: 'Burgundy', hexCode: '#800020' },
  { name: 'Wine', hexCode: '#722F37' },
  { name: 'Olive', hexCode: '#808000' },
  { name: 'Khaki', hexCode: '#C3B091' },
  { name: 'Tan', hexCode: '#D2B48C' },
  { name: 'Sage Green', hexCode: '#9DC183' },
  { name: 'Turquoise', hexCode: '#40E0D0' },
  { name: 'Aqua', hexCode: '#00FFFF' },
  { name: 'Sky Blue', hexCode: '#87CEEB' },
  { name: 'Indigo', hexCode: '#4B0082' },
  { name: 'Violet', hexCode: '#EE82EE' },
  { name: 'Rose', hexCode: '#FF007F' },
  { name: 'Cherry Red', hexCode: '#DE3163' },
  { name: 'Crimson', hexCode: '#DC143C' },
  { name: 'Scarlet', hexCode: '#FF2400' },
  { name: 'Vermillion', hexCode: '#E34234' },
  { name: 'Tangerine', hexCode: '#F28500' },
  { name: 'Saffron', hexCode: '#F4C430' },
  { name: 'Lemon', hexCode: '#FFF700' },
  { name: 'Lime', hexCode: '#BFFF00' },
  { name: 'Chartreuse', hexCode: '#7FFF00' },
  { name: 'Forest Green', hexCode: '#228B22' },
  { name: 'Pine Green', hexCode: '#01796F' },
  { name: 'Sea Green', hexCode: '#2E8B57' },
  { name: 'Jade', hexCode: '#00A86B' },
  { name: 'Mint', hexCode: '#3EB489' },
  { name: 'Cyan', hexCode: '#00FFFF' },
  { name: 'Cerulean', hexCode: '#007BA7' },
  { name: 'Cobalt', hexCode: '#0047AB' },
  { name: 'Sapphire', hexCode: '#0F52BA' },
  { name: 'Periwinkle', hexCode: '#CCCCFF' },
  { name: 'Lilac', hexCode: '#C8A2C8' },
  { name: 'Mauve', hexCode: '#E0B0FF' },
  { name: 'Plum', hexCode: '#DDA0DD' },
  { name: 'Orchid', hexCode: '#DA70D6' },
  { name: 'Raspberry', hexCode: '#E30B5C' },
  { name: 'Salmon', hexCode: '#FA8072' },
  { name: 'Apricot', hexCode: '#FBCEB1' },
  { name: 'Honey', hexCode: '#FFB30F' },
  { name: 'Amber', hexCode: '#FFBF00' },
  { name: 'Bronze', hexCode: '#CD7F32' },
  { name: 'Copper', hexCode: '#B87333' },
  { name: 'Rust Orange', hexCode: '#C83803' },
  { name: 'Terracotta', hexCode: '#E2725B' },
  { name: 'Burnt Orange', hexCode: '#CC5500' },
  { name: 'Burnt Sienna', hexCode: '#E97451' },
  { name: 'Chocolate', hexCode: '#D2691E' },
  { name: 'Chestnut', hexCode: '#954535' },
  { name: 'Mahogany', hexCode: '#C04000' },
  { name: 'Espresso', hexCode: '#4E312D' },
  { name: 'Taupe', hexCode: '#483C32' },
  { name: 'Charcoal', hexCode: '#36454F' },
  { name: 'Slate', hexCode: '#708090' },
  { name: 'Ash Gray', hexCode: '#B2BEB5' },
  { name: 'Pearl', hexCode: '#F0EAD6' },
  { name: 'Champagne', hexCode: '#F7E7CE' },
  { name: 'Off White', hexCode: '#FAF9F6' },
  { name: 'Eggshell', hexCode: '#F0EAD6' },
  { name: 'Vanilla', hexCode: '#F3E5AB' }
];