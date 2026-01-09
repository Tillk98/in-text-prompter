import React, { useState, useRef, useEffect, useMemo } from 'react';
import { X, ChevronDown, Search, Check } from 'lucide-react';
import { Reference, ReferenceCategory } from '../types/prompter';

interface InlineReferenceSelectorProps {
  isOpen: boolean;
  availableReferences: Reference[];
  selectedReferences: Reference[];
  onSelectReference: (reference: Reference) => void;
  onRemoveReference: (referenceId: string) => void;
  onClose: () => void;
  prompterRef: React.RefObject<HTMLDivElement>;
  inputContainerRef?: React.RefObject<HTMLDivElement> | null;
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
  inputContainerRef,
  prompterWidth
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [documentView, setDocumentView] = useState<'documents' | 'case-strategy'>('documents');
  const [showViewDropdown, setShowViewDropdown] = useState(false);
  const selectorRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      // Store current scroll position
      const scrollY = window.scrollY;
      const scrollX = window.scrollX;
      
      // Focus the input without scrolling
      searchInputRef.current.focus({ preventScroll: true });
      
      // Restore scroll position if it changed (fallback for browsers that don't support preventScroll)
      requestAnimationFrame(() => {
        if (window.scrollY !== scrollY || window.scrollX !== scrollX) {
          window.scrollTo(scrollX, scrollY);
        }
      });
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
    // Position the selector below the target (input field in preview mode, or entire prompter otherwise)
    if (isOpen && selectorRef.current) {
      // If inputContainerRef is provided (preview mode), position relative to input field
      // Otherwise, position relative to entire prompter
      const targetRef = inputContainerRef?.current || prompterRef.current;
      if (!targetRef) return;
      
      const targetRect = targetRef.getBoundingClientRect();
      
      // Use viewport coordinates directly since we're using fixed positioning
      const targetTop = targetRect.top;
      const targetLeft = targetRect.left;
      const targetHeight = targetRect.height;
      
      // Position selector below the target (fixed positioning)
      // Use a small gap to ensure it doesn't overlap
      const gap = 4;
      // Position relative to target's viewport position
      let top = targetTop + targetHeight + gap;
      let left = targetLeft;

      // Adjust if selector would go off screen horizontally (check in viewport)
      const selectorWidth = prompterWidth || selectorRef.current.offsetWidth || 400;
      const viewportLeft = targetRect.left;
      if (viewportLeft + selectorWidth > window.innerWidth) {
        left = targetLeft - (viewportLeft + selectorWidth - window.innerWidth) - 10;
      }
      if (viewportLeft < 10) {
        left = targetLeft - (viewportLeft - 10);
      }

      // Adjust if selector would go off screen vertically - but keep it below
      const selectorHeight = selectorRef.current.offsetHeight || 400;
      const viewportBottom = targetRect.bottom;
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
    if (isOpen) {
      // Use requestAnimationFrame to ensure prompter position is set
      requestAnimationFrame(() => {
        updateSelectorPosition();
      });
    }
  }, [isOpen, prompterRef, inputContainerRef, prompterWidth]);

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
  }, [isOpen, prompterRef, inputContainerRef, prompterWidth]);

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
      className="fixed bg-white border border-gray-200 rounded-md shadow-lg z-[60] max-h-[400px] flex flex-col"
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
            className="flex-shrink-0 px-3 py-1.5 text-sm font-medium text-black rounded-full transition-all duration-200"
            style={{
              backgroundColor: '#DEDEE9',
              transition: 'background-color 0.2s, border-color 0.2s, color 0.2s, fill 0.2s, stroke 0.2s, opacity 0.2s, box-shadow 0.2s, transform 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#D0D0DD';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#DEDEE9';
            }}
            title="Done"
          >
            Done
          </button>
        </div>
        <div 
          ref={searchContainerRef}
          className="flex h-8 w-full flex-none items-center gap-1 rounded-md border border-solid bg-white px-2"
          style={{
            borderColor: 'rgb(228, 228, 231)'
          }}
        >
          <Search size={16} className="text-gray-500 flex-shrink-0" />
          <div className="flex grow shrink-0 basis-0 flex-col items-start self-stretch px-1">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                if (searchContainerRef.current) {
                  searchContainerRef.current.style.borderWidth = '2px';
                  searchContainerRef.current.style.borderColor = 'rgb(49, 130, 206)';
                }
              }}
              onBlur={() => {
                if (searchContainerRef.current) {
                  searchContainerRef.current.style.borderWidth = '';
                  searchContainerRef.current.style.borderColor = '';
                }
              }}
              className="h-full w-full border-none bg-transparent text-sm outline-none placeholder:text-gray-400 text-gray-800"
            />
          </div>
        </div>
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

      <div className="flex max-h-[384px] w-full flex-col items-start gap-4 px-4 py-4 overflow-y-auto">
        {!hasAnyReferences ? (
          <div className="text-center text-gray-500 py-8 text-sm">
            {searchQuery ? 'No references found' : 'No references available'}
          </div>
        ) : (
          <>
            {(Object.keys(categoryLabels) as ReferenceCategory[]).map((category) => {
              const references = groupedReferences[category];
              if (references.length === 0) return null;

              // Map category to letter prefix
              const categoryPrefix: Record<ReferenceCategory, string> = {
                'applicant-resume': 'A',
                'identity-biographic': 'B',
                'personal-statement': 'C',
                'employer-documents': 'D'
              };
              const prefix = categoryPrefix[category] || '';

              return (
                <div key={category} className="flex w-full flex-col items-start gap-3">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {categoryLabels[category]}
                  </span>
                  <div className="flex w-full flex-col items-start gap-0.5">
                    {references.map((reference, index) => {
                      const selected = isSelected(reference.id);
                      const label = `${prefix}.${index + 1}`;
                      
                      return (
                        <div
                          key={reference.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (selected) {
                              onRemoveReference(reference.id);
                            } else {
                              onSelectReference(reference);
                            }
                          }}
                          className={`flex w-full items-center gap-2 rounded-md px-2 py-2 cursor-pointer transition-colors ${
                            selected
                              ? 'bg-blue-50 hover:bg-blue-100'
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          <div 
                            className="flex-shrink-0 flex items-center justify-center cursor-pointer"
                            style={{
                              width: '20px',
                              height: '20px',
                              border: '2px solid rgb(226, 232, 240)',
                              borderRadius: '2px',
                              backgroundColor: selected ? 'rgb(0, 0, 139)' : 'transparent',
                              transition: 'box-shadow 0.2s',
                              boxSizing: 'border-box'
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (selected) {
                                onRemoveReference(reference.id);
                              } else {
                                onSelectReference(reference);
                              }
                            }}
                          >
                            {selected && (
                              <Check size={14} className="text-white" strokeWidth={3} />
                            )}
                          </div>
                          <span className={`w-8 flex-none text-xs ${
                            selected
                              ? 'text-blue-600 font-semibold'
                              : 'text-gray-500'
                          }`}>
                            {label}
                          </span>
                          <span className={`text-xs flex-1 ${
                            selected
                              ? 'text-blue-600 font-semibold'
                              : 'text-gray-700'
                          }`}>
                            {reference.name}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
};

export default InlineReferenceSelector;
