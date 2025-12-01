# Quick Reference - Airtable Integration

## 🚀 Quick Start

```bash
# 1. Install dependencies
cd backend
npm install

# 2. Setup environment
cp sample.env.example .env
# Edit .env with your Airtable credentials

# 3. Start server
npm run dev
```

## 🔑 API Endpoints

### Authentication
```
GET  /auth/airtable              # Start OAuth flow (open in browser)
GET  /auth/airtable/callback     # OAuth callback (automatic)
```

### Forms (Requires auth header: `x-user-id: YOUR_USER_ID`)
```
GET  /forms                      # Get all user's forms
POST /forms                      # Create new form
GET  /forms/bases                # Get user's Airtable bases
GET  /forms/bases/:baseId/schema # Get base schema
```

## 💻 Code Snippets

### Using Airtable Service
```javascript
const airtableService = require('./services/airtableService');

// Fetch bases
const bases = await airtableService.fetchBases(userId);

// Fetch records
const records = await airtableService.fetchRecords(
  userId, 
  baseId, 
  tableId, 
  { maxRecords: 10 }
);

// Create record
const record = await airtableService.createRecord(
  userId,
  baseId,
  tableId,
  { Name: 'John', Email: 'john@example.com' }
);
```

### Create Form
```bash
curl -X POST http://localhost:3000/forms \
  -H "Content-Type: application/json" \
  -H "x-user-id: YOUR_USER_ID" \
  -d '{
    "airtableBaseId": "appXXX",
    "airtableTableId": "tblYYY",
    "title": "My Form",
    "questions": []
  }'
```

## 📋 Environment Variables

```env
PORT=3000
DATABASE_URL=
AIRTABLE_CLIENT_ID=your_client_id
AIRTABLE_CLIENT_SECRET=your_client_secret
AIRTABLE_REDIRECT_URI=http://localhost:3000/auth/airtable/callback
```

## 🔧 Service Methods

| Method | Parameters | Returns |
|--------|-----------|---------|
| `fetchBases` | `userId` | User's bases |
| `fetchBaseSchema` | `userId, baseId` | Tables & fields |
| `fetchRecords` | `userId, baseId, tableId, options` | Records array |
| `createRecord` | `userId, baseId, tableId, fields` | New record |
| `updateRecord` | `userId, baseId, tableId, recordId, fields` | Updated record |
| `deleteRecord` | `userId, baseId, tableId, recordId` | Deleted record |
| `refreshAccessToken` | `userId` | New access token |

## 🗂️ Database Models

### User
```javascript
{
  airtableUserId: String,
  profile: { id, email, bases: [...] },
  accessToken: String,
  refreshToken: String
}
```

### Form
```javascript
{
  owner: ObjectId,
  airtableBaseId: String,
  airtableTableId: String,
  title: String,
  questions: [{ questionKey, label, type, ... }]
}
```

## 🧪 Testing Flow

1. **Authenticate**: Visit `http://localhost:3000/auth/airtable`
2. **Get User ID**: Copy from response
3. **Test Endpoints**: Use user ID in `x-user-id` header
4. **Fetch Bases**: `GET /forms/bases`
5. **Create Form**: `POST /forms` with base/table IDs

## ⚠️ Common Issues

| Issue | Solution |
|-------|----------|
| "User not authenticated" | Add `x-user-id` header |
| "Access token expired" | Re-authenticate or call refresh |
| "Invalid base ID" | Check base ID from `/forms/bases` |
| MongoDB error | Ensure MongoDB is running |

## 📚 Documentation

- `IMPLEMENTATION_SUMMARY.md` - Complete overview
- `OAUTH_IMPLEMENTATION.md` - OAuth details
- `AIRTABLE_SERVICE_GUIDE.md` - Service usage
- `TESTING_GUIDE.md` - Testing instructions

## 🎯 Key Files

```
src/
├── controllers/authController.js    # OAuth logic
├── controllers/formController.js    # Form + Airtable integration
├── services/airtableService.js      # Airtable API wrapper
├── middleware/auth.js               # Authentication
└── models/User.js                   # User with tokens
```

## 🔐 Security Notes

- Tokens stored in database (not exposed to client)
- All form routes require authentication
- Users can only access their own data
- Token refresh available for expired tokens

## 🚀 Production TODO

- [ ] Replace auth middleware with JWT
- [ ] Encrypt tokens at rest
- [ ] Add rate limiting
- [ ] Configure CORS
- [ ] Add logging
- [ ] Auto token refresh on 401
- [ ] Add caching for schemas
- [ ] Implement webhooks
- [ ] Add tests
