# Airtable Setup Guide

This project requires a manually created Airtable Base and Table to store form responses. The application does **not** automatically create fields for you; you must define them in Airtable first and then map them to your form questions.

## 1. Create a Base
1.  Log in to [Airtable](https://airtable.com/).
2.  Click **"Create a base"** (start from scratch).
3.  Name it something relevant, e.g., **"Form Builder Data"**.

## 2. Create a Table
1.  By default, there is a "Table 1". You can rename it to **"Responses"**.
2.  This table will hold all the submissions for your form.

## 3. Define Your Fields (Columns)
Create columns in Airtable for every question you want to ask in your form.

| Field Name | Airtable Type | Recommended For |
| :--- | :--- | :--- |
| **Name** | Single line text | Short text answers |
| **Email** | Email | Email addresses |
| **Feedback** | Long text | Detailed responses |
| **Status** | Single select | Internal status (e.g., New, Reviewed) |
| **Attachment** | Attachment | File uploads |

> **Tip:** You can add as many fields as you need. The "Name" field is usually the primary field (first column).

## 4. Retrieve IDs (The Easy Way)
Instead of hunting for IDs in the Airtable URL, use the application's helper endpoints (once the backend is running).

### Step A: Get Base ID
1.  Open your Base in the browser.
2.  Copy the **Base ID** from the URL: `https://airtable.com/appXXXXXXXXXXXXXX/...`
    *   It starts with `app`.
3.  Add this to your `.env` file as `AIRTABLE_BASE_ID`.

### Step B: Get Table & Field IDs
1.  Start your backend server: `npm run dev`
2.  Authenticate at `http://localhost:3000/auth/airtable` to get your User ID.
3.  Call the Schema Endpoint (using Postman or Curl):
    ```bash
    GET http://localhost:3000/forms/bases/YOUR_BASE_ID/schema
    Headers: x-user-id: YOUR_USER_ID
    ```
4.  The response will list all **Table IDs** (`tbl...`) and **Field IDs** (`fld...`).
    ```json
    {
      "tables": [
        {
          "id": "tblYYYYYYYYYYYYYY",
          "name": "Responses",
          "fields": [
            { "id": "fldZZZZZZZZZZZZZZ", "name": "Name" },
            { "id": "fldAAAAAAAAAAAAAA", "name": "Email" }
          ]
        }
      ]
    }
    ```

## 5. Create Your Form
Now you have everything needed to create a form via the API:
*   `airtableBaseId`: `app...`
*   `airtableTableId`: `tbl...`
*   `questions`: Map each question to a `airtableFieldId` (`fld...`).
