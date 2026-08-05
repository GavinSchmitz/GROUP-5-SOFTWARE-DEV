# HourBank API Specification

## Overview

This document outlines all API endpoints required for the HourBank community skills-swap marketplace. The platform allows users to exchange skills using time-credits (1 credit = 1 hour).

**Base URL:** `/api`  
**Authentication:** NextAuth v5 (JWT-based)  
**Database:** SQLite (via Prisma ORM)  
**Validation:** Zod schemas

---

## Current Implementation Status

### ✅ Already Implemented
- Auth (signup, signin via NextAuth)
- Bookings (CRUD + status transitions)
- Reviews (create, list)
- Credits (balance, history)
- Messages (send, list, conversations)
- Notifications (list, mark read)
- Admin Stats + User Management

### ❌ Missing (Frontend calls these but API doesn't exist)
- User Profiles (GET/PATCH)
- Skills browsing API
- User Skills management
- Admin booking management
- Credit adjustment by admin

---

## Authentication Endpoints

### POST /api/auth/signup
Register a new user account.

**Request Body:**
```json
{
  "name": "string (min 2 chars)",
  "email": "string (valid email)",
  "password": "string (min 6 chars)"
}
```

**Response (201):**
```json
{
  "id": "cuid",
  "email": "user@example.com"
}
```

**Errors:**
- 400: Validation error
- 409: Email already exists

---

### GET/POST /api/auth/[...nextauth]
NextAuth handlers for session management, sign in, sign out.

---

## User Endpoints

### GET /api/users/[id] ❌ MISSING
Get user profile by ID.

**Response (200):**
```json
{
  "id": "cuid",
  "name": "string | null",
  "email": "user@example.com",
  "image": "string | null",
  "bio": "string | null",
  "location": "string | null",
  "creditBalance": 3,
  "createdAt": "2026-01-01T00:00:00.000Z",
  "userSkills": [
    {
      "id": "cuid",
      "proficiency": "INTERMEDIATE",
      "isOffered": true,
      "note": "string | null",
      "skill": {
        "id": "cuid",
        "name": "Guitar",
        "slug": "guitar",
        "category": "Creative"
      }
    }
  ],
  "_count": {
    "requestedBookings": 5,
    "providedBookings": 3,
    "reviewsReceived": 2
  }
}
```

**Errors:**
- 404: User not found

---

### PATCH /api/users/[id] ❌ MISSING
Update user profile (authenticated, own profile only).

**Request Body:**
```json
{
  "name": "string (optional)",
  "bio": "string (optional, max 500 chars)",
  "location": "string (optional, max 100 chars)",
  "image": "string (optional, URL)"
}
```

**Response (200):**
```json
{
  "id": "cuid",
  "name": "string | null",
  "bio": "string | null",
  "location": "string | null",
  "image": "string | null"
}
```

**Errors:**
- 401: Unauthorized
- 403: Forbidden (not your profile)
- 400: Validation error

---

## Skills Endpoints

### GET /api/skills ❌ MISSING
List all skills with optional filtering and search.

**Query Parameters:**
- `q` (string, optional): Search by name or description
- `category` (string, optional): Filter by category
- `page` (number, optional, default: 1): Page number
- `limit` (number, optional, default: 20, max: 100): Items per page

**Response (200):**
```json
{
  "skills": [
    {
      "id": "cuid",
      "name": "Guitar Lessons",
      "slug": "guitar-lessons",
      "category": "Creative",
      "description": "Learn acoustic or electric guitar",
      "icon": "music",
      "_count": {
        "userSkills": 5
      }
    }
  ],
  "categories": ["Creative", "Education", "Technology"],
  "total": 25,
  "page": 1,
  "limit": 20,
  "totalPages": 2
}
```

---

### GET /api/skills/[id] ❌ MISSING
Get skill details with providers.

**Response (200):**
```json
{
  "id": "cuid",
  "name": "Guitar Lessons",
  "slug": "guitar-lessons",
  "category": "Creative",
  "description": "Learn acoustic or electric guitar",
  "icon": "music",
  "userSkills": [
    {
      "id": "cuid",
      "proficiency": "ADVANCED",
      "note": "10 years experience",
      "user": {
        "id": "cuid",
        "name": "John Doe",
        "image": "https://...",
        "location": "New York"
      }
    }
  ]
}
```

**Errors:**
- 404: Skill not found

---

### POST /api/skills ❌ MISSING
Create a new skill (admin only).

**Request Body:**
```json
{
  "name": "string (min 2 chars)",
  "slug": "string (unique, slugified)",
  "category": "string (min 2 chars)",
  "description": "string (optional)",
  "icon": "string (optional)"
}
```

**Response (201):**
```json
{
  "id": "cuid",
  "name": "Guitar Lessons",
  "slug": "guitar-lessons",
  "category": "Creative"
}
```

**Errors:**
- 401: Unauthorized
- 403: Forbidden (not admin)
- 400: Validation error
- 409: Slug already exists

---

### PATCH /api/skills/[id] ❌ MISSING
Update a skill (admin only).

**Request Body:**
```json
{
  "name": "string (optional)",
  "description": "string (optional)",
  "category": "string (optional)",
  "icon": "string (optional)"
}
```

**Response (200):** Updated skill object

**Errors:**
- 401: Unauthorized
- 403: Forbidden (not admin)
- 404: Skill not found

---

### DELETE /api/skills/[id] ❌ MISSING
Delete a skill (admin only).

**Response (200):**
```json
{
  "success": true
}
```

**Errors:**
- 401: Unauthorized
- 403: Forbidden (not admin)
- 404: Skill not found

---

## User Skills Endpoints

### POST /api/user-skills ❌ MISSING
Add a skill to user's profile (offer or want).

**Request Body:**
```json
{
  "skillId": "cuid",
  "isOffered": true,
  "proficiency": "BEGINNER | INTERMEDIATE | ADVANCED | EXPERT",
  "note": "string (optional, max 200 chars)"
}
```

**Response (201):**
```json
{
  "id": "cuid",
  "skillId": "cuid",
  "isOffered": true,
  "proficiency": "INTERMEDIATE",
  "skill": {
    "id": "cuid",
    "name": "Guitar",
    "slug": "guitar",
    "category": "Creative"
  }
}
```

**Errors:**
- 401: Unauthorized
- 400: Validation error
- 409: Skill already added (same skillId + isOffered combo)

---

### PATCH /api/user-skills/[id] ❌ MISSING
Update a user skill (own skills only).

**Request Body:**
```json
{
  "proficiency": "BEGINNER | INTERMEDIATE | ADVANCED | EXPERT (optional)",
  "note": "string (optional, max 200 chars)"
}
```

**Response (200):** Updated user skill object

**Errors:**
- 401: Unauthorized
- 403: Forbidden (not your skill)
- 404: User skill not found

---

### DELETE /api/user-skills/[id] ❌ MISSING
Remove a skill from user's profile (own skills only).

**Response (200):**
```json
{
  "success": true
}
```

**Errors:**
- 401: Unauthorized
- 403: Forbidden (not your skill)
- 404: User skill not found

---

## Bookings Endpoints

### GET /api/bookings ✅ EXISTS
List user's bookings (as requester or provider).

**Query Parameters:**
- `status` (string, optional): Filter by status
- `page` (number, optional, default: 1)
- `limit` (number, optional, default: 20)

**Response (200):**
```json
{
  "bookings": [
    {
      "id": "cuid",
      "status": "PENDING",
      "description": "Learn basic chords",
      "scheduledAt": "2026-07-25T14:00:00.000Z",
      "durationMinutes": 60,
      "location": "Central Park",
      "createdAt": "2026-07-24T10:00:00.000Z",
      "skill": {
        "id": "cuid",
        "name": "Guitar Lessons",
        "category": "Creative"
      },
      "requester": {
        "id": "cuid",
        "name": "Alice",
        "image": "https://..."
      },
      "provider": {
        "id": "cuid",
        "name": "Bob",
        "image": "https://..."
      }
    }
  ],
  "total": 10,
  "page": 1,
  "limit": 20,
  "totalPages": 1
}
```

---

### POST /api/bookings ✅ EXISTS
Create a new booking request.

**Request Body:**
```json
{
  "skillId": "cuid",
  "providerId": "cuid",
  "description": "string (optional)",
  "scheduledAt": "ISO 8601 datetime (optional)",
  "durationMinutes": 60,
  "location": "string (optional)"
}
```

**Response (201):** Created booking object

**Business Rules:**
- Requester must have sufficient credits (1 credit per hour, rounded up)
- Cannot book yourself
- Provider must offer the skill
- Notification sent to provider

**Errors:**
- 401: Unauthorized
- 400: Insufficient credits
- 400: Cannot book yourself
- 400: Provider does not offer this skill
- 404: Skill or provider not found

---

### GET /api/bookings/[id] ✅ EXISTS
Get booking details (requester or provider only).

**Response (200):**
```json
{
  "id": "cuid",
  "status": "ACCEPTED",
  "description": "Learn basic chords",
  "scheduledAt": "2026-07-25T14:00:00.000Z",
  "durationMinutes": 60,
  "location": "Central Park",
  "createdAt": "2026-07-24T10:00:00.000Z",
  "skill": { },
  "requester": { },
  "provider": { },
  "reviews": [
    {
      "id": "cuid",
      "rating": 5,
      "comment": "Great teacher!",
      "author": { },
      "createdAt": "2026-07-26T10:00:00.000Z"
    }
  ]
}
```

**Errors:**
- 401: Unauthorized
- 403: Forbidden (not involved in booking)
- 404: Booking not found

---

### PATCH /api/bookings/[id] ✅ EXISTS
Update booking status.

**Request Body:**
```json
{
  "status": "ACCEPTED | CANCELLED | IN_PROGRESS | COMPLETED | DISPUTED"
}
```

**Status Transitions:**
- `PENDING` → `ACCEPTED` (provider), `CANCELLED` (provider or requester)
- `ACCEPTED` → `IN_PROGRESS` (either party), `CANCELLED` (provider)
- `IN_PROGRESS` → `COMPLETED` (either party), `DISPUTED` (provider)
- `COMPLETED` → Final state
- `CANCELLED` → Final state
- `DISPUTED` → Final state

**Business Rules:**
- Only provider can accept, decline, or dispute
- Both parties can start (IN_PROGRESS) or complete
- Either party can cancel before completion
- Completion triggers credit transfer (provider earns, requester spends)
- Notifications sent on status changes

**Response (200):** Updated booking object

**Errors:**
- 401: Unauthorized
- 403: Forbidden
- 400: Invalid status transition

---

## Reviews Endpoints

### GET /api/reviews ✅ EXISTS
Get reviews for a user.

**Query Parameters:**
- `userId` (string, required): User ID to get reviews for

**Response (200):**
```json
{
  "reviews": [
    {
      "id": "cuid",
      "rating": 5,
      "comment": "Excellent teacher, very patient!",
      "createdAt": "2026-07-26T10:00:00.000Z",
      "author": {
        "id": "cuid",
        "name": "Alice",
        "image": "https://..."
      },
      "booking": {
        "id": "cuid",
        "skill": {
          "name": "Guitar Lessons"
        },
        "createdAt": "2026-07-25T14:00:00.000Z"
      }
    }
  ]
}
```

---

### POST /api/reviews ✅ EXISTS
Create a review for a completed booking.

**Request Body:**
```json
{
  "bookingId": "cuid",
  "rating": 5,
  "comment": "string (optional, max 500 chars)"
}
```

**Business Rules:**
- Booking must be COMPLETED
- Only requester or provider can review
- One review per user per booking
- Notification sent to reviewee

**Response (201):** Created review object

**Errors:**
- 401: Unauthorized
- 400: Booking not completed
- 400: You are not part of this booking
- 400: Already reviewed this booking

---

## Credits Endpoints

### GET /api/credits ✅ EXISTS
Get current user's credit balance and transaction history.

