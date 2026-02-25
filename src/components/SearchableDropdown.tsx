import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Search, Check } from 'lucide-react';

interface Option {
  id: string;
  label: string;
  subLabel?: string;
  value?: any;
}

interface SearchableDropdownProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
  required?: boolean;
}

export function SearchableDropdown({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  label,
  className = '',
  required = false
}: SearchableDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOptions, setFilteredOptions] = useState<Option[]>(options);
  const buttonRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });

  const selectedOption = options.find(opt => opt.id === value);

  useEffect(() => {
    setFilteredOptions(
      options.filter(opt =>
        opt.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (opt.subLabel && opt.subLabel.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    );
  }, [searchTerm, options]);

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const updatePosition = () => {
        if (buttonRef.current) {
          const rect = buttonRef.current.getBoundingClientRect();
          setCoords({
            top: rect.bottom + 4,
            left: rect.left,
            width: rect.width
          });
        }
      };
      
      updatePosition();
      
      // Only close on window scroll (not on parent container scroll)
      const handleScroll = (e: Event) => {
        // Check if the scroll is happening on the dropdown itself or its parent container
        const dropdownEl = document.getElementById('searchable-dropdown-portal');
        const target = e.target as Node;
        
        // Don't close if scrolling inside the dropdown menu itself
        if (dropdownEl && dropdownEl.contains(target)) {
          return;
        }
        
        // Don't close if scrolling inside a parent container (not window)
        if (target !== document && target !== document.documentElement && target !== document.body) {
          return;
        }
        
        setIsOpen(false);
      };
      
      window.addEventListener('scroll', handleScroll, true);
      window.addEventListener('resize', handleScroll);
      
      return () => {
        window.removeEventListener('scroll', handleScroll, true);
        window.removeEventListener('resize', handleScroll);
      };
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // If clicking inside the dropdown content (which is in a portal), don't close
      const dropdownEl = document.getElementById('searchable-dropdown-portal');
      if (dropdownEl && dropdownEl.contains(event.target as Node)) {
        return;
      }
      
      // If clicking the button itself
      if (buttonRef.current && buttonRef.current.contains(event.target as Node)) {
        return;
      }

      setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const dropdownMenu = isOpen ? (
    <div 
      id="searchable-dropdown-portal"
      className="fixed z-[9999] bg-white border border-gray-200 rounded-lg shadow-xl flex flex-col overflow-hidden"
      style={{ 
        top: coords.top, 
        left: coords.left, 
        width: coords.width,
        maxHeight: '300px'
      }}
    >
      <div className="p-2 border-b border-gray-100 bg-white">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
          <input
            type="text"
            className="w-full pl-7 pr-2 py-1.5 text-xs border border-gray-200 rounded-md focus:outline-none focus:border-indigo-500"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      </div>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 12px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #c1c1c1;
          border-radius: 6px;
          border: 3px solid #f1f1f1;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: #a8a8a8;
        }
      `}</style>
      <div className="overflow-y-auto flex-1 p-1 custom-scrollbar">
        {filteredOptions.length === 0 ? (
          <div className="px-3 py-2 text-xs text-gray-500 text-center">No results found</div>
        ) : (
          filteredOptions.map((opt) => (
            <div
              key={opt.id}
              className={`px-3 py-2 text-sm rounded-md cursor-pointer flex items-center justify-between group ${
                value === opt.id ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => {
                onChange(opt.id);
                setIsOpen(false);
                setSearchTerm('');
              }}
            >
              <div className="flex flex-col truncate pr-2">
                <span className={`font-medium truncate ${value === opt.id ? 'text-indigo-700' : 'group-hover:text-gray-900'}`}>{opt.label}</span>
                {opt.subLabel && <span className="text-xs text-gray-500 truncate">{opt.subLabel}</span>}
              </div>
              {value === opt.id && <Check className="w-3 h-3 flex-shrink-0" />}
            </div>
          ))
        )}
      </div>
    </div>
  ) : null;

  return (
    <div className={`relative ${className}`}>
      {label && <label className="block text-sm font-semibold text-gray-900 mb-1">{label}</label>}
      
      <div
        ref={buttonRef}
        className={`w-full px-3 py-2 bg-white border rounded-lg text-sm flex items-center justify-between cursor-pointer transition-shadow ${
          isOpen ? 'ring-2 ring-indigo-500 border-indigo-500' : 'border-gray-300 hover:border-gray-400'
        }`}
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) setSearchTerm('');
        }}
      >
        <div className="flex-1 truncate mr-2">
          {selectedOption ? (
            <div className="flex flex-col md:flex-row md:items-center gap-1 truncate">
              <span className="text-gray-900 font-medium truncate">{selectedOption.label}</span>
              {selectedOption.subLabel && <span className="text-gray-400 text-xs hidden md:inline truncate">({selectedOption.subLabel})</span>}
            </div>
          ) : (
            <span className="text-gray-400">{placeholder}</span>
          )}
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {typeof document !== 'undefined' && createPortal(dropdownMenu, document.body)}
    </div>
  );
}