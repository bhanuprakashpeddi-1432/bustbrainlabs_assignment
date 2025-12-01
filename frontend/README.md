# Frontend - Airtable Form Builder

React frontend for the Airtable-Connected Dynamic Form Builder.

## Features

- Classic, professional design
- OAuth authentication with Airtable
- Form builder with 3-step wizard
- Conditional logic support
- Form viewer with real-time validation
- Response management

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env`:
   ```
   VITE_API_BASE_URL=http://localhost:3000
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```
   
   App will be available at `http://localhost:5173`

4. **Build for production**
   ```bash
   npm run build
   ```

## Project Structure

```
src/
├── App.jsx                 # Main app with routing
├── main.jsx                # Entry point
├── index.css               # Global styles (classic design)
├── components/
│   ├── Header.jsx          # Navigation header
│   ├── FormRenderer.jsx    # Dynamic form renderer
│   └── ConditionalEditor.jsx # Conditional logic editor
├── pages/
│   ├── Login.jsx           # Login page
│   ├── Dashboard.jsx       # Forms dashboard
│   ├── FormBuilder.jsx     # Form creation wizard
│   ├── FormViewer.jsx      # Public form viewer
│   └── ResponsesList.jsx   # Response management
├── services/
│   └── api.js              # API client
└── utils/
    └── shouldShowQuestion.js # Conditional logic
```

## Design

The frontend uses a **classic, professional design** with:

- Traditional color palette (blues, grays)
- Clean typography
- Card-based layouts
- Standard form controls
- Responsive grid system
- Professional spacing and shadows

## Routes

- `/` - Redirects to dashboard or login
- `/login` - Login page
- `/dashboard` - User's forms
- `/forms/new` - Create new form
- `/forms/:formId` - View/fill form (public)
- `/forms/:formId/responses` - View responses

## Technologies

- React 18
- React Router 6
- Axios
- Vite

## Development

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Deployment

See [DEPLOYMENT_GUIDE.md](../DEPLOYMENT_GUIDE.md) for deployment instructions.
