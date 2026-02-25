import React, { useState, useEffect } from 'react';
import { Palette, Plus, Edit, Trash2, Save, X, AlertCircle, Hash, Droplet, Upload, Download, BarChart3, Image as ImageIcon, TrendingUp } from 'lucide-react';
import * as qualityColorService from '../services/qualityColorService';
import { toast } from 'sonner@2.0.3';
import { LoadingSpinner, ButtonWithLoading, TableSkeleton } from './LoadingSpinner';
import { sanitizeString, validateRequiredFields } from '../utils/security';
import { ImageUpload } from './ImageUpload';
import * as offlineOrderService from '../services/offlineOrderService';

export function QualityColorManagement() {
  const [qualities, setQualities] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showAddQuality, setShowAddQuality] = useState(false);
  const [editingQuality, setEditingQuality] = useState<any>(null);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [colorUsageData, setColorUsageData] = useState<any[]>([]);

  useEffect(() => {
    loadQualities();
    loadColorUsageAnalytics();
  }, []);

  const loadQualities = async () => {
    try {
      setLoading(true);
      const data = await qualityColorService.getAllQualities();
      setQualities(data);
    } catch (err) {
      console.error('Failed to load qualities:', err);
      toast.error('Failed to load qualities');
    } finally {
      setLoading(false);
    }
  };

  const loadColorUsageAnalytics = async () => {
    try {
      // Load all offline orders to analyze color usage
      const orders = await offlineOrderService.getAllOfflineOrders();
      const usageMap = new Map<string, { quality: string; colorNumber: string; colorName: string; count: number }>();

      orders.forEach(order => {
        order.items?.forEach((item: any) => {
          if (item.qualityId && item.colorNumber) {
            const key = `${item.qualityId}-${item.colorNumber}`;
            if (usageMap.has(key)) {
              const existing = usageMap.get(key)!;
              existing.count += item.quantity || 1;
            } else {
              usageMap.set(key, {
                quality: item.quality || '',
                colorNumber: item.colorNumber,
                colorName: item.fabricColor || '',
                count: item.quantity || 1
              });
            }
          }
        });
      });

      const sortedData = Array.from(usageMap.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, 20); // Top 20 colors

      setColorUsageData(sortedData);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    }
  };

  const handleDeleteQuality = async (qualityId: string, qualityName: string) => {
    if (!confirm(`Delete quality "${qualityName}"? This cannot be undone.`)) return;
    
    try {
      setActionLoading(qualityId);
      await qualityColorService.deleteQuality(qualityId);
      toast.success('Quality deleted successfully');
      loadQualities();
    } catch (err) {
      console.error('Failed to delete quality:', err);
      toast.error('Failed to delete quality');
    } finally {
      setActionLoading(null);
    }
  };

  const handleExportCSV = () => {
    try {
      let csv = 'Quality Name,Quality Description,Color Number,Color Name,Hex Code,Sample Image URL\n';
      
      qualities.forEach(quality => {
        if (quality.colors && quality.colors.length > 0) {
          quality.colors.forEach((color: any) => {
            csv += `"${quality.name}","${quality.description || ''}","${color.number}","${color.name}","${color.hexCode || ''}","${color.sampleImage || ''}"\n`;
          });
        } else {
          csv += `"${quality.name}","${quality.description || ''}","","","",""\n`;
        }
      });

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `qualities-colors-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('CSV exported successfully');
    } catch (err) {
      console.error('Export failed:', err);
      toast.error('Failed to export CSV');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Quality & Color Management</h2>
            <p className="text-sm text-gray-600">Manage fabric qualities and their color options</p>
          </div>
        </div>
        <TableSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Quality & Color Management</h2>
          <p className="text-sm text-gray-600">Manage fabric qualities and their numbered color options</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAnalytics(!showAnalytics)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm hover:shadow"
          >
            <BarChart3 className="w-4 h-4" strokeWidth={2} />
            {showAnalytics ? 'Hide Analytics' : 'Color Analytics'}
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm hover:shadow"
          >
            <Download className="w-4 h-4" strokeWidth={2} />
            Export CSV
          </button>
          <button
            onClick={() => setShowBulkImport(true)}
            className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors shadow-sm hover:shadow"
          >
            <Upload className="w-4 h-4" strokeWidth={2} />
            Bulk Import
          </button>
          <button
            onClick={() => setShowAddQuality(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-sm hover:shadow"
          >
            <Plus className="w-4 h-4" strokeWidth={2} />
            Add Quality
          </button>
        </div>
      </div>

      {/* Color Usage Analytics */}
      {showAnalytics && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-indigo-600" strokeWidth={2} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Color Usage Analytics</h3>
              <p className="text-sm text-gray-600">Top 20 most used colors across all orders</p>
            </div>
          </div>

          {colorUsageData.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No color usage data available yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Rank</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Quality</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Color</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Usage Count</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Usage %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {colorUsageData.map((item, index) => {
                    const totalUsage = colorUsageData.reduce((sum, d) => sum + d.count, 0);
                    const percentage = ((item.count / totalUsage) * 100).toFixed(1);
                    return (
                      <tr key={`${item.quality}-${item.colorNumber}`} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-semibold text-sm ${
                            index === 0 ? 'bg-yellow-100 text-yellow-700' :
                            index === 1 ? 'bg-gray-200 text-gray-700' :
                            index === 2 ? 'bg-orange-100 text-orange-700' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            #{index + 1}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.quality}</td>
                        <td className="px-4 py-3">
                          <div className="text-sm">
                            <span className="font-semibold text-gray-900">#{item.colorNumber}</span>
                            <span className="text-gray-600 ml-2">{item.colorName}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-indigo-600">{item.count}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[100px]">
                              <div 
                                className="bg-indigo-600 h-2 rounded-full" 
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium text-gray-700">{percentage}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Info Banner */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Palette className="w-5 h-5 text-purple-600" strokeWidth={2} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">Quality-Color System</h3>
            <p className="text-sm text-gray-700">
              Create qualities (e.g., "Premium Silk", "Cotton Blend") and assign numbered colors (e.g., #1 Mustard Yellow, #2 Navy Blue). 
              When creating orders, first select quality, then choose from its numbered colors. You can now add color sample images!
            </p>
          </div>
        </div>
      </div>

      {/* Qualities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {qualities.map((quality) => (
          <QualityCard
            key={quality.id}
            quality={quality}
            onEdit={() => setEditingQuality(quality)}
            onDelete={() => handleDeleteQuality(quality.id, quality.name)}
            onRefresh={loadQualities}
            isDeleting={actionLoading === quality.id}
          />
        ))}
      </div>

      {qualities.length === 0 && !loading && (
        <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-gray-300">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Palette className="w-8 h-8 text-purple-600" strokeWidth={2} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No qualities found</h3>
          <p className="text-gray-500 mb-4">Add your first quality to get started with the color numbering system</p>
          <button
            onClick={() => setShowAddQuality(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <Plus className="w-4 h-4" />
            Add First Quality
          </button>
        </div>
      )}

      {/* Add/Edit Quality Modal */}
      {(showAddQuality || editingQuality) && (
        <QualityModal
          quality={editingQuality}
          onClose={() => {
            setShowAddQuality(false);
            setEditingQuality(null);
          }}
          onSave={async (data) => {
            try {
              // Validate and sanitize
              const validation = validateRequiredFields(data, ['name']);
              if (!validation.valid) {
                toast.error(`Missing required fields: ${validation.missing.join(', ')}`);
                return;
              }

              const sanitizedData = {
                name: sanitizeString(data.name),
                description: data.description ? sanitizeString(data.description) : '',
                colors: data.colors || []
              };

              if (editingQuality) {
                setActionLoading('modal');
                await qualityColorService.updateQuality(editingQuality.id, sanitizedData);
                toast.success('Quality updated successfully');
              } else {
                setActionLoading('modal');
                await qualityColorService.createQuality(sanitizedData);
                toast.success('Quality created successfully');
              }
              loadQualities();
              loadColorUsageAnalytics();
              setShowAddQuality(false);
              setEditingQuality(null);
            } catch (err) {
              console.error('Failed to save quality:', err);
              toast.error('Failed to save quality');
            } finally {
              setActionLoading(null);
            }
          }}
          isSaving={actionLoading === 'modal'}
        />
      )}

      {/* Bulk Import Modal */}
      {showBulkImport && (
        <BulkImportModal
          onClose={() => setShowBulkImport(false)}
          onImportComplete={() => {
            loadQualities();
            loadColorUsageAnalytics();
            setShowBulkImport(false);
          }}
        />
      )}
    </div>
  );
}

function QualityCard({ quality, onEdit, onDelete, onRefresh, isDeleting }: any) {
  const [showAddColor, setShowAddColor] = useState(false);
  const [newColor, setNewColor] = useState({ number: '', name: '', hexCode: '', sampleImage: '', pantoneCode: '', fabricType: '', notes: '' });
  const [showPredefinedColors, setShowPredefinedColors] = useState(false);

  const handleAddColor = async () => {
    // Validate required fields
    const missingFields: string[] = [];
    
    if (!newColor.number || !newColor.number.trim()) {
      missingFields.push('Color Number');
    }
    
    if (!newColor.name || !newColor.name.trim()) {
      missingFields.push('Color Name');
    }
    
    if (missingFields.length > 0) {
      toast.error(`Missing required fields: ${missingFields.join(', ')}`);
      return;
    }

    // Validate color number format (should be numeric or alphanumeric)
    if (!/^[a-zA-Z0-9]+$/.test(newColor.number.trim())) {
      toast.error('Color Number should contain only letters and numbers (e.g., 1, 2, A1, B2)');
      return;
    }

    // Check for duplicate color number in this quality
    const isDuplicate = quality.colors?.some((c: any) => c.number === newColor.number.trim());
    if (isDuplicate) {
      toast.error(`Color #${newColor.number} already exists in this quality`);
      return;
    }

    try {
      // Sanitize color data
      const sanitizedColor = {
        number: sanitizeString(newColor.number.trim()),
        name: sanitizeString(newColor.name.trim()),
        hexCode: newColor.hexCode ? sanitizeString(newColor.hexCode.trim()) : undefined,
        sampleImage: newColor.sampleImage ? sanitizeString(newColor.sampleImage.trim()) : undefined,
        pantoneCode: newColor.pantoneCode ? sanitizeString(newColor.pantoneCode.trim()) : undefined,
        fabricType: newColor.fabricType ? sanitizeString(newColor.fabricType.trim()) : undefined,
        notes: newColor.notes ? sanitizeString(newColor.notes.trim()) : undefined
      };

      await qualityColorService.addColorToQuality(quality.id, sanitizedColor);
      toast.success(`Color #${sanitizedColor.number} added successfully!`);
      setNewColor({ number: '', name: '', hexCode: '', sampleImage: '', pantoneCode: '', fabricType: '', notes: '' });
      setShowAddColor(false);
      setShowPredefinedColors(false);
      onRefresh();
    } catch (err: any) {
      console.error('Failed to add color:', err);
      toast.error(err.message || 'Failed to add color');
    }
  };

  const handleRemoveColor = async (colorNumber: string) => {
    if (confirm('Remove this color?')) {
      try {
        await qualityColorService.removeColorFromQuality(quality.id, colorNumber);
        toast.success('Color removed');
        onRefresh();
      } catch (err) {
        toast.error('Failed to remove color');
      }
    }
  };

  const selectPredefinedColor = (predefinedColor: any) => {
    setNewColor({
      ...newColor,
      name: predefinedColor.name,
      hexCode: predefinedColor.hexCode
    });
    setShowPredefinedColors(false);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{quality.name}</h3>
          {quality.description && (
            <p className="text-sm text-gray-600 mt-1">{quality.description}</p>
          )}
          <p className="text-xs text-gray-500 mt-2">
            Created: {new Date(quality.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onEdit}
            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
            title="Edit Quality"
          >
            <Edit className="w-4 h-4" />
          </button>
          <ButtonWithLoading
            onClick={onDelete}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
            isLoading={isDeleting}
            title="Delete Quality"
          >
            <Trash2 className="w-4 h-4" />
          </ButtonWithLoading>
        </div>
      </div>

      {/* Colors Grid */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Palette className="w-4 h-4 text-purple-600" />
            Colors ({quality.colors?.length || 0})
          </h4>
          <button
            onClick={() => setShowAddColor(!showAddColor)}
            className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-700 font-medium px-2 py-1 hover:bg-purple-50 rounded transition-colors"
          >
            {showAddColor ? <X className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
            {showAddColor ? 'Cancel' : 'Add Color'}
          </button>
        </div>

        {showAddColor && (
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-4 rounded-lg border border-purple-200 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Color # <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., 1, 2, 3"
                  value={newColor.number}
                  onChange={(e) => setNewColor({ ...newColor, number: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Pantone (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g., 123C"
                  value={newColor.pantoneCode}
                  onChange={(e) => setNewColor({ ...newColor, pantoneCode: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Color Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g., Mustard Yellow"
                  value={newColor.name}
                  onChange={(e) => setNewColor({ ...newColor, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 pr-16"
                />
                <button
                  onClick={() => setShowPredefinedColors(!showPredefinedColors)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-purple-600 hover:text-purple-700 font-medium"
                >
                  {showPredefinedColors ? 'Hide' : 'Pick'} 🎨
                </button>
              </div>
            </div>

            {showPredefinedColors && (
              <div className="max-h-40 overflow-y-auto bg-white rounded-lg border border-purple-200 p-2">
                <div className="grid grid-cols-3 gap-1">
                  {qualityColorService.PREDEFINED_COLORS.map((color, idx) => (
                    <button
                      key={idx}
                      onClick={() => selectPredefinedColor(color)}
                      className="flex items-center gap-1 px-2 py-1 text-xs hover:bg-purple-50 rounded transition-colors"
                      title={color.hexCode}
                    >
                      <div 
                        className="w-3 h-3 rounded border border-gray-300 flex-shrink-0"
                        style={{ backgroundColor: color.hexCode }}
                      />
                      <span className="truncate text-left">{color.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Hex Code (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g., #FFB800"
                  value={newColor.hexCode}
                  onChange={(e) => setNewColor({ ...newColor, hexCode: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Fabric Type (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g., Silk, Cotton"
                  value={newColor.fabricType}
                  onChange={(e) => setNewColor({ ...newColor, fabricType: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Notes (Optional)
              </label>
              <input
                type="text"
                placeholder="Additional details..."
                value={newColor.notes}
                onChange={(e) => setNewColor({ ...newColor, notes: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-xs font-medium text-gray-700">
                Color Sample Image (Optional)
              </label>
              <ImageUpload
                onUpload={(url) => setNewColor({ ...newColor, sampleImage: url })}
                currentImage={newColor.sampleImage}
                folder="color-samples"
              />
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-2">
              <p className="text-xs text-amber-800">
                <span className="text-red-500 font-bold">*</span> Required fields must be filled
              </p>
            </div>
            
            <button
              onClick={handleAddColor}
              className="w-full px-3 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 flex items-center justify-center gap-2 shadow-sm hover:shadow"
            >
              <Plus className="w-4 h-4" />
              Add Color to Quality
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 gap-2 max-h-80 overflow-y-auto pr-1">
          {quality.colors?.map((color: any) => (
            <div
              key={color.number}
              className="flex items-start justify-between p-3 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-200 group hover:border-purple-300 hover:shadow-sm transition-all"
            >
              <div className="flex items-start gap-3 flex-1">
                {/* Color Swatch */}
                <div className="flex-shrink-0">
                  {color.sampleImage ? (
                    <img 
                      src={color.sampleImage} 
                      alt={color.name}
                      className="w-12 h-12 rounded-lg border-2 border-gray-300 object-cover"
                    />
                  ) : color.hexCode ? (
                    <div
                      className="w-12 h-12 rounded-lg border-2 border-gray-300 shadow-inner"
                      style={{ backgroundColor: color.hexCode }}
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-100">
                      <Droplet className="w-5 h-5 text-gray-400" />
                    </div>
                  )}
                </div>
                
                {/* Color Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-700">
                      #{color.number}
                    </span>
                    <h5 className="font-semibold text-sm text-gray-900">{color.name}</h5>
                  </div>
                  
                  <div className="space-y-1 text-xs text-gray-600">
                    {color.hexCode && (
                      <p className="flex items-center gap-1">
                        <Hash className="w-3 h-3" />
                        {color.hexCode}
                      </p>
                    )}
                    {color.pantoneCode && (
                      <p>Pantone: {color.pantoneCode}</p>
                    )}
                    {color.fabricType && (
                      <p>Fabric: {color.fabricType}</p>
                    )}
                    {color.notes && (
                      <p className="text-gray-500 italic">{color.notes}</p>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Remove Button */}
              <button
                onClick={() => handleRemoveColor(color.number)}
                className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-all ml-2"
                title="Remove Color"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {(!quality.colors || quality.colors.length === 0) && !showAddColor && (
          <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
            <Palette className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-xs text-gray-500">No colors added yet</p>
            <button
              onClick={() => setShowAddColor(true)}
              className="text-xs text-purple-600 hover:text-purple-700 font-medium mt-2"
            >
              Add your first color
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function QualityModal({ quality, onClose, onSave, isSaving }: any) {
  const [formData, setFormData] = useState({
    name: quality?.name || '',
    description: quality?.description || '',
    colors: quality?.colors || [],
  });

  return (
    <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md shadow-2xl">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">
            {quality ? 'Edit Quality' : 'Add New Quality'}
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Quality Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Premium Silk, Cotton Blend"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Add details about this quality..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 h-20 resize-none"
            />
          </div>

          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <p className="text-xs text-purple-800">
              💡 <strong>Tip:</strong> After creating the quality, you can add numbered colors to it. Colors will be available for selection when creating orders.
            </p>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <ButtonWithLoading
            onClick={() => onSave(formData)}
            disabled={!formData.name}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
            isLoading={isSaving}
          >
            <Save className="w-4 h-4 inline mr-2" />
            Save Quality
          </ButtonWithLoading>
        </div>
      </div>
    </div>
  );
}

function BulkImportModal({ onClose, onImportComplete }: any) {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleImport = async () => {
    if (!file) {
      toast.error('Please select a CSV file to import');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      setImporting(true);
      setError(null);
      await qualityColorService.bulkImportQualities(formData);
      toast.success('Qualities imported successfully! 🎉');
      onImportComplete();
    } catch (err: any) {
      console.error('Failed to import qualities:', err);
      const errorMsg = err.message || 'Failed to import qualities. Please check the file format and try again.';
      setError(errorMsg);
      toast.error('Import failed');
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = () => {
    const csv = 'Quality Name,Quality Description,Color Number,Color Name,Hex Code,Sample Image URL,Pantone Code,Fabric Type,Notes\n' +
                'Premium Silk,Luxurious silk fabric,1,Mustard Yellow,#FFB800,,,Silk,Rich golden yellow\n' +
                'Premium Silk,Luxurious silk fabric,2,Royal Blue,#4169E1,,,Silk,Deep blue tone\n' +
                'Cotton Blend,Comfortable cotton mix,1,White,#FFFFFF,,,Cotton,Pure white\n' +
                'Cotton Blend,Comfortable cotton mix,2,Maroon,#800000,,,Cotton,Deep red\n';
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quality-color-template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Template downloaded');
  };

  return (
    <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Bulk Import Qualities & Colors</h3>
            <p className="text-xs text-gray-600 mt-1">Import multiple qualities with their colors from CSV</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Instructions */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              CSV Format Instructions
            </h4>
            <ul className="text-xs text-gray-700 space-y-1 ml-5 list-disc">
              <li><strong>Required columns:</strong> Quality Name, Quality Description, Color Number, Color Name, Hex Code</li>
              <li><strong>Optional columns:</strong> Sample Image URL, Pantone Code, Fabric Type, Notes</li>
              <li>Each row represents one color. Multiple rows with the same quality name will be grouped together</li>
              <li>Use quotes for fields containing commas</li>
              <li>Existing qualities will have new colors merged (duplicates avoided)</li>
            </ul>
          </div>

          {/* Example */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2 text-sm">CSV Example:</h4>
            <div className="bg-white p-3 rounded border border-gray-300 text-xs font-mono overflow-x-auto">
              <pre className="text-gray-800">{`Quality Name,Quality Description,Color Number,Color Name,Hex Code,...
Premium Silk,Luxurious silk fabric,1,Mustard Yellow,#FFB800
Premium Silk,Luxurious silk fabric,2,Royal Blue,#4169E1
Cotton Blend,Comfortable cotton mix,1,White,#FFFFFF`}</pre>
            </div>
            <button
              onClick={downloadTemplate}
              className="mt-3 flex items-center gap-2 px-3 py-1.5 bg-amber-600 text-white text-sm rounded-lg hover:bg-amber-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Download Sample Template
            </button>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select CSV File</label>
            <div className="relative">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 hover:border-purple-400 transition-colors cursor-pointer"
              />
              {file && (
                <div className="mt-2 flex items-center gap-2 text-sm text-emerald-600">
                  <span className="font-medium">✓ Selected:</span>
                  <span>{file.name}</span>
                  <span className="text-gray-500">({(file.size / 1024).toFixed(1)} KB)</span>
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-900">Import Failed</p>
                  <p className="text-xs text-red-800 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
            <h4 className="font-semibold text-gray-900 mb-2 text-sm flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-600" />
              Import Behavior
            </h4>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-white p-2 rounded border border-indigo-200">
                <p className="font-medium text-gray-900">New Qualities</p>
                <p className="text-gray-600 mt-1">Will be created with all colors</p>
              </div>
              <div className="bg-white p-2 rounded border border-indigo-200">
                <p className="font-medium text-gray-900">Existing Qualities</p>
                <p className="text-gray-600 mt-1">Will merge new colors (no duplicates)</p>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <ButtonWithLoading
            onClick={handleImport}
            disabled={!file}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow transition-all"
            isLoading={importing}
          >
            <Upload className="w-4 h-4 inline mr-2" />
            {importing ? 'Importing...' : 'Import CSV File'}
          </ButtonWithLoading>
        </div>
      </div>
    </div>
  );
}