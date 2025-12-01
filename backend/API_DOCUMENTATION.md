# Backend API Documentation

## Base URL
```
http://localhost:3000
```

## Authentication

Most endpoints require authentication. Include the user ID in the `x-user-id` header:
```
x-user-id: YOUR_USER_ID
```

**Note**: In production, replace with JWT token authentication.

---

## Endpoints

### Authentication

#### 1. Initiate OAuth Login
```http
GET /auth/airtable
```

**Description**: Redirects user to Airtable OAuth authorization page.

**Response**: HTTP 302 Redirect to Airtable

---

#### 2. OAuth Callback
```http
GET /auth/airtable/callback?code=AUTHORIZATION_CODE
```

**Description**: Handles OAuth callback, exchanges code for tokens, fetches user profile and bases.

**Response**:
```json
{
  "success": true,
  "message": "Authentication successful",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "airtableUserId": "usrXXXXXXXXXXXXXX",
    "profile": {
      "id": "usrXXXXXXXXXXXXXX",
      "email": "user@example.com",
      "bases": [...]
    }
  }
}
```

---

### Forms

#### 3. Get All User Forms
```http
GET /forms
Headers: x-user-id: USER_ID
```

**Description**: Get all forms created by the authenticated user.

**Response**:
```json
{
  "forms": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "owner": "507f191e810c19729de860ea",
      "airtableBaseId": "appXXXXXXXXXXXXXX",
      "airtableTableId": "tblYYYYYYYYYYYYYY",
      "title": "Contact Form",
      "questions": [...],
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

#### 4. Get Single Form (Public)
```http
GET /forms/:formId
```

**Description**: Get form definition by ID. No authentication required (for form viewers).

**Response**:
```json
{
  "form": {
    "id": "507f1f77bcf86cd799439011",
    "title": "Contact Form",
    "questions": [
      {
        "questionKey": "name",
        "airtableFieldId": "fldZZZZZZZZZZZZZZ",
        "label": "What is your name?",
        "type": "short_text",
        "required": true,
        "conditionalRules": null,
        "choices": []
      }
    ],
    "airtableBaseId": "appXXXXXXXXXXXXXX",
    "airtableTableId": "tblYYYYYYYYYYYYYY",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

#### 5. Create Form
```http
POST /forms
Headers: 
  Content-Type: application/json
  x-user-id: USER_ID
```

**Request Body**:
```json
{
  "airtableBaseId": "appXXXXXXXXXXXXXX",
  "airtableTableId": "tblYYYYYYYYYYYYYY",
  "title": "Contact Form",
  "questions": [
    {
      "questionKey": "name",
      "airtableFieldId": "fldZZZZZZZZZZZZZZ",
      "label": "What is your name?",
      "type": "short_text",
      "required": true,
      "conditionalRules": null,
      "choices": []
    },
    {
      "questionKey": "role",
      "airtableFieldId": "fldAAAAAAAAAAAAA",
      "label": "What is your role?",
      "type": "single_select",
      "required": true,
      "choices": ["Engineer", "Designer", "Manager"]
    },
    {
      "questionKey": "github",
      "airtableFieldId": "fldBBBBBBBBBBBBBB",
      "label": "GitHub URL",
      "type": "short_text",
      "required": false,
      "conditionalRules": {
        "logic": "AND",
        "conditions": [
          {
            "questionKey": "role",
            "operator": "equals",
            "value": "Engineer"
          }
        ]
      }
    }
  ]
}
```

**Response**:
```json
{
  "success": true,
  "form": {
    "_id": "507f1f77bcf86cd799439011",
    "owner": "507f191e810c19729de860ea",
    "airtableBaseId": "appXXXXXXXXXXXXXX",
    "airtableTableId": "tblYYYYYYYYYYYYYY",
    "title": "Contact Form",
    "questions": [...]
  }
}
```

---

#### 6. Get User's Airtable Bases
```http
GET /forms/bases
Headers: x-user-id: USER_ID
```

**Description**: Fetch all Airtable bases accessible to the user.

**Response**:
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

---

#### 7. Get Base Schema
```http
GET /forms/bases/:baseId/schema
Headers: x-user-id: USER_ID
```

**Description**: Get tables and fields for a specific base.

**Response**:
```json
{
  "tables": [
    {
      "id": "tblYYYYYYYYYYYYYY",
      "name": "Contacts",
      "fields": [
        {
          "id": "fldZZZZZZZZZZZZZZ",
          "name": "Name",
          "type": "singleLineText"
        },
        {
          "id": "fldAAAAAAAAAAAAA",
          "name": "Email",
          "type": "email"
        }
      ]
    }
  ]
}
```

---

### Responses

#### 8. Submit Form Response
```http
POST /responses/:formId/submit
Headers: Content-Type: application/json
```

**Description**: Submit a form response. Creates record in Airtable and saves to MongoDB.

**Request Body**:
```json
{
  "answers": {
    "name": "John Doe",
    "role": "Engineer",
    "github": "https://github.com/johndoe"
  }
}
```

**Response**:
```json
{
  "success": true,
  "message": "Response submitted successfully",
  "response": {
    "id": "507f1f77bcf86cd799439011",
    "airtableRecordId": "recXXXXXXXXXXXXXX",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Response** (Validation Failed):
```json
{
  "error": "Validation failed",
  "errors": [
    {
      "field": "name",
      "message": "name is required"
    }
  ]
}
```

---

#### 9. Get Form Responses
```http
GET /forms/:formId/responses
Headers: x-user-id: USER_ID
Query Parameters:
  - page (optional, default: 1)
  - limit (optional, default: 50)
```

**Description**: Get all responses for a form (from MongoDB only).

**Response**:
```json
{
  "responses": [
    {
      "id": "507f1f77bcf86cd799439011",
      "airtableRecordId": "recXXXXXXXXXXXXXX",
      "answers": {
        "name": "John Doe",
        "role": "Engineer"
      },
      "status": "synced",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 100,
    "pages": 2
  }
}
```

---

#### 10. Get Single Response
```http
GET /responses/:responseId
```

**Description**: Get details of a single response.

**Response**:
```json
{
  "response": {
    "id": "507f1f77bcf86cd799439011",
    "formId": "507f191e810c19729de860ea",
    "formTitle": "Contact Form",
    "airtableRecordId": "recXXXXXXXXXXXXXX",
    "answers": {...},
    "status": "synced",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### Webhooks

#### 11. Airtable Webhook Handler
```http
POST /webhooks/airtable
Headers: 
  Content-Type: application/json
  x-airtable-content-mac: SIGNATURE (if WEBHOOK_SECRET is set)
```

**Description**: Handles Airtable webhook events for record updates and deletions.

**Request Body** (from Airtable):
```json
{
  "baseTransactionNumber": 123,
  "payloads": [
    {
      "changedTablesById": {
        "tblYYYYYYYYYYYYYY": {
          "changedRecordsById": {
            "recXXXXXXXXXXXXXX": {
              "changedFieldsById": {
                "fldZZZZZZZZZZZZZZ": "New Value"
              }
            }
          },
          "destroyedRecordIds": ["recYYYYYYYYYYYYYY"]
        }
      }
    }
  ]
}
```

**Response**:
```json
{
  "success": true,
  "message": "Webhook processed successfully"
}
```

---

#### 12. Test Webhook
```http
GET /webhooks/airtable/test
```

**Description**: Test endpoint to verify webhook is active.

**Response**:
```json
{
  "message": "Webhook endpoint is active",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## Supported Field Types

| Internal Type | Airtable Type | Description |
|--------------|---------------|-------------|
| `short_text` | `singleLineText` | Single line text input |
| `long_text` | `multilineText` | Multi-line text area |
| `single_select` | `singleSelect` | Dropdown with single choice |
| `multi_select` | `multipleSelects` | Multiple choice selection |
| `attachment` | `multipleAttachments` | File upload |

---

## Conditional Logic

### Operators

- `equals`: Exact match (case-insensitive for strings)
- `notEquals`: Not equal (case-insensitive for strings)
- `contains`: Contains substring (for strings) or includes value (for arrays)

### Logic Operators

- `AND`: All conditions must be true
- `OR`: At least one condition must be true

### Example

Show "GitHub URL" field only if role is "Engineer":

```json
{
  "conditionalRules": {
    "logic": "AND",
    "conditions": [
      {
        "questionKey": "role",
        "operator": "equals",
        "value": "Engineer"
      }
    ]
  }
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Validation failed",
  "errors": [...]
}
```

### 401 Unauthorized
```json
{
  "error": "User not authenticated"
}
```

### 403 Forbidden
```json
{
  "error": "Access denied"
}
```

### 404 Not Found
```json
{
  "error": "Form not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Failed to process request"
}
```

---

## Response Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 500 | Internal Server Error |