**Response (200):**
```json
{
  "balance": 5,
  "transactions": [
    {
      "id": "cuid",
      "amount": 1,
      "type": "EARNED",
      "description": "Earned 1 credit(s) for completing a 60-min session",
      "createdAt": "2026-07-26T10:00:00.000Z",
      "relatedBookingId": "cuid"
    },
    {
      "id": "cuid",
      "amount": -1,
      "type": "SPENT",
      "description": "Spent 1 credit(s) for a 60-min session",
      "createdAt": "2026-07-25T14:00:00.000Z",
      "relatedBookingId": "cuid"
    }
  ]
}
```

---

### POST /api/credits/adjust ❌ MISSING
Admin: Manually adjust user credits.

**Request Body:**
```json
{
  "userId": "cuid",
  "amount": 5,
  "reason": "Bonus for community contribution"
}
```

**Response (200):**
```json
{
  "transaction": { },
  "newBalance": 8
}
```

**Errors:**
- 401: Unauthorized
- 403: Forbidden (not admin)
- 400: Validation error

---

## Messages Endpoints

### GET /api/messages ✅ EXISTS
Get user's conversations list.

**Response (200):**
```json
{
  "conversations": [
    {
      "otherUser": {
        "id": "cuid",
        "name": "Bob",
        "image": "https://..."
      },
      "lastMessage": {
        "id": "cuid",
        "content": "See you at 3pm!",
        "createdAt": "2026-07-24T15:00:00.000Z",
        "senderId": "cuid"
      },
      "unreadCount": 2
    }
  ]
}
```

---

### GET /api/messages/conversations ✅ EXISTS
Get messages with a specific user.

**Query Parameters:**
- `userId` (string, required): Other user's ID

**Response (200):**
```json
{
  "user": {
    "id": "cuid",
    "name": "Bob",
    "image": "https://..."
  },
  "messages": [
    {
      "id": "cuid",
      "senderId": "cuid",
      "receiverId": "cuid",
      "content": "Hi, I'd like to learn guitar!",
      "read": true,
      "createdAt": "2026-07-24T10:00:00.000Z",
      "sender": { },
      "receiver": { }
    }
  ]
}
```

**Side Effects:** Marks unread messages from the other user as read.

---

### POST /api/messages ✅ EXISTS
Send a message to another user.

**Request Body:**
```json
{
  "receiverId": "cuid",
  "content": "string (min 1, max 2000 chars)"
}
```

**Response (201):** Created message object

**Business Rules:**
- Cannot message yourself
- Notification sent to receiver

**Errors:**
- 401: Unauthorized
- 400: Cannot message yourself
- 404: User not found

---

### PATCH /api/messages/[id] ❌ MISSING
Mark a message as read.

**Response (200):**
```json
{
  "success": true
}
```

**Errors:**
- 401: Unauthorized
- 403: Forbidden (not receiver)
- 404: Message not found

---

## Notifications Endpoints

### GET /api/notifications ✅ EXISTS
Get user's notifications.

**Query Parameters:**
- `unreadOnly` (boolean, optional): Only return unread notifications
- `limit` (number, optional, default: 50): Max notifications to return

**Response (200):**
```json
{
  "notifications": [
    {
      "id": "cuid",
      "type": "BOOKING_REQUEST",
      "title": "New Booking Request",
      "body": "Alice requested a 60-min session for Guitar Lessons.",
      "read": false,
      "link": "/bookings/cuid",
      "createdAt": "2026-07-24T10:00:00.000Z"
    }
  ],
  "unreadCount": 3
}
```

---

### PATCH /api/notifications ✅ EXISTS
Mark notifications as read.

**Request Body (Option 1 - Mark single):**
```json
{
  "id": "cuid"
}
```

**Request Body (Option 2 - Mark all):**
```json
{
  "markAllRead": true
}
```

**Response (200):**
```json
{
  "success": true
}
```

---

### DELETE /api/notifications/[id] ❌ MISSING
Delete a notification.

**Response (200):**
```json
{
  "success": true
}
```

