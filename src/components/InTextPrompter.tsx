import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, Clock, Paperclip, Star, Wand2, Square } from 'lucide-react';
import TextField, { TextFieldInput } from './TextField';
import IconButton from './IconButton';
import PrompterMenu from './PrompterMenu';
import InlineReferenceSelector from './InlineReferenceSelector';
import {
  QuickAction,
  SavedPrompt,
  CaseblinkPrompt,
  Reference,
  mockQuickActions,
  mockSavedPrompts,
  mockCaseblinkPrompts,
  mockReferences
} from '../types/prompter';

interface InTextPrompterProps {
  selectedText: string;
  position: { top: number; left: number; height: number };
  onClose: () => void;
}

const InTextPrompter: React.FC<InTextPrompterProps> = ({ selectedText, position, onClose }) => {
  const [inputValue, setInputValue] = useState('');
  const [references, setReferences] = useState<Reference[]>([]);
  const [showMenu, setShowMenu] = useState(false);
  const [showReferenceSelector, setShowReferenceSelector] = useState(false);
  const [prompterWidth, setPrompterWidth] = useState<number | undefined>(undefined);
  const [recentActions, setRecentActions] = useState<(QuickAction | SavedPrompt | CaseblinkPrompt)[]>([]);
  const [promptsScrollPosition, setPromptsScrollPosition] = useState(0);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [previewText, setPreviewText] = useState('');
  const [usedPrompt, setUsedPrompt] = useState<string>('');
  const [isPromptStarred, setIsPromptStarred] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingEllipses, setLoadingEllipses] = useState('');
  const loadingTimeoutRef = useRef<number | null>(null);
  const ellipsesIntervalRef = useRef<number | null>(null);
  const prompterRef = useRef<HTMLDivElement>(null);
  const textFieldRef = useRef<HTMLInputElement>(null);
  const inputContainerRef = useRef<HTMLDivElement>(null);
  const promptsContainerRef = useRef<HTMLDivElement>(null);
  const previewTextareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Position the prompter below the selected text
    if (prompterRef.current) {
      const offset = 10; // Gap between selection and prompter
      // Get the selection's position in document coordinates
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        
        // Convert viewport coordinates to document coordinates
        const topPosition = rect.top + rect.height + offset + window.scrollY;
        const leftPosition = rect.left + window.scrollX;
        
        // Ensure it doesn't go off the right edge
        const maxLeft = window.innerWidth - prompterRef.current.offsetWidth - 20;
        const finalLeft = Math.max(20, Math.min(leftPosition, maxLeft + window.scrollX));
        
        prompterRef.current.style.top = `${topPosition}px`;
        prompterRef.current.style.left = `${finalLeft}px`;
        
        // Update prompter width for reference selector
        setPrompterWidth(prompterRef.current.offsetWidth);
      } else {
        // Fallback to using position prop
        const topPosition = position.top + position.height + offset + window.scrollY;
        const maxLeft = window.innerWidth - prompterRef.current.offsetWidth - 20;
        const leftPosition = Math.min(position.left + window.scrollX, maxLeft + window.scrollX);
        const finalLeft = Math.max(20 + window.scrollX, leftPosition);
        
        prompterRef.current.style.top = `${topPosition}px`;
        prompterRef.current.style.left = `${finalLeft}px`;
      }
    }
  }, [position]);

  // Update scroll position state when container scrolls
  useEffect(() => {
    const container = promptsContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollLeft = container.scrollLeft;
      const scrollWidth = container.scrollWidth;
      const clientWidth = container.clientWidth;
      setPromptsScrollPosition(scrollLeft);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    };

    // Check initial state
    handleScroll();

    container.addEventListener('scroll', handleScroll);
    // Also check on resize
    window.addEventListener('resize', handleScroll);
    
    return () => {
      container.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [recentActions]);

  // Prevent clicks inside the prompter from closing it
  const handlePrompterClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handlePrompterMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
  };


  const handleSparklesClick = () => {
    // If already loading, stop it
    if (isLoading) {
      handleStopGeneration();
      return;
    }

    // Start loading
    setIsLoading(true);
    setShowMenu(false);
    
    // Store the prompt that was used
    const fullPrompt = inputValue.trim() || 'Edit the selected text';
    setUsedPrompt(fullPrompt);
    
    // Clear the input for reprompting
    setInputValue('');
    
    // Simulate 2 second loading (for prototype)
    loadingTimeoutRef.current = setTimeout(() => {
      // Generate mock preview text (in real app, this would be an AI call)
      const mockPreview = `[AI Generated Preview]\n\n${isPreviewMode ? previewText : selectedText}\n\n[This is a preview of the edited text based on your prompt: "${fullPrompt}"]`;
      setPreviewText(mockPreview);
      
      // Enter preview mode (or stay in it if already there)
      setIsPreviewMode(true);
      
      // Stop loading
      setIsLoading(false);
      loadingTimeoutRef.current = null;
      
      // Clear ellipses animation
      if (ellipsesIntervalRef.current) {
        clearInterval(ellipsesIntervalRef.current);
        ellipsesIntervalRef.current = null;
      }
      setLoadingEllipses('');
    }, 2000);
  };

  const handleStopGeneration = () => {
    // Clear the loading timeout
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = null;
    }
    // Clear ellipses animation
    if (ellipsesIntervalRef.current) {
      clearInterval(ellipsesIntervalRef.current);
      ellipsesIntervalRef.current = null;
    }
    // Stop loading
    setIsLoading(false);
    setLoadingEllipses('');
  };

  // Animate ellipses during loading
  useEffect(() => {
    if (isLoading) {
      let count = 0;
      ellipsesIntervalRef.current = setInterval(() => {
        count = (count + 1) % 4;
        setLoadingEllipses('.'.repeat(count));
      }, 500);
    } else {
      if (ellipsesIntervalRef.current) {
        clearInterval(ellipsesIntervalRef.current);
        ellipsesIntervalRef.current = null;
      }
    }

    return () => {
      if (ellipsesIntervalRef.current) {
        clearInterval(ellipsesIntervalRef.current);
      }
    };
  }, [isLoading]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
      if (ellipsesIntervalRef.current) {
        clearInterval(ellipsesIntervalRef.current);
      }
    };
  }, []);

  const handleCancel = () => {
    // Exit preview mode and reset
    setIsPreviewMode(false);
    setPreviewText('');
    setUsedPrompt('');
    setIsPromptStarred(false);
    setInputValue('');
    // Close the prompter entirely
    onClose();
  };

  const handleApply = () => {
    // Apply the preview text (in real app, this would replace the selected text)
    console.log('Applying preview text:', previewText);
    // Exit preview mode and reset
    setIsPreviewMode(false);
    setPreviewText('');
    setUsedPrompt('');
    setIsPromptStarred(false);
    setInputValue('');
    // Close the prompter entirely
    onClose();
  };

  const handleToggleUsedPromptStar = () => {
    // Toggle star state
    setIsPromptStarred(!isPromptStarred);
    // In real app, this would save the prompt to My Prompts
    console.log('Starred prompt:', usedPrompt);
  };


  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setInputValue(value);

    // Check if user typed "/" to trigger menu
    if (value.includes('/')) {
      if (!showMenu) {
        setShowMenu(true);
      }
    } else if (!value.includes('/') && showMenu) {
      // Close menu if "/" is removed
      setShowMenu(false);
    }
  };

  // Extract search query from input (everything after "/")
  const getSearchQuery = () => {
    const slashIndex = inputValue.lastIndexOf('/');
    if (slashIndex === -1) return '';
    return inputValue.substring(slashIndex + 1);
  };

  const handleSelectReference = (reference: Reference) => {
    if (!references.some(ref => ref.id === reference.id)) {
      setReferences([...references, reference]);
    }
  };

  const handleRemoveReferenceFromSelector = (referenceId: string) => {
    setReferences(references.filter(ref => ref.id !== referenceId));
  };

  // Add action to recent actions (max 3)
  const addToRecentActions = (action: QuickAction | SavedPrompt | CaseblinkPrompt) => {
    setRecentActions(prev => {
      // Remove if already exists (to move it to the front)
      const filtered = prev.filter(a => a.id !== action.id);
      // Add to the beginning
      const updated = [action, ...filtered];
      // Keep only the last 3
      return updated.slice(0, 3);
    });
  };

  // Handle menu item selection - insert prompt into text field
  const handleQuickActionSelect = (action: QuickAction) => {
    // Remove everything from "/" onwards and insert the prompt
    const slashIndex = inputValue.lastIndexOf('/');
    const baseValue = slashIndex === -1 ? inputValue : inputValue.substring(0, slashIndex);
    const newValue = baseValue + ' ' + action.prompt;
    setInputValue(newValue);
    setShowMenu(false);
    addToRecentActions(action);
    if (textFieldRef.current) {
      textFieldRef.current.focus();
    }
  };

  const handleSavedPromptSelect = (prompt: SavedPrompt) => {
    const slashIndex = inputValue.lastIndexOf('/');
    const baseValue = slashIndex === -1 ? inputValue : inputValue.substring(0, slashIndex);
    const newValue = baseValue + ' ' + prompt.prompt;
    setInputValue(newValue);
    setShowMenu(false);
    addToRecentActions(prompt);
    if (textFieldRef.current) {
      textFieldRef.current.focus();
    }
  };

  const handleCaseblinkPromptSelect = (prompt: CaseblinkPrompt) => {
    const slashIndex = inputValue.lastIndexOf('/');
    const baseValue = slashIndex === -1 ? inputValue : inputValue.substring(0, slashIndex);
    const newValue = baseValue + ' ' + prompt.prompt;
    setInputValue(newValue);
    setShowMenu(false);
    addToRecentActions(prompt);
    if (textFieldRef.current) {
      textFieldRef.current.focus();
    }
  };

  const handleReferenceSelect = () => {
    // Remove the "/" and everything after it
    const slashIndex = inputValue.lastIndexOf('/');
    const newValue = slashIndex === -1 ? inputValue : inputValue.substring(0, slashIndex);
    setInputValue(newValue);
    setShowMenu(false);
    setShowReferenceSelector(true);
    if (textFieldRef.current) {
      textFieldRef.current.focus();
    }
  };

  const handleStarPrompt = (_prompt: QuickAction | SavedPrompt | CaseblinkPrompt) => {
    // Starring a prompt doesn't affect recent actions anymore
    // This function is kept for the menu star functionality
  };

  const starredPromptIds = new Set<string>(); // Empty set since we're not tracking starred prompts in recent actions

  if (!selectedText) return null;

  return (
    <>
      <div
        ref={prompterRef}
        data-in-text-prompter
        className="flex items-center gap-2 rounded-md bg-default-background px-2 py-2 shadow-md absolute z-50"
        style={{
          width: '500px',
          minWidth: '400px',
          maxWidth: '600px',
          boxSizing: 'border-box'
        }}
        onClick={handlePrompterClick}
        onMouseDown={handlePrompterMouseDown}
      >
        <div className="flex flex-col items-center gap-2 w-full min-w-0 flex-1" style={{ width: '100%', maxWidth: '100%' }}>
          <div className="flex w-full items-center gap-2 min-w-0">
            <div className="relative flex-1 min-w-0" style={{ overflow: 'visible' }}>
              <div ref={inputContainerRef} className="relative w-full" style={{ overflow: 'visible' }}>
                <TextField
                  className="h-auto grow shrink-0 basis-0"
                  variant="filled"
                  label=""
                  helpText=""
                  icon={null}
                  iconRight="FeatherPlus"
                >
                  <TextFieldInput
                    ref={textFieldRef}
                    placeholder={
                      isLoading
                        ? `Generating text${loadingEllipses}`
                        : isPreviewMode 
                          ? "Ask for another edit ..." 
                          : references.length > 0 
                            ? "Provide additional instructions to guide the AI ..." 
                            : "Describe your change or type '/' to search actions ..."
                    }
                    value={inputValue}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    style={{
                      paddingRight: references.length > 0 ? '80px' : undefined
                    }}
                  />
                </TextField>
                {references.length > 0 && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1 z-10">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Open reference selector if not already open
                        if (!showReferenceSelector) {
                          setShowReferenceSelector(true);
                        }
                      }}
                      className="flex items-center gap-1.5 rounded-md border border-solid border-neutral-border bg-neutral-50 px-2 py-0.5 shadow-sm hover:bg-neutral-100 transition-colors cursor-pointer"
                      title="Edit references"
                    >
                      <Paperclip size={12} className="text-gray-600 flex-shrink-0" />
                      <span className="text-xs font-medium text-gray-700 whitespace-nowrap flex-shrink-0" style={{ fontSize: '12px' }}>
                        {references.length}
                      </span>
                    </button>
                  </div>
                )}
              </div>
              <PrompterMenu
                isOpen={showMenu}
                onClose={() => setShowMenu(false)}
                prompterRef={prompterRef}
                inputContainerRef={isPreviewMode ? inputContainerRef : null}
                quickActions={mockQuickActions}
                savedPrompts={mockSavedPrompts}
                caseblinkPrompts={mockCaseblinkPrompts}
                searchQuery={getSearchQuery()}
                onQuickAction={handleQuickActionSelect}
                onSavedPrompt={handleSavedPromptSelect}
                onCaseblinkPrompt={handleCaseblinkPromptSelect}
                onReference={handleReferenceSelect}
                onStarPrompt={handleStarPrompt}
                starredPromptIds={starredPromptIds}
              />
            </div>
            {isPreviewMode ? (
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={handleCancel}
                  className="px-3 py-1.5 text-sm font-medium text-black rounded-full transition-all duration-200"
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
                >
                  Cancel
                </button>
                {inputValue.trim() ? (
                  <IconButton
                    variant="brand-primary"
                    size="medium"
                    icon={isLoading ? Square : ArrowRight}
                    onClick={handleSparklesClick}
                  />
                ) : (
                  <button
                    onClick={handleApply}
                    className="px-3 py-1.5 text-sm font-medium text-white rounded-full transition-all duration-200"
                    style={{
                      backgroundColor: 'rgb(0, 0, 139)',
                      transition: 'background-color 0.2s, border-color 0.2s, color 0.2s, fill 0.2s, stroke 0.2s, opacity 0.2s, box-shadow 0.2s, transform 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgb(0, 0, 120)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgb(0, 0, 139)';
                    }}
                  >
                    Apply
                  </button>
                )}
              </div>
            ) : (
              <IconButton
                variant="brand-primary"
                size="medium"
                icon={isLoading ? Square : ArrowRight}
                onClick={handleSparklesClick}
              />
            )}
          </div>
          {/* Preview Mode or Recent Actions Section */}
          {isPreviewMode ? (
            <div className="w-full py-1 relative min-w-0" style={{ width: '100%', maxWidth: '100%' }}>
              {/* Preview Textarea */}
              <textarea
                ref={previewTextareaRef}
                value={previewText}
                onChange={(e) => setPreviewText(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-black resize-none"
                rows={6}
                placeholder="Preview of edited text..."
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
              />
              
              {/* Used Prompt Section */}
              {usedPrompt && (
                <div className="mt-2 px-3 py-2 bg-gray-50 rounded-md">
                  <div className="flex items-center gap-2">
                    <Wand2 size={14} className="text-gray-500 flex-shrink-0" />
                    <span className="text-xs text-gray-700 flex-1 min-w-0 break-words">&ldquo;{usedPrompt}&rdquo;</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleUsedPromptStar();
                      }}
                      className="flex-shrink-0 p-1 rounded hover:bg-gray-200 transition-colors"
                      title={isPromptStarred ? "Remove from My Prompts" : "Add to My Prompts"}
                    >
                      <Star 
                        size={14} 
                        className={isPromptStarred ? "text-yellow-500 fill-yellow-500" : "text-gray-400"}
                        fill={isPromptStarred ? "currentColor" : "none"}
                      />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="w-full py-1 relative min-w-0" style={{ width: '100%', maxWidth: '100%', overflow: 'hidden' }}>
              <div className="flex items-center gap-2 px-1 min-w-0" style={{ width: '100%', maxWidth: '100%' }}>
                <Clock size={14} className="text-gray-500 flex-shrink-0" />
                <span className="text-xs font-medium text-gray-700 flex-shrink-0">Recent Actions</span>
                <div className="h-3 w-px bg-gray-300 flex-shrink-0"></div>
                {recentActions.length === 0 ? (
                  <p className="text-xs text-gray-400 flex-shrink-0">
                    This is where your recent actions will appear.
                  </p>
                ) : (
                  <div className="flex items-center gap-1 flex-1 min-w-0 overflow-hidden" style={{ width: '100%', maxWidth: '100%' }}>
                    {recentActions.length > 0 && promptsScrollPosition > 0 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (promptsContainerRef.current) {
                            const container = promptsContainerRef.current;
                            const children = Array.from(container.children) as HTMLElement[];
                            if (children.length === 0) return;
                            
                            // Find the first visible tag and scroll to show the previous one
                            let scrollAmount = 0;
                            const containerLeft = container.scrollLeft;
                            
                            for (let i = 0; i < children.length; i++) {
                              const child = children[i];
                              const childLeft = child.offsetLeft;
                              
                              // If this tag is at or past the visible area, scroll to show the previous one
                              if (childLeft >= containerLeft) {
                                if (i > 0) {
                                  // Scroll to show the previous tag
                                  const prevChild = children[i - 1] as HTMLElement;
                                  scrollAmount = prevChild.offsetLeft - container.scrollLeft;
                                } else {
                                  // Already at the first tag, scroll to the beginning
                                  scrollAmount = -container.scrollLeft;
                                }
                                break;
                              }
                            }
                            
                            container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
                          }
                        }}
                        className="flex-shrink-0 p-0.5 rounded hover:bg-gray-100 transition-colors"
                        title="Scroll left"
                      >
                        <ChevronLeft size={14} className="text-gray-500" />
                      </button>
                    )}
                    <div
                      ref={promptsContainerRef}
                      className="flex gap-1 flex-1 overflow-x-auto min-w-0"
                      style={{ 
                        scrollbarWidth: 'none', 
                        msOverflowStyle: 'none'
                      }}
                      onScroll={(e) => {
                        const target = e.target as HTMLDivElement;
                        setPromptsScrollPosition(target.scrollLeft);
                      }}
                    >
                      {recentActions.map((prompt) => (
                        <button
                          key={prompt.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            const newValue = inputValue + ' ' + prompt.prompt;
                            setInputValue(newValue);
                            if (textFieldRef.current) {
                              textFieldRef.current.focus();
                            }
                          }}
                          className="flex items-center gap-1 rounded-md border border-gray-200 bg-gray-50 px-2 py-1 text-xs text-gray-700 hover:bg-gray-100 transition-colors whitespace-nowrap flex-shrink-0"
                        >
                          <span>{prompt.label}</span>
                        </button>
                      ))}
                    </div>
                    {recentActions.length > 0 && canScrollRight && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (promptsContainerRef.current) {
                            const container = promptsContainerRef.current;
                            const children = Array.from(container.children) as HTMLElement[];
                            if (children.length === 0) return;
                            
                            // Find the first tag that's not fully visible
                            let scrollAmount = 0;
                            const containerLeft = container.scrollLeft;
                            const containerRight = containerLeft + container.clientWidth;
                            
                            for (let i = 0; i < children.length; i++) {
                              const child = children[i];
                              const childLeft = child.offsetLeft;
                              const childRight = childLeft + child.offsetWidth;
                              
                              // If this tag is partially visible or just out of view, scroll to show the next one
                              if (childRight > containerRight || (childLeft >= containerLeft && childRight > containerRight)) {
                                scrollAmount = childLeft - container.scrollLeft;
                                break;
                              }
                              
                              // If we're at the last tag and it's fully visible, scroll to the end
                              if (i === children.length - 1 && childRight <= containerRight) {
                                scrollAmount = container.scrollWidth - container.scrollLeft - container.clientWidth;
                              }
                            }
                            
                            container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
                          }
                        }}
                        className="flex-shrink-0 p-0.5 rounded hover:bg-gray-100 transition-colors"
                        title="Scroll right"
                      >
                        <ChevronRight size={14} className="text-gray-500" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {showReferenceSelector && (
        <InlineReferenceSelector
          isOpen={showReferenceSelector}
          availableReferences={mockReferences}
          selectedReferences={references}
          onSelectReference={handleSelectReference}
          onRemoveReference={handleRemoveReferenceFromSelector}
          onClose={() => setShowReferenceSelector(false)}
          prompterRef={prompterRef}
          inputContainerRef={isPreviewMode ? inputContainerRef : null}
          prompterWidth={prompterWidth}
        />
      )}
    </>
  );
};

export default InTextPrompter;
