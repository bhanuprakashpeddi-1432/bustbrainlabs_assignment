# Airtable-Connected Dynamic Form Builder

A full-stack MERN application that allows users to create dynamic forms connected to Airtable, with conditional logic, OAuth authentication, and real-time webhook synchronization.

## 🎯 Features

### ✅ Implemented Features

1. **Airtable OAuth Authentication**
   - Complete OAuth 2.0 flow
   - User profile and bases stored in MongoDB
   - Secure token management

2. **Dynamic Form Builder**
   - Select Airtable base and table
   - Choose fields to include in form
   - Rename labels and mark fields as required
   - Configure conditional logic rules

3. **Conditional Logic**
   - Show/hide questions based on answers
   - Support for AND/OR logic operators
   - Multiple condition types (equals, notEquals, contains)
   - Real-time evaluation

4. **Supported Field Types**
   - Short text (single line)
   - Long text (multi-line)
   - Single select (dropdown)
   - Multi select (checkboxes)
   - Attachment (file upload)

5. **Form Submission**
   - Validates responses against form definition
   - Creates records in Airtable
   - Saves to MongoDB
   - Applies conditional logic during submission

6. **Response Management**
   - List all responses for a form
   - View individual response details
   - Pagination support

7. **Webhook Synchronization**
   - Syncs database when Airtable records change
   - Handles record updates
   - Soft deletes for removed records
   - Signature verification

## 🛠️ Tech Stack

### Backend
- **Node.js** + **Express.js** - REST API
- **MongoDB** + **Mongoose** - Database and ODM
- **Axios** - HTTP client for Airtable API
- **Crypto** - Webhook signature verification

### Frontend (To be implemented)
- **React** + **Vite** - UI framework
- **React Router** - Navigation
- **Axios** - API client

## 📁 Project Structure

```
Assignment/
├── backend/
│   ├── src/
│   │   ├── app.js                      # Express app configuration
│   │   ├── server.js                   # Server entry point
│   │   ├── config/
│   │   │   ├── airtable.js             # Airtable OAuth config
│   │   │   └── db.js                   # MongoDB connection
│   │   ├── models/
│   │   │   ├── User.js                 # User schema with tokens
│   │   │   ├── Form.js                 # Form schema
│   │   │   └── Response.js             # Response schema
│   │   ├── routes/
│   │   │   ├── auth.js                 # OAuth routes
│   │   │   ├── forms.js                # Form routes
│   │   │   ├── responses.js            # Response routes
│   │   │   └── webhooks.js             # Webhook routes
│   │   ├── controllers/
│   │   │   ├── authController.js       # OAuth logic
│   │   │   ├── formController.js       # Form CRUD
│   │   │   ├── responseController.js   # Response handling
│   │   │   └── webhookController.js    # Webhook handler
│   │   ├── services/
│   │   │   ├── airtableService.js      # Airtable API wrapper
│   │   │   └── shouldShowQuestion.js   # Conditional logic
│   │   ├── utils/
│   │   │   └── validateAirtableTypes.js # Field validation
│   │   └── middleware/
│   │       └── auth.js                 # Authentication middleware
│   ├── sample.env.example              # Environment variables template
│   ├── package.json                    # Dependencies
│   ├── API_DOCUMENTATION.md            # API docs
│   ├── IMPLEMENTATION_SUMMARY.md       # Implementation overview
│   ├── AIRTABLE_SERVICE_GUIDE.md       # Service usage guide
│   ├── TESTING_GUIDE.md                # Testing instructions
│   └── QUICK_REFERENCE.md              # Quick reference
├── frontend/                           # (To be implemented)
│   └── src/
│       ├── App.jsx
│       ├── pages/
│       ├── components/
│       └── services/
└── IMPLEMENTATION_PLAN.md              # Development roadmap
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Airtable account with OAuth app

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Assignment/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp sample.env.example .env
   ```

   Edit `.env` with your credentials:
   ```env
   PORT=3000
   DATABASE_URL=mongodb://localhost:27017/airtable_forms

   # Airtable OAuth
   AIRTABLE_CLIENT_ID=your_client_id
   AIRTABLE_CLIENT_SECRET=your_client_secret
   AIRTABLE_REDIRECT_URI=http://localhost:3000/auth/airtable/callback

   # Webhook Secret (optional)
   WEBHOOK_SECRET=your_webhook_secret
   ```

4. **Start MongoDB**
   ```bash
   # If using local MongoDB
   mongod
   ```

5. **Run the server**
   ```bash
   npm run dev
   ```

   Server will start on `http://localhost:3000`

### Airtable OAuth Setup

