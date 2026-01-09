import React, { useState, useRef, useEffect, useMemo } from 'react';
import { X, ChevronDown } from 'lucide-react';
import { Reference, ReferenceCategory } from '../types/prompter';

interface InlineReferenceSelectorProps {
  isOpen: boolean;
  availableReferences: Reference[];
  selectedReferences: Reference[];
  onSelectReference: (reference: Reference) => void;
  onRemoveReference: (referenceId: string) => void;
  onClose: () => void;
  prompterRef: React.RefObject<HTMLDivElement>;
  prompterWidth?: number;
}

const InlineReferenceSelector: React.FC<InlineReferenceSelectorProps> = ({
  isOpen,
  availableReferences,
  selectedReferences,
  onSelectReference,
  onRemoveReference,
  onClose,
  prompterRef,
  prompterWidth
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [documentView, setDocumentView] = useState<'documents' | 'case-strategy'>('documents');
  const [showViewDropdown, setShowViewDropdown] = useState(false);
  const selectorRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowViewDropdown(false);
      }
    };

    if (showViewDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showViewDropdown]);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      // Don't close if clicking inside the selector
      if (selectorRef.current && selectorRef.current.contains(target)) {
        return;
      }
      // Don't close if clicking on the prompter
      if (prompterRef.current && prompterRef.current.contains(target)) {
        return;
      }
      // Close if clicking outside both
      onClose();
    };

      document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose, prompterRef]);

  const updateSelectorPosition = () => {
    // Position the selector below the entire prompter
    if (isOpen && selectorRef.current && prompterRef.current) {
      const prompterRect = prompterRef.current.getBoundingClientRect();
      
      // Get prompter's document position: convert viewport coordinates to document coordinates
      const prompterTop = prompterRect.top + window.scrollY;
      const prompterLeft = prompterRect.left + window.scrollX;
      const prompterHeight = prompterRect.height;
      
      // Always position selector below the prompter (absolute positioning)
      // Use a small gap to ensure it doesn't overlap
      const gap = 4;
      // Position relative to prompter's document position
      let top = prompterTop + prompterHeight + gap;
      let left = prompterLeft;

      // Adjust if selector would go off screen horizontally (check in viewport)
      const selectorWidth = prompterWidth || selectorRef.current.offsetWidth || 400;
      const viewportLeft = prompterRect.left;
      if (viewportLeft + selectorWidth > window.innerWidth) {
        left = prompterLeft - (viewportLeft + selectorWidth - window.innerWidth) - 10;
      }
      if (viewportLeft < 10) {
        left = prompterLeft - (viewportLeft - 10);
      }

      // Adjust if selector would go off screen vertically - but keep it below
      const selectorHeight = selectorRef.current.offsetHeight || 400;
      const viewportBottom = prompterRect.bottom;
      if (viewportBottom + gap + selectorHeight > window.innerHeight) {
        // If there's not enough space below, reduce the selector height or scroll
        // But always keep it below the prompter
        const maxHeight = window.innerHeight - (viewportBottom + gap) - 10;
        if (maxHeight > 100) {
          selectorRef.current.style.maxHeight = `${maxHeight}px`;
        }
      }

      selectorRef.current.style.top = `${top}px`;
      selectorRef.current.style.left = `${left}px`;
    }
  };

  useEffect(() => {
    updateSelectorPosition();
  }, [isOpen, prompterRef, prompterWidth]);

  // Update position on scroll/resize
  useEffect(() => {
    if (!isOpen) return;
    
    const handleUpdate = () => {
      updateSelectorPosition();
    };

    window.addEventListener('scroll', handleUpdate, false);
    window.addEventListener('resize', handleUpdate);
    return () => {
      window.removeEventListener('scroll', handleUpdate, false);
      window.removeEventListener('resize', handleUpdate);
    };
  }, [isOpen, prompterRef, prompterWidth]);

  const categoryLabels: Record<ReferenceCategory, string> = {
    'applicant-resume': 'Applicant Resume',
    'identity-biographic': 'Identity and Biographic Documents',
    'personal-statement': 'Personal Statement',
    'employer-documents': 'Employer Documents'
  };

  const filteredReferences = useMemo(() => {
    if (!searchQuery) return availableReferences;
    const query = searchQuery.toLowerCase();
    return availableReferences.filter((ref) =>
      ref.name.toLowerCase().includes(query) ||
      categoryLabels[ref.category].toLowerCase().includes(query)
    );
  }, [availableReferences, searchQuery]);

  const groupedReferences = useMemo(() => {
    const groups: Record<ReferenceCategory, Reference[]> = {
      'applicant-resume': [],
      'identity-biographic': [],
      'personal-statement': [],
      'employer-documents': []
    };

    filteredReferences.forEach((ref) => {
      groups[ref.category].push(ref);
    });

    return groups;
  }, [filteredReferences]);

  const isSelected = (referenceId: string) => {
    return selectedReferences.some((ref) => ref.id === referenceId);
  };


  const hasAnyReferences = Object.values(groupedReferences).some(category => category.length > 0);

  if (!isOpen) return null;

  return (
    <div
      ref={selectorRef}
      data-in-text-prompter
      className="absolute bg-white border border-gray-200 rounded-md shadow-lg z-[60] max-h-[400px] flex flex-col"
      style={{ 
        width: prompterWidth ? `${prompterWidth}px` : '400px',
        minWidth: '400px',
        maxWidth: '600px',
        top: '0px',
        left: '0px'
      }}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowViewDropdown(!showViewDropdown);
              }}
              className="flex items-center gap-1.5 text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              <span>Documents</span>
              <ChevronDown size={14} className={showViewDropdown ? 'transform rotate-180' : ''} />
            </button>
            {showViewDropdown && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 min-w-[160px]">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDocumentView('documents');
                    setShowViewDropdown(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-sm text-black hover:bg-gray-50 ${
                    documentView === 'documents' ? 'bg-gray-50 font-medium' : ''
                  }`}
                >
                  Documents
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDocumentView('case-strategy');
                    setShowViewDropdown(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-sm text-black hover:bg-gray-50 ${
                    documentView === 'case-strategy' ? 'bg-gray-50 font-medium' : ''
                  }`}
                >
                  Case Strategy
                </button>
              </div>
            )}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="flex-shrink-0 p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            title="Close"
          >
            <X size={16} />
          </button>
        </div>
        <input
          ref={searchInputRef}
          type="text"
          placeholder="Search references..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-black"
        />
        {selectedReferences.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {selectedReferences.map((reference) => (
              <div
                key={reference.id}
                className="flex items-center gap-1.5 rounded-md border border-gray-200 bg-gray-50 px-2 py-1 text-xs"
              >
                <span className="text-gray-700">{reference.name}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveReference(reference.id);
                  }}
                  className="text-gray-500 hover:text-gray-700 flex-shrink-0"
                  title="Remove reference"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {!hasAnyReferences ? (
          <div className="text-center text-gray-500 py-8 text-sm">
            {searchQuery ? 'No references found' : 'No references available'}
          </div>
        ) : (
          <div className="p-2">
            {(Object.keys(categoryLabels) as ReferenceCategory[]).map((category) => {
              const references = groupedReferences[category];
              if (references.length === 0) return null;

              return (
                <div key={category} className="mb-4 last:mb-0">
                  <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {categoryLabels[category]}
                  </div>
                  <div className="mt-1 space-y-1">
                    {references.map((reference) => {
                      const selected = isSelected(reference.id);
                      return (
                        <label
                          key={reference.id}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                          onMouseDown={(e) => {
                            e.stopPropagation();
                          }}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-md border transition-colors cursor-pointer ${
                            selected
                              ? 'bg-blue-50 border-blue-200'
                              : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                          }`}
                        >
                          <div className="relative flex-shrink-0">
                            <input
                              type="checkbox"
                              checked={selected}
                              onChange={(e) => {
                                e.stopPropagation();
                                if (selected) {
                                  onRemoveReference(reference.id);
                                } else {
                                  onSelectReference(reference);
                                }
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                              }}
                              onMouseDown={(e) => {
                                e.stopPropagation();
                              }}
                              className="w-4 h-4 appearance-none border-2 border-gray-300 rounded cursor-pointer checked:bg-gray-600 checked:border-gray-600 focus:ring-2 focus:ring-gray-500 focus:ring-offset-0"
                              style={{
                                backgroundImage: selected ? "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath fill='white' d='M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z'/%3E%3C/svg%3E\")" : 'none',
                                backgroundSize: 'contain',
                                backgroundRepeat: 'no-repeat',
                                backgroundPosition: 'center'
                              }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className={`text-sm font-medium truncate ${selected ? 'text-blue-900' : 'text-gray-700'}`}>
                              {reference.name}
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default InlineReferenceSelector;
