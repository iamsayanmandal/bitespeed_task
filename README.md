# Identity Reconciliation API (Bitespeed Assessment)

<p align="center">
  <b>A robust backend service for customer identity reconciliation and data merging.</b>
</p>

## Overview

In e-commerce, customers often interact with a store using different email addresses or phone numbers across multiple orders. This service exposes a REST API endpoint that links various contact details to a single customer profile, intelligently categorizing contacts into **primary** and **secondary** identities.

## Architecture & Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: SQLite (`better-sqlite3` for high-performance synchronous queries)
- **Deployment**: Render

## API Reference

### Identify Customer
**Endpoint**: `POST /identify`

Creates or links customer identities based on the provided contact information.

**Request Body**:
```json
{
  "email": "test@example.com",
  "phoneNumber": "1234567890"
}
```
*(Note: Both fields are optional, but at least one must be provided.)*

**Response Payload**:
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

## Local Development Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the server:
   ```bash
   npm start
   ```
   *The server will run on `http://localhost:3000`.*

---
*Built by [Sayan Mandal](https://github.com/iamsayanmandal)*
