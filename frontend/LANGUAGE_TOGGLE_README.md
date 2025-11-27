# Language Toggle Feature 🌐

## Overview
The PD-SmartDoc application now supports both **English** and **Portuguese** languages with a convenient toggle button.

## Features
- **Real-time language switching** - All text updates immediately when you change the language
- **Persistent across all pages** - The language preference applies to all modules (Home, EDPS, DVP, DFMEA, Search)
- **Comprehensive translation** - All UI elements, labels, messages, and instructions are translated

## How to Use
1. Look for the **language toggle button** in the top-right corner of the screen
2. Click the button to switch between English and Portuguese
3. The flag icon and language code will update to show the current language:
   - 🇧🇷 PT - Currently in English, click to switch to Portuguese
   - 🇺🇸 EN - Currently in Portuguese, click to switch to English

## What's Translated
### Home Page
- Welcome message and subtitle
- Module cards (EDPS, DVP, DFMEA descriptions)
- Search action button
- "How it works" section

### EDPS Module
- Page title and description
- Greeting messages
- Quick reply buttons
- Field labels (Norm Number, Title, Description, Target)
- Summary review screen

### DVP Module
- Page title and description
- Greeting messages
- Quick reply buttons
- Field labels (Procedure ID, Type, Test Name, Objective, etc.)
- Summary review screen

### DFMEA Module
- Page title and description
- Greeting messages
- Quick reply buttons
- Field labels (Generic Failure, Failure Mode, Cause, Severity, etc.)
- Summary review screen

### Search Page
- Search placeholder text
- Filter options
- Status labels
- Date fields
- Results section

### Common Elements
- "Back to Home" button
- "Save" and "Cancel" buttons
- Status badges (Draft, Active, Inactive)
- Loading messages
- Error messages

## Technical Implementation
The feature uses:
- **React Context API** - For global language state management
- **i18n Pattern** - Translation files in JSON format (`en.json`, `pt.json`)
- **useLanguage Hook** - Custom hook to access translations in any component

## Translation Files
Located in `frontend/src/locales/`:
- `en.json` - English translations
- `pt.json` - Portuguese translations

To add new translations:
1. Add the key-value pair in both `en.json` and `pt.json`
2. Use the `t()` function in components: `t('your.translation.key')`

## Example Usage in Components
```typescript
import { useLanguage } from '../contexts/LanguageContext'

function MyComponent() {
  const { t, language, setLanguage } = useLanguage()
  
  return (
    <div>
      <h1>{t('home.welcome')}</h1>
      <button onClick={() => setLanguage(language === 'en' ? 'pt' : 'en')}>
        Toggle Language
      </button>
    </div>
  )
}
```

## Default Language
The application starts in **English** by default. Users can switch to Portuguese at any time.

## Future Enhancements
- Remember user's language preference in localStorage
- Add more languages (Spanish, French, etc.)
- Auto-detect browser language
- Translate AI-generated conversational messages

