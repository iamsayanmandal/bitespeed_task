# Bitespeed Identity Reconciliation

Backend service that links different contact info to the same customer.

## Setup

```
npm install
node index.js
```

Server starts on port 3000

## Endpoint

**POST** `/identify`

Request body:
```json
{
  "email": "test@example.com",
  "phoneNumber": "1234567890"
}
```

Both fields are optional but atleast one is required.

Response:
```json
{
  "contact": {
    "primaryContatctId": 1,
    "emails": ["test@example.com"],
    "phoneNumbers": ["1234567890"],
    "secondaryContactIds": []
  }
}
```

## Tech used

- Node.js + Express
- SQLite (better-sqlite3)

## Hosted at

https://bitespeed-task.onrender.com
