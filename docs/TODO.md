# Agri Marketplace Feature Implementation Roadmap

## Backend Architecture
- [x] Update `server/db.js` to include in-memory crops array
- [x] Modify `server/routes/crops.js` to support filters, pagination, and GPS distance queries
- [x] Add recent prices endpoint for marketplace display
- [x] Add Google Firebase Auth token verification with role preservation (`server/routes/auth.js`)
- [x] Add Great-Circle Haversine distance calculation and radius filters

## Frontend Pages & Components
- [x] Create `client/src/pages/AddCrop.js` - Form for farmers to add crop listings with GPS auto-detection
- [x] Update `client/src/pages/Marketplace.js` - Add GPS "Near Me" filter, distance badges, and OpenStreetMap modal
- [x] Update `client/src/pages/CropDetail.js` - WhatsApp direct inquiry and share actions
- [x] Create `client/src/components/CropsMapView.js` - Leaflet interactive map modal with farm markers

## Voice Commands 🎙️
- [x] Create `client/src/components/VoiceCommands.js` - Web Speech API integration with multi-language synchronization (en-IN, hi-IN, mr-IN)
- [x] Add Text-To-Speech audible confirmations
- [x] Add voice commands guide sheet modal

## Translation & Accessibility 🌐
- [x] Install translation library (`i18next`, `react-i18next`, `i18next-browser-languagedetector`)
- [x] Create translation files for English, Hindi, and Marathi (`en.json`, `hi.json`, `mr.json`)
- [x] Add language switcher dropdown component in navigation with active states

## Testing & Quality Assurance
- [x] Automated test suite in `tests/automated/`
- [x] Manual HTML browser fixtures in `tests/manual/`
- [x] Production build validation with 0 compilation errors
