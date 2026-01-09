import React, { useRef, useEffect, useMemo } from 'react';
import { Zap, Building2, Paperclip, Star } from 'lucide-react';
import { QuickAction, SavedPrompt, CaseblinkPrompt } from '../types/prompter';

interface PrompterMenuProps {
  isOpen: boolean;
  onClose: () => void;
  prompterRef: React.RefObject<HTMLDivElement>;
  inputContainerRef?: React.RefObject<HTMLDivElement> | null;
  quickActions: QuickAction[];
  savedPrompts: SavedPrompt[];
  caseblinkPrompts: CaseblinkPrompt[];
  searchQuery: string;
  onQuickAction: (action: QuickAction) => void;
  onSavedPrompt: (prompt: SavedPrompt) => void;
  onCaseblinkPrompt: (prompt: CaseblinkPrompt) => void;
  onReference: () => void;
  onStarPrompt: (prompt: QuickAction | SavedPrompt | CaseblinkPrompt) => void;
  starredPromptIds: Set<string>;
}

const PrompterMenu: React.FC<PrompterMenuProps> = ({
  isOpen,
  onClose,
  prompterRef,
  inputContainerRef,
  quickActions,
  savedPrompts,
  caseblinkPrompts,
  searchQuery,
  onQuickAction,
  onSavedPrompt,
  onCaseblinkPrompt,
  onReference,
  onStarPrompt,
  starredPromptIds: _starredPromptIds
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  // Filter items based on search query
  const filteredQuickActions = useMemo(() => {
    if (!searchQuery) return quickActions;
    const query = searchQuery.toLowerCase();
    return quickActions.filter(action => 
      action.label.toLowerCase().includes(query) ||
      action.prompt.toLowerCase().includes(query)
    );
  }, [quickActions, searchQuery]);

  const filteredSavedPrompts = useMemo(() => {
    if (!searchQuery) return savedPrompts;
    const query = searchQuery.toLowerCase();
    return savedPrompts.filter(prompt => 
      prompt.label.toLowerCase().includes(query) ||
      prompt.prompt.toLowerCase().includes(query)
    );
  }, [savedPrompts, searchQuery]);

  const filteredCaseblinkPrompts = useMemo(() => {
    if (!searchQuery) return caseblinkPrompts;
    const query = searchQuery.toLowerCase();
    return caseblinkPrompts.filter(prompt => 
      prompt.label.toLowerCase().includes(query) ||
      prompt.prompt.toLowerCase().includes(query)
    );
  }, [caseblinkPrompts, searchQuery]);

  const showReference = !searchQuery || 'reference'.includes(searchQuery.toLowerCase());

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        prompterRef.current &&
        !prompterRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

      document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose, prompterRef]);

  const updateMenuPosition = () => {
    if (isOpen && menuRef.current) {
      // If inputContainerRef is provided (preview mode), position relative to input field
      // Otherwise, position relative to entire prompter
      const targetRef = inputContainerRef?.current || prompterRef.current;
      if (!targetRef) return;
      
      const targetRect = targetRef.getBoundingClientRect();
      
      // Use viewport coordinates directly since we're using fixed positioning
      const targetTop = targetRect.top;
      const targetLeft = targetRect.left;
      const targetHeight = targetRect.height;
      
      // Position menu below the target (input field in preview mode, or entire prompter otherwise)
      // Use a small gap to ensure it doesn't overlap
      const gap = 4;
      // Position relative to target's viewport position
      let top = targetTop + targetHeight + gap;
      let left = targetLeft;

      // Adjust if menu would go off screen horizontally (check in viewport)
      const menuWidth = menuRef.current.offsetWidth || 240;
      const viewportLeft = targetRect.left;
      if (viewportLeft + menuWidth > window.innerWidth) {
        left = targetLeft - (viewportLeft + menuWidth - window.innerWidth) - 10;
      }
      if (viewportLeft < 10) {
        left = targetLeft - (viewportLeft - 10);
      }

      // Adjust if menu would go off screen vertically - but keep it below
      const menuHeight = menuRef.current.offsetHeight || 200;
      const viewportBottom = targetRect.bottom;
      if (viewportBottom + gap + menuHeight > window.innerHeight) {
        // If there's not enough space below, reduce the menu height or scroll
        // But always keep it below the prompter
        const maxHeight = window.innerHeight - (viewportBottom + gap) - 10;
        if (maxHeight > 100) {
          menuRef.current.style.maxHeight = `${maxHeight}px`;
        }
      }

      menuRef.current.style.top = `${top}px`;
      menuRef.current.style.left = `${left}px`;
    }
  };

  useEffect(() => {
    if (isOpen) {
      // Use requestAnimationFrame to ensure prompter position is set
      requestAnimationFrame(() => {
        updateMenuPosition();
      });
    }
  }, [isOpen, prompterRef, inputContainerRef]);

  // Update position on scroll/resize
  useEffect(() => {
    if (!isOpen) return;
    
    const handleUpdate = () => {
      updateMenuPosition();
    };

    window.addEventListener('scroll', handleUpdate, false);
    window.addEventListener('resize', handleUpdate);
    return () => {
      window.removeEventListener('scroll', handleUpdate, false);
      window.removeEventListener('resize', handleUpdate);
    };
  }, [isOpen, prompterRef, inputContainerRef]);

  if (!isOpen) return null;

  const MenuSection: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
    <div className="mb-2">
      <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
        {icon}
        <span>{title}</span>
      </div>
      {children}
    </div>
  );

  const MenuItem: React.FC<{ 
    onClick: () => void; 
    children: React.ReactNode;
    showStar?: boolean;
    isStarred?: boolean;
    onStarClick?: (e: React.MouseEvent) => void;
  }> = ({ onClick, children, showStar, isStarred, onStarClick }) => (
    <button
      onClick={onClick}
      className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors flex items-center justify-between group"
    >
      <span className="flex-1">{children}</span>
      {showStar && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (onStarClick) {
              onStarClick(e);
            }
          }}
          className="ml-2 p-1 rounded hover:bg-gray-200 transition-colors flex-shrink-0"
          title={isStarred ? "Unstar prompt" : "Star prompt"}
        >
          <Star 
            size={14} 
            className={isStarred ? "text-yellow-500 fill-yellow-500" : "text-gray-400"}
            fill={isStarred ? "currentColor" : "none"}
          />
        </button>
      )}
    </button>
  );

  return (
    <div
      ref={menuRef}
      className="fixed bg-white border border-gray-200 rounded-md shadow-lg z-[60] min-w-[240px] max-w-[320px] max-h-[400px] overflow-y-auto"
      style={{ top: 0, left: 0 }}
    >
      <div className="p-2">
        {showReference && (
          <>
            <div className="mb-2">
              <MenuItem onClick={() => { onReference(); onClose(); }}>
                <div className="flex items-center gap-2">
                  <Paperclip size={14} />
                  <span>Reference</span>
                </div>
              </MenuItem>
            </div>
            <div className="border-t border-gray-200 my-2"></div>
          </>
        )}

        {filteredSavedPrompts.length > 0 && (
          <>
            <MenuSection title="My Prompts" icon={<Star size={14} />}>
              {filteredSavedPrompts.map((prompt) => (
                <MenuItem 
                  key={prompt.id} 
                  onClick={() => { onSavedPrompt(prompt); onClose(); }}
                  showStar={true}
                  isStarred={true}
                  onStarClick={() => onStarPrompt(prompt)}
                >
                  {prompt.label}
                </MenuItem>
              ))}
            </MenuSection>
            {(filteredQuickActions.length > 0 || filteredCaseblinkPrompts.length > 0) && (
              <div className="border-t border-gray-200 my-2"></div>
            )}
          </>
        )}

        {filteredQuickActions.length > 0 && (
          <>
            <MenuSection title="Shortcuts" icon={<Zap size={14} />}>
              {filteredQuickActions.map((action) => (
                <MenuItem 
                  key={action.id} 
                  onClick={() => { onQuickAction(action); onClose(); }}
                  showStar={false}
                >
                  {action.label}
                </MenuItem>
              ))}
            </MenuSection>
            {filteredCaseblinkPrompts.length > 0 && (
              <div className="border-t border-gray-200 my-2"></div>
            )}
          </>
        )}

        {filteredCaseblinkPrompts.length > 0 && (
          <MenuSection title="Caseblink Prompts" icon={<Building2 size={14} />}>
            {filteredCaseblinkPrompts.map((prompt) => (
              <MenuItem 
                key={prompt.id} 
                onClick={() => { onCaseblinkPrompt(prompt); onClose(); }}
                showStar={false}
              >
                {prompt.label}
              </MenuItem>
            ))}
          </MenuSection>
        )}

        {searchQuery && filteredQuickActions.length === 0 && filteredSavedPrompts.length === 0 && filteredCaseblinkPrompts.length === 0 && !showReference && (
          <div className="text-center text-gray-500 py-4 text-sm">
            No results found
          </div>
        )}
      </div>
    </div>
  );
};

export default PrompterMenu;
