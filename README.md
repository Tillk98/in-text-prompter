# In-Text Prompter

An AI-powered case generation app for legal professionals with an in-text prompter feature that appears when text is selected.

## Features

- **In-Text Prompter**: Appears above selected text when you highlight any portion of the document
- **AI Integration Ready**: Input field for additional instructions to guide AI generation
- **Context Tags**: Display and manage context tags (Case Brief, Strategy Doc, etc.)
- **Responsive Design**: Automatically positions itself to stay within viewport boundaries

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

This will start the development server, typically at `http://localhost:5173`

### Build

```bash
npm run build
```

## Usage

1. Open the application in your browser
2. Select any text in the document by clicking and dragging
3. The in-text prompter will appear above the selected text
4. Enter additional instructions in the text field
5. Click the sparkles icon to trigger AI generation (currently logs to console)
6. Manage context tags by clicking the X icon on any tag

## Project Structure

```
src/
  components/
    InTextPrompter.tsx  # Main prompter component
    TextField.tsx        # Text input component
    IconButton.tsx       # Icon button component
  App.tsx               # Main application with test content
  main.tsx              # Application entry point
```

## Technologies

- React 18
- TypeScript
- Vite
- Tailwind CSS (via inline styles and classes)
