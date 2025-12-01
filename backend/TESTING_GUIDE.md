# Testing the Airtable Integration

## Prerequisites
1. MongoDB running locally or connection string ready
2. Airtable OAuth app created with client ID and secret
3. Dependencies installed: `npm install`

## Setup

### 1. Create `.env` file
```bash
cd backend
cp sample.env.example .env
```

### 2. Configure `.env`
```env
PORT=3000
DATABASE_URL=mongodb://localhost:27017/airtable_forms

# Airtable OAuth
AIRTABLE_CLIENT_ID=your_actual_client_id
AIRTABLE_CLIENT_SECRET=your_actual_client_secret
AIRTABLE_REDIRECT_URI=http://localhost:3000/auth/airtable/callback
```

### 3. Start the server
```bash
npm run dev
```

## Testing Flow

### Step 1: Authenticate with Airtable

1. **Open browser and navigate to:**
   ```
   http://localhost:3000/auth/airtable
   ```

2. **You'll be redirected to Airtable** to authorize the app

3. **After authorization**, you'll be redirected back with a response like:
   ```json
   {
     "success": true,
     "message": "Authentication successful",
     "user": {
       "id": "6789...",
       "airtableUserId": "usr123...",
       "profile": {
         "id": "usr123...",
         "email": "user@example.com",
         "bases": [...]
       }
     }
   }
   ```

4. **Save the user ID** from the response - you'll need it for subsequent requests

### Step 2: Test API Endpoints

#### Get User's Bases
```bash
curl -X GET http://localhost:3000/forms/bases \
  -H "x-user-id: YOUR_USER_ID_HERE"
```

**Expected Response:**
```json
{
  "bases": [
    {
      "id": "appXXXXXXXXXXXXXX",
      "name": "My Base",
      "permissionLevel": "create"
    }
  ]
}
```

#### Get Base Schema
```bash
curl -X GET http://localhost:3000/forms/bases/appXXXXXXXXXXXXXX/schema \
  -H "x-user-id: YOUR_USER_ID_HERE"
```

**Expected Response:**
```json
{
  "tables": [
    {
      "id": "tblYYYYYYYYYYYYYY",
      "name": "Table 1",
      "fields": [
        {
          "id": "fldZZZZZZZZZZZZZZ",
          "name": "Name",
          "type": "singleLineText"
        }
      ]
    }
  ]
}
```

#### Create a Form
```bash
curl -X POST http://localhost:3000/forms \
  -H "Content-Type: application/json" \
  -H "x-user-id: YOUR_USER_ID_HERE" \
  -d '{
    "airtableBaseId": "appXXXXXXXXXXXXXX",
    "airtableTableId": "tblYYYYYYYYYYYYYY",
    "title": "Contact Form",
    "questions": [
      {
        "questionKey": "name",
        "airtableFieldId": "fldZZZZZZZZZZZZZZ",
        "label": "What is your name?",
        "type": "short_text",
        "required": true
      }
    ]
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "form": {
    "_id": "...",
    "owner": "...",
    "airtableBaseId": "appXXXXXXXXXXXXXX",
    "airtableTableId": "tblYYYYYYYYYYYYYY",
    "title": "Contact Form",
    "questions": [...]
  }
}
```

#### Get All Forms
```bash
curl -X GET http://localhost:3000/forms \
  -H "x-user-id: YOUR_USER_ID_HERE"
```

## Testing with Postman

### 1. Import Collection
Create a new Postman collection with these requests:

**Environment Variables:**
- `BASE_URL`: `http://localhost:3000`
- `USER_ID`: (set after authentication)

### 2. Requests

#### Auth - Airtable OAuth
- **Method**: GET
- **URL**: `{{BASE_URL}}/auth/airtable`
- **Note**: Open in browser, not Postman

#### Get Bases
- **Method**: GET
- **URL**: `{{BASE_URL}}/forms/bases`
- **Headers**: `x-user-id: {{USER_ID}}`

#### Get Base Schema
- **Method**: GET
- **URL**: `{{BASE_URL}}/forms/bases/:baseId/schema`
- **Headers**: `x-user-id: {{USER_ID}}`
- **Path Variables**: `baseId: appXXXXXXXXXXXXXX`

#### Create Form
- **Method**: POST
- **URL**: `{{BASE_URL}}/forms`
- **Headers**: 
  - `Content-Type: application/json`
  - `x-user-id: {{USER_ID}}`
- **Body**: (see JSON above)

## Direct Service Testing

You can also test the Airtable service directly in a script:

```javascript
// test-airtable.js
const mongoose = require('mongoose');
const airtableService = require('./src/services/airtableService');

async function test() {
  await mongoose.connect(process.env.DATABASE_URL);
  
  const userId = 'YOUR_USER_ID';
  
  // Test fetching bases
  const bases = await airtableService.fetchBases(userId);
  console.log('Bases:', bases);
  
  // Test fetching records
  const records = await airtableService.fetchRecords(
    userId,
    'appXXXXXXXXXXXXXX',
    'tblYYYYYYYYYYYYYY',
    { maxRecords: 10 }
  );
  console.log('Records:', records);
  
  await mongoose.disconnect();
}

test().catch(console.error);
```

Run with:
```bash
node test-airtable.js
```

## Common Issues

### 1. "User not authenticated"
- Make sure you've completed OAuth flow first
- Check that you're sending the correct `x-user-id` header

### 2. "Access token expired"
- Call the refresh token endpoint
- Or re-authenticate via `/auth/airtable`

### 3. "Invalid base or table ID"
- Verify the base/table IDs from the `/forms/bases` endpoint
- Make sure the user has access to that base

### 4. MongoDB connection error
- Ensure MongoDB is running
- Check DATABASE_URL in .env

## Production Considerations

Before deploying to production:

1. **Replace auth middleware** with JWT-based authentication
2. **Add CORS** configuration for frontend
3. **Encrypt tokens** at rest in database
4. **Add rate limiting** to prevent abuse
5. **Implement token refresh** automatically on 401 errors
6. **Add logging** for debugging
7. **Use HTTPS** for all OAuth flows