1. Go to [Airtable Developer Hub](https://airtable.com/create/oauth)
2. Create a new OAuth integration
3. Set redirect URI: `http://localhost:3000/auth/airtable/callback`
4. Add scopes:
   - `data.records:read`
   - `data.records:write`
   - `schema.bases:read`
5. Copy Client ID and Client Secret to `.env`

### Testing the API

1. **Authenticate with Airtable**
   ```
   Open browser: http://localhost:3000/auth/airtable
   ```

2. **Save your user ID** from the response

3. **Test endpoints** using the user ID:
   ```bash
   # Get your bases
   curl -H "x-user-id: YOUR_USER_ID" http://localhost:3000/forms/bases

   # Get base schema
   curl -H "x-user-id: YOUR_USER_ID" \
     http://localhost:3000/forms/bases/appXXXXXXXXXXXXXX/schema

   # Create a form
   curl -X POST http://localhost:3000/forms \
     -H "Content-Type: application/json" \
     -H "x-user-id: YOUR_USER_ID" \
     -d '{
       "airtableBaseId": "appXXXXXXXXXXXXXX",
       "airtableTableId": "tblYYYYYYYYYYYYYY",
       "title": "Contact Form",
       "questions": [...]
     }'
   ```

See [TESTING_GUIDE.md](backend/TESTING_GUIDE.md) for detailed testing instructions.

## 📖 Documentation

- **[API Documentation](backend/API_DOCUMENTATION.md)** - Complete API reference
- **[Implementation Summary](backend/IMPLEMENTATION_SUMMARY.md)** - Overview of implementation
- **[Airtable Service Guide](backend/AIRTABLE_SERVICE_GUIDE.md)** - How to use the Airtable service
- **[Testing Guide](backend/TESTING_GUIDE.md)** - Step-by-step testing
- **[Quick Reference](backend/QUICK_REFERENCE.md)** - Quick reference card
- **[Implementation Plan](IMPLEMENTATION_PLAN.md)** - Development roadmap

## 🔧 Key Features Explained

### Conditional Logic

The `shouldShowQuestion` function evaluates whether a question should be displayed based on previous answers:

```javascript
const rules = {
  logic: "AND",
  conditions: [
    {
      questionKey: "role",
      operator: "equals",
      value: "Engineer"
    }
  ]
};

const answers = { role: "Engineer" };
const shouldShow = shouldShowQuestion(rules, answers); // true
```

### Field Type Validation

Only supported Airtable field types are allowed:
- `short_text` (singleLineText)
- `long_text` (multilineText)
- `single_select` (singleSelect)
- `multi_select` (multipleSelects)
- `attachment` (multipleAttachments)

Unsupported types are automatically rejected.

### Webhook Synchronization

When Airtable records change, webhooks update the local database:
- **Record updated**: Syncs changes to MongoDB
- **Record deleted**: Marks as `deletedInAirtable` (soft delete)

## 🔐 Security

- OAuth 2.0 authentication
- Tokens stored securely in MongoDB
- Webhook signature verification
- User data isolation
- Input validation

## 🚧 TODO

### Backend
- [ ] JWT-based authentication (replace header-based auth)
- [ ] Token encryption at rest
- [ ] Rate limiting
- [ ] CORS configuration
- [ ] Comprehensive error logging

### Frontend
- [ ] React app setup
- [ ] Authentication flow
- [ ] Form builder UI
- [ ] Form viewer with conditional logic
- [ ] Response listing page
- [ ] Dashboard

### Deployment
- [ ] Deploy backend to Render/Railway
- [ ] Deploy frontend to Vercel/Netlify
- [ ] Configure production environment variables
- [ ] Update OAuth redirect URIs

## 📝 API Endpoints

### Authentication
- `GET /auth/airtable` - Initiate OAuth
- `GET /auth/airtable/callback` - OAuth callback

### Forms
- `GET /forms` - Get user's forms (protected)
- `GET /forms/:formId` - Get form definition (public)
- `POST /forms` - Create form (protected)
- `GET /forms/bases` - Get user's bases (protected)
- `GET /forms/bases/:baseId/schema` - Get base schema (protected)
- `GET /forms/:formId/responses` - List responses (protected)

### Responses
- `POST /responses/:formId/submit` - Submit form (public)
- `GET /responses/:responseId` - Get response details

### Webhooks
- `POST /webhooks/airtable` - Airtable webhook handler
- `GET /webhooks/airtable/test` - Test webhook

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Test webhook endpoint
curl http://localhost:3000/webhooks/airtable/test
```

## 📦 Dependencies

```json
{
  "express": "^4.18.2",
  "mongoose": "^8.0.0",
  "axios": "^1.6.0",
  "dotenv": "^16.0.3"
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT

## 👤 Author

Bhanuprakash Peddi 

## 🙏 Acknowledgments

- Airtable API Documentation
- MERN Stack Community
- MongoDB Documentation

---

**Note**: This is an interview task project demonstrating full-stack development skills with Airtable integration.