**Errors:**
- 401: Unauthorized
- 403: Forbidden (not your notification)
- 404: Notification not found

---

## Admin Endpoints

### GET /api/admin ✅ EXISTS
Get admin dashboard stats.

**Response (200):**
```json
{
  "totalUsers": 25,
  "totalBookings": 50,
  "activeBookings": 12,
  "totalCreditsCirculated": 100.5,
  "recentSignups": [
    {
      "id": "cuid",
      "name": "Alice",
      "email": "alice@example.com",
      "createdAt": "2026-07-24T10:00:00.000Z"
    }
  ]
}
```

---

### GET /api/admin/users ✅ EXISTS
List all users with pagination and search.

**Query Parameters:**
- `page` (number, optional, default: 1)
- `limit` (number, optional, default: 20, max: 100)
- `search` (string, optional): Search by name or email

**Response (200):**
```json
{
  "users": [
    {
      "id": "cuid",
      "name": "Alice",
      "email": "alice@example.com",
      "role": "USER",
      "creditBalance": 5,
      "createdAt": "2026-07-24T10:00:00.000Z"
    }
  ],
  "total": 25,
  "page": 1,
  "limit": 20,
  "totalPages": 2
}
```

---

### PATCH /api/admin/users ✅ EXISTS
Update user role.

**Request Body:**
```json
{
  "userId": "cuid",
  "role": "USER | ADMIN"
}
```

**Response (200):** Updated user object

---

### GET /api/admin/bookings ❌ MISSING
List all bookings with filters (admin only).

**Query Parameters:**
- `status` (string, optional): Filter by status
- `page` (number, optional, default: 1)
- `limit` (number, optional, default: 20)

**Response (200):**
```json
{
  "bookings": [ ],
  "total": 50,
  "page": 1,
  "limit": 20,
  "totalPages": 3
}
```

---

### DELETE /api/admin/bookings/[id] ❌ MISSING
Cancel/delete a booking (admin only).

**Response (200):**
```json
{
  "success": true
}
```

---

### GET /api/admin/skills ❌ MISSING
List all skills (admin only).

**Response (200):**
```json
{
  "skills": [
    {
      "id": "cuid",
      "name": "Guitar",
      "slug": "guitar",
      "category": "Creative",
      "_count": {
        "userSkills": 5,
        "bookings": 10
      }
    }
  ]
}
```

---

## Utility Endpoints

### GET /api/health
Health check endpoint.

**Response (200):**
```json
{
  "status": "ok",
  "timestamp": "2026-07-24T10:00:00.000Z"
}
```

---

## Complete Endpoint Reference Table

| Method | Endpoint | Auth | Status | Description |
|--------|----------|------|--------|-------------|
| POST | /api/auth/signup | Public | ✅ | Register new user |
| GET/POST | /api/auth/[...nextauth] | Public | ✅ | NextAuth handlers |
| **GET** | **/api/users/[id]** | **Required** | **❌** | **Get user profile** |
| **PATCH** | **/api/users/[id]** | **Required (own)** | **❌** | **Update profile** |
| **GET** | **/api/skills** | **Public** | **❌** | **List skills** |
| **GET** | **/api/skills/[id]** | **Public** | **❌** | **Get skill details** |
| **POST** | **/api/skills** | **Admin** | **❌** | **Create skill** |
| **PATCH** | **/api/skills/[id]** | **Admin** | **❌** | **Update skill** |
| **DELETE** | **/api/skills/[id]** | **Admin** | **❌** | **Delete skill** |
| **POST** | **/api/user-skills** | **Required** | **❌** | **Add skill to profile** |
| **PATCH** | **/api/user-skills/[id]** | **Required (own)** | **❌** | **Update user skill** |
| **DELETE** | **/api/user-skills/[id]** | **Required (own)** | **❌** | **Remove skill** |
| GET | /api/bookings | Required | ✅ | List user's bookings |
| POST | /api/bookings | Required | ✅ | Create booking |
| GET | /api/bookings/[id] | Required | ✅ | Get booking details |
| PATCH | /api/bookings/[id] | Required | ✅ | Update booking status |
| GET | /api/reviews | Required | ✅ | Get user reviews |
| POST | /api/reviews | Required | ✅ | Create review |
| GET | /api/credits | Required | ✅ | Get balance & history |
| **POST** | **/api/credits/adjust** | **Admin** | **❌** | **Adjust user credits** |
| GET | /api/messages | Required | ✅ | List conversations |
| GET | /api/messages/conversations | Required | ✅ | Get conversation |
| POST | /api/messages | Required | ✅ | Send message |
| **PATCH** | **/api/messages/[id]** | **Required** | **❌** | **Mark message as read** |
| GET | /api/notifications | Required | ✅ | List notifications |
| PATCH | /api/notifications | Required | ✅ | Mark as read |
| **DELETE** | **/api/notifications/[id]** | **Required** | **❌** | **Delete notification** |
| GET | /api/admin | Admin | ✅ | Dashboard stats |
| GET | /api/admin/users | Admin | ✅ | List users |
| PATCH | /api/admin/users | Admin | ✅ | Update user role |
| **GET** | **/api/admin/bookings** | **Admin** | **❌** | **List all bookings** |
| **DELETE** | **/api/admin/bookings/[id]** | **Admin** | **❌** | **Cancel booking** |
| **GET** | **/api/admin/skills** | **Admin** | **❌** | **List all skills** |

