# MERN Stack Implementation Plan

## ✅ Completed Features

### Backend
- [x] OAuth authentication flow
- [x] User model with tokens
- [x] Form model with conditional logic
- [x] Response model
- [x] Airtable service (API wrapper)
- [x] Fetch bases endpoint
- [x] Fetch base schema endpoint
- [x] Create form endpoint
- [x] Get forms endpoint

## 🚧 TODO - Backend

### 1. Conditional Logic Function
- [ ] Implement `shouldShowQuestion()` pure function
- [ ] Add to `services/shouldShowQuestion.js`
- [ ] Write unit tests

### 2. Form Validation
- [ ] Implement `validateAirtableTypes()` in utils
- [ ] Validate supported field types (short_text, long_text, single_select, multi_select, attachment)
- [ ] Reject unsupported types

### 3. Form Viewer Endpoints
- [ ] `GET /forms/:formId` - Get single form definition
- [ ] Add public access (no auth required for viewing)

### 4. Response Submission
- [ ] `POST /forms/:formId/submit` - Submit form response
- [ ] Validate required fields
- [ ] Validate single/multi-select choices
- [ ] Create Airtable record
- [ ] Save to MongoDB
- [ ] Return response ID

### 5. Response Listing
- [ ] `GET /forms/:formId/responses` - List all responses
- [ ] Filter by form ID
- [ ] Include pagination
- [ ] Return from MongoDB only

### 6. Webhook Handler
- [ ] `POST /webhooks/airtable` - Handle Airtable webhooks
- [ ] Verify webhook signature
- [ ] Handle record updates
- [ ] Handle record deletions (soft delete)
- [ ] Update MongoDB accordingly

### 7. Additional Endpoints
- [ ] `GET /forms/:formId/full` - Get form with schema details
- [ ] `DELETE /forms/:formId` - Delete form
- [ ] `PUT /forms/:formId` - Update form

## 🚧 TODO - Frontend

### 1. Setup React App
- [ ] Initialize Vite + React
- [ ] Setup React Router
- [ ] Configure API client (axios)
- [ ] Add environment variables

### 2. Authentication Pages
- [ ] Login page with "Login with Airtable" button
- [ ] OAuth callback handler
- [ ] Store user session (localStorage/context)
- [ ] Protected route wrapper

### 3. Dashboard
- [ ] List all user's forms
- [ ] Create new form button
- [ ] View/Edit/Delete actions

### 4. Form Builder
- [ ] Step 1: Select Base
- [ ] Step 2: Select Table
- [ ] Step 3: Configure Fields
  - [ ] Select fields to include
  - [ ] Rename labels
  - [ ] Mark as required
  - [ ] Add conditional logic
- [ ] Save form

### 5. Form Viewer (Public)
- [ ] Load form definition
- [ ] Render fields dynamically
- [ ] Apply conditional logic in real-time
- [ ] Validate on submit
- [ ] Submit to backend

### 6. Response Listing
- [ ] Display all responses for a form
- [ ] Show submission details
- [ ] Filter/search responses

### 7. UI Components
- [ ] Form field components (text, select, multi-select, file upload)
- [ ] Conditional logic builder
- [ ] Loading states
- [ ] Error handling

## 🎯 Implementation Order

### Phase 1: Core Backend (Priority)
1. shouldShowQuestion function
2. validateAirtableTypes function
3. Form viewer endpoint
4. Response submission endpoint
5. Response listing endpoint

### Phase 2: Frontend Foundation
1. React app setup
2. Authentication flow
3. Dashboard
4. Form builder UI

### Phase 3: Advanced Features
1. Webhook handler
2. Response viewer
3. Real-time conditional logic in UI

### Phase 4: Polish & Deploy
1. Error handling
2. Loading states
3. Validation messages
4. Deploy backend (Render/Railway)
5. Deploy frontend (Vercel/Netlify)
6. Documentation & README

## 📋 Testing Checklist

- [ ] OAuth flow works end-to-end
- [ ] Form creation saves correctly
- [ ] Conditional logic evaluates properly
- [ ] Form submission creates Airtable record
- [ ] Form submission saves to MongoDB
- [ ] Responses list correctly
- [ ] Webhooks update database
- [ ] All supported field types work
- [ ] Unsupported types are rejected

## 🚀 Deployment Checklist

- [ ] Environment variables configured
- [ ] MongoDB connection string
- [ ] Airtable OAuth credentials
- [ ] CORS configured
- [ ] Frontend API URL set
- [ ] Backend deployed
- [ ] Frontend deployed
- [ ] OAuth redirect URI updated
