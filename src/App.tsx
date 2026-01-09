import React, { useState, useEffect } from 'react';
import InTextPrompter from './components/InTextPrompter';
import './App.css';

const App: React.FC = () => {
  const [selectedText, setSelectedText] = useState('');
  const [selectionPosition, setSelectionPosition] = useState<{ top: number; left: number; height: number } | null>(null);
  const [showPrompter, setShowPrompter] = useState(false);

  useEffect(() => {
    const handleSelection = (e: MouseEvent) => {
      // Check if the click was inside any prompter element
      const prompterElements = document.querySelectorAll('[data-in-text-prompter]');
      if (e.target instanceof Node) {
        for (const prompterElement of prompterElements) {
          if (prompterElement.contains(e.target)) {
            return; // Don't close if clicking inside any prompter element
          }
        }
      }

      const selection = window.getSelection();
      
      if (selection && selection.toString().trim().length > 0) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        
        setSelectedText(selection.toString().trim());
        setSelectionPosition({
          top: rect.top,
          left: rect.left,
          height: rect.height
        });
        setShowPrompter(true);
      } else {
        // Only close if we're not clicking inside any prompter element
        const prompterElements = document.querySelectorAll('[data-in-text-prompter]');
        let isInsidePrompter = false;
        if (e.target instanceof Node) {
          for (const prompterElement of prompterElements) {
            if (prompterElement.contains(e.target)) {
              isInsidePrompter = true;
              break;
            }
          }
        }
        if (!isInsidePrompter) {
          setShowPrompter(false);
          setSelectedText('');
          setSelectionPosition(null);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      // Don't handle keyup if user is typing in an input field
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      // Only handle Escape key to close
      if (e.key === 'Escape') {
        setShowPrompter(false);
        setSelectedText('');
        setSelectionPosition(null);
        window.getSelection()?.removeAllRanges();
        return;
      }

      // Check for text selection changes (e.g., arrow keys)
      const selection = window.getSelection();
      if (selection && selection.toString().trim().length > 0) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        
        setSelectedText(selection.toString().trim());
        setSelectionPosition({
          top: rect.top,
          left: rect.left,
          height: rect.height
        });
        setShowPrompter(true);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      // Check if click is inside any element with data-in-text-prompter attribute
      const prompterElements = document.querySelectorAll('[data-in-text-prompter]');
      if (e.target instanceof Node) {
        for (const prompterElement of prompterElements) {
          if (prompterElement.contains(e.target)) {
            return; // Don't close if clicking inside any prompter element
          }
        }
      }
      
      // Only close if clicking outside and no text is selected
      const selection = window.getSelection();
      if (!selection || selection.toString().trim().length === 0) {
        setShowPrompter(false);
        setSelectedText('');
        setSelectionPosition(null);
      }
    };

    document.addEventListener('mouseup', handleSelection);
    document.addEventListener('keyup', handleKeyUp);
    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('mouseup', handleSelection);
      document.removeEventListener('keyup', handleKeyUp);
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const handleClose = () => {
    setShowPrompter(false);
    setSelectedText('');
    setSelectionPosition(null);
    window.getSelection()?.removeAllRanges();
  };

  return (
    <div className="app-container">
      <div className="content-wrapper">
        <h1 className="text-3xl font-bold mb-6">Legal Case Analysis</h1>
        
        <div className="document-content">
          <h2 className="text-2xl font-semibold mb-4">Johnson v. State - Case Brief</h2>
          
          <section className="mb-6">
            <h3 className="text-xl font-semibold mb-3">Case Summary</h3>
            <p className="mb-4">
              In Johnson v. State, the defendant was charged with first-degree murder following an incident 
              that occurred on the evening of March 15, 2023. The prosecution alleged that the defendant, 
              acting with premeditation and malice aforethought, intentionally caused the death of the victim 
              through the use of a deadly weapon. The defense argued that the defendant acted in self-defense, 
              claiming that the victim had initiated the confrontation and posed an immediate threat to the 
              defendant's life.
            </p>
            <p className="mb-4">
              The trial court heard testimony from multiple witnesses, including law enforcement officers, 
              forensic experts, and individuals present at the scene. Key evidence included surveillance 
              footage from nearby establishments, DNA analysis, and ballistics reports. The defense 
              presented evidence of the victim's prior violent conduct and argued that this history 
              supported the defendant's claim of reasonable fear for personal safety.
            </p>
          </section>

          <section className="mb-6">
            <h3 className="text-xl font-semibold mb-3">Legal Issues</h3>
            <p className="mb-4">
              The primary legal issues before the court were: (1) whether the prosecution met its burden 
              of proving beyond a reasonable doubt that the defendant acted with the requisite mental 
              state for first-degree murder; (2) whether the defendant's claim of self-defense was 
              supported by sufficient evidence to create reasonable doubt; and (3) whether the trial 
              court properly admitted certain evidence over defense objections.
            </p>
            <p className="mb-4">
              The court examined the elements of first-degree murder under state law, which requires 
              proof of an intentional killing committed with premeditation and deliberation. The 
              prosecution must demonstrate that the defendant had time to reflect upon the decision 
              to kill, however brief that reflection may have been. The defense's self-defense claim 
              required showing that the defendant reasonably believed deadly force was necessary to 
              prevent imminent death or serious bodily harm.
            </p>
          </section>

          <section className="mb-6">
            <h3 className="text-xl font-semibold mb-3">Court's Analysis</h3>
            <p className="mb-4">
              The court conducted a thorough review of the evidence, applying the relevant legal 
              standards to the facts presented. In analyzing the premeditation element, the court 
              considered the defendant's actions leading up to the incident, including any planning 
              or preparation. The surveillance footage showed the defendant arriving at the location 
              approximately thirty minutes before the altercation, which the prosecution argued 
              demonstrated premeditation.
            </p>
            <p className="mb-4">
              Regarding the self-defense claim, the court evaluated whether a reasonable person in 
              the defendant's position would have believed that deadly force was necessary. The 
              court considered the nature of the threat, the defendant's opportunity to retreat, 
              and whether the force used was proportional to the threat faced. Expert testimony 
              regarding the dynamics of the confrontation was particularly relevant to this analysis.
            </p>
          </section>

          <section className="mb-6">
            <h3 className="text-xl font-semibold mb-3">Holding and Reasoning</h3>
            <p className="mb-4">
              The court found the defendant guilty of first-degree murder, concluding that the 
              prosecution had met its burden of proof. The court determined that the evidence 
              established premeditation through the defendant's actions and statements, and that 
              the self-defense claim was not supported by the evidence. The court noted that while 
              the victim had a history of violent conduct, the specific circumstances of the 
              incident did not support a reasonable belief that deadly force was necessary.
            </p>
            <p className="mb-4">
              In reaching this conclusion, the court emphasized that self-defense requires both a 
              subjective belief in the need for deadly force and an objective reasonableness of 
              that belief. The court found that the defendant's actions, including the timing and 
              manner of the confrontation, undermined the reasonableness of the self-defense claim. 
              The court also found that the defendant had opportunities to retreat that were not 
              taken, further weakening the self-defense argument.
            </p>
          </section>

          <section className="mb-6">
            <h3 className="text-xl font-semibold mb-3">Significance</h3>
            <p className="mb-4">
              This case illustrates the complex interplay between the elements of first-degree 
              murder and self-defense claims in criminal proceedings. The court's analysis 
              demonstrates the importance of examining both the subjective and objective components 
              of self-defense, and the need for careful evaluation of all available evidence when 
              determining whether a defendant's actions were justified.
            </p>
            <p className="mb-4">
              The decision also highlights the challenges in proving premeditation, particularly 
              when the time between planning and execution may be brief. The court's approach to 
              evaluating the totality of circumstances provides guidance for future cases involving 
              similar factual patterns. Legal practitioners should note the court's emphasis on 
              considering all relevant factors, including the defendant's conduct before, during, 
              and after the incident.
            </p>
          </section>
        </div>
      </div>

      {showPrompter && selectionPosition && (
        <InTextPrompter
          selectedText={selectedText}
          position={selectionPosition}
          onClose={handleClose}
        />
      )}
    </div>
  );
};

export default App;
