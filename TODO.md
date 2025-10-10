# Agri Marketplace Feature Implementation TODO

## Backend Modifications
- [x] Update `server/db.js` to include in-memory crops array
- [x] Modify `server/routes/crops.js` to use in-memory storage instead of MongoDB
- [x] Add recent prices endpoint for marketplace display

## Frontend Pages
- [x] Create `client/src/pages/AddCrop.js` - Form for farmers to add crop listings
- [x] Update `client/src/pages/Marketplace.js` - Add recent prices section

## Voice Commands
- [x] Create `client/src/components/VoiceCommands.js` - Web Speech API integration for Hindi/English
- [x] Add voice command button to main layout

## Translation
- [x] Install translation library (react-i18next)
- [x] Create translation files for English/Hindi
- [x] Add language switcher component

## Testing & Integration
- [x] Update routing for new pages in `client/src/App.js`
- [ ] Test all features work with in-memory storage