**Bold items are missing endpoints that need to be built.**

---

## Data Models Reference

### User
| Field | Type | Description |
|-------|------|-------------|
| id | String (cuid) | Primary key |
| name | String? | Display name |
| email | String | Unique email |
| emailVerified | DateTime? | Email verification timestamp |
| image | String? | Profile image URL |
| passwordHash | String? | bcrypt password hash |
| bio | String? | User biography |
| location | String? | User location |
| role | String | USER or ADMIN |
| creditBalance | Float | Current credit balance |
| createdAt | DateTime | Account creation timestamp |
| updatedAt | DateTime | Last update timestamp |

### Skill
| Field | Type | Description |
|-------|------|-------------|
| id | String (cuid) | Primary key |
| name | String | Skill display name |
| slug | String | URL-friendly unique identifier |
| category | String | Skill category |
| description | String? | Skill description |
| icon | String? | Icon identifier |

### UserSkill
| Field | Type | Description |
|-------|------|-------------|
| id | String (cuid) | Primary key |
| userId | String | Foreign key to User |
| skillId | String | Foreign key to Skill |
| proficiency | String | BEGINNER, INTERMEDIATE, ADVANCED, EXPERT |
| isOffered | Boolean | true = offers skill, false = wants skill |
| note | String? | Additional notes |

### Booking
| Field | Type | Description |
|-------|------|-------------|
| id | String (cuid) | Primary key |
| requesterId | String | Foreign key to User (requester) |
| providerId | String | Foreign key to User (provider) |
| skillId | String | Foreign key to Skill |
| status | String | PENDING, ACCEPTED, IN_PROGRESS, COMPLETED, CANCELLED, DISPUTED |
| description | String? | Booking description |
| scheduledAt | DateTime? | Scheduled date/time |
| durationMinutes | Int | Duration in minutes (default: 60) |
| location | String? | Meeting location |
| createdAt | DateTime | Creation timestamp |
| updatedAt | DateTime | Last update timestamp |

### Review
| Field | Type | Description |
|-------|------|-------------|
| id | String (cuid) | Primary key |
| bookingId | String | Foreign key to Booking |
| authorId | String | Foreign key to User (reviewer) |
| revieweeId | String | Foreign key to User (reviewed) |
| rating | Int | 1-5 star rating |
| comment | String? | Review comment |
| createdAt | DateTime | Creation timestamp |

### TimeCredit
| Field | Type | Description |
|-------|------|-------------|
| id | String (cuid) | Primary key |
| userId | String | Foreign key to User |
| amount | Float | Positive = earned, negative = spent |
| type | String | INITIAL, EARNED, SPENT, ADJUSTED |
| description | String? | Transaction description |
| relatedBookingId | String? | Foreign key to Booking |
| createdAt | DateTime | Creation timestamp |

