import React, { useState, useRef, useEffect } from 'react';
import { X, FileText, Briefcase } from 'lucide-react';
import { Reference } from '../types/prompter';

interface ReferenceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  availableReferences: Reference[];
  selectedReferences: Reference[];
  onSelectReference: (reference: Reference) => void;
  onRemoveReference: (referenceId: string) => void;
}

const ReferenceDialog: React.FC<ReferenceDialogProps> = ({
  isOpen,
  onClose,
  availableReferences,
  selectedReferences,
  onSelectReference,
  onRemoveReference
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredReferences = availableReferences.filter((ref) =>
    ref.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isSelected = (referenceId: string) => {
    return selectedReferences.some((ref) => ref.id === referenceId);
  };

  const getReferenceIcon = (type: Reference['type']) => {
    return type === 'case-document' ? <Briefcase size={16} /> : <FileText size={16} />;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={onClose}>
      <div
        ref={dialogRef}
        className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Add Reference</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 border-b border-gray-200">
          <input
            type="text"
            placeholder="Search references..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            autoFocus
          />
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {filteredReferences.length === 0 ? (
            <div className="text-center text-gray-500 py-8 text-sm">
              {searchQuery ? 'No references found' : 'No references available'}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredReferences.map((reference) => {
                const selected = isSelected(reference.id);
                return (
                  <button
                    key={reference.id}
                    onClick={() => {
                      if (selected) {
                        onRemoveReference(reference.id);
                      } else {
                        onSelectReference(reference);
                      }
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-md border transition-colors text-left ${
                      selected
                        ? 'bg-blue-50 border-blue-200 text-blue-900'
                        : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className={`flex-shrink-0 ${selected ? 'text-blue-600' : 'text-gray-400'}`}>
                      {getReferenceIcon(reference.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{reference.name}</div>
                      <div className="text-xs text-gray-500 capitalize">
                        {reference.type === 'case-document' ? 'Case Document' : 'Strategy Document'}
                      </div>
                    </div>
                    {selected && (
                      <div className="flex-shrink-0 text-blue-600">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-200 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReferenceDialog;