### Message
| Field | Type | Description |
|-------|------|-------------|
| id | String (cuid) | Primary key |
| senderId | String | Foreign key to User (sender) |
| receiverId | String | Foreign key to User (receiver) |
| content | String | Message content |
| read | Boolean | Read status (default: false) |
| createdAt | DateTime | Creation timestamp |

### Notification
| Field | Type | Description |
|-------|------|-------------|
| id | String (cuid) | Primary key |
| userId | String | Foreign key to User |
| type | String | Notification type |
| title | String | Notification title |
| body | String? | Notification body |
| read | Boolean | Read status (default: false) |
| link | String? | Deep link URL |
| createdAt | DateTime | Creation timestamp |

---

## Notification Types

| Type | Trigger | Title Example |
|------|---------|---------------|
| BOOKING_REQUEST | New booking created | "New Booking Request" |
| BOOKING_ACCEPTED | Provider accepts booking | "Booking Accepted" |
| BOOKING_DECLINED | Booking cancelled/declined | "Booking Cancelled" |
| BOOKING_COMPLETED | Booking marked complete | "Booking Completed" |
| REVIEW_RECEIVED | New review posted | "New Review Received" |
| MESSAGE_RECEIVED | New message sent | "New Message" |
| CREDIT_EARNED | Credits earned from completion | "Session Completed" |

---

## Credit System Rules

1. **Starter Credits:** New users receive 3 credits on signup
2. **Earning:** 1 credit per hour of service provided (rounded up)
3. **Spending:** 1 credit per hour of service requested (rounded up)
4. **Deduction:** Credits deducted from requester when booking is marked COMPLETED
5. **Earning:** Credits added to provider when booking is marked COMPLETED
6. **Admin Adjustment:** Admins can manually add/deduct credits

---

## Status Transition Rules

```
PENDING → ACCEPTED (provider) | CANCELLED (either)
ACCEPTED → IN_PROGRESS (either) | CANCELLED (provider)
IN_PROGRESS → COMPLETED (either) | DISPUTED (provider)
COMPLETED → Final
CANCELLED → Final
DISPUTED → Final
```

---

## Implementation Priority

### Phase 1 - Core Functionality (Must Have)
1. ✅ Auth (signup, signin) - Already implemented
2. ✅ Bookings (CRUD, status transitions) - Already implemented
3. ✅ Reviews (create, list) - Already implemented
4. ✅ Credits (balance, history) - Already implemented
5. ✅ Messages (send, list, conversations) - Already implemented
6. ✅ Notifications (list, mark read) - Already implemented
7. ❌ User Profiles (GET/PATCH /api/users/[id]) - **Missing**
8. ❌ Skills API (GET /api/skills, /api/skills/[id]) - **Missing**
9. ❌ User Skills (CRUD /api/user-skills) - **Missing**

### Phase 2 - Admin Features (Should Have)
10. ✅ Admin Stats - Already implemented
11. ✅ Admin Users (list, role update) - Already implemented
12. ❌ Admin Bookings (list all, cancel) - **Missing**
13. ❌ Admin Skills (CRUD) - **Missing**
14. ❌ Credit Adjustment - **Missing**

### Phase 3 - Enhancements (Nice to Have)
15. ❌ Image Upload (profile avatars)
16. ❌ Email Notifications
17. ❌ Real-time Messaging (WebSocket)
18. ❌ Search improvements (full-text search)
19. ❌ Rate Limiting
20. ❌ API Documentation (OpenAPI/Swagger)

---

## Error Response Format

All errors follow this format:

```json
{
  "error": "Human-readable error message"
}
```

For validation errors:
```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

---

## Authentication Notes

- All authenticated endpoints require a valid NextAuth session
- JWT token is included in cookies automatically by NextAuth
- Admin endpoints check `session.user.role === "ADMIN"`
- Owner-only endpoints check `session.user.id === resource.userId`

---

*Last Updated: 2026-07-24*
