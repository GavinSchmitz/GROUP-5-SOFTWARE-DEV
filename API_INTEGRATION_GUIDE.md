# HourBank API Integration Guide

> **For Next.js Frontend Developers**  
> Complete reference for integrating all HourBank backend endpoints.

---

## Table of Contents

1. [Setup & Configuration](#1-setup--configuration)
2. [Authentication](#2-authentication)
3. [API Client Setup](#3-api-client-setup)
4. [Error Handling](#4-error-handling)
5. [Auth Endpoints](#5-auth-endpoints)
6. [User Endpoints](#6-user-endpoints)
7. [Skills Endpoints](#7-skills-endpoints)
8. [User Skills Endpoints](#8-user-skills-endpoints)
9. [Bookings Endpoints](#9-bookings-endpoints)
10. [Reviews Endpoints](#10-reviews-endpoints)
11. [Credits Endpoints](#11-credits-endpoints)
12. [Messages Endpoints](#12-messages-endpoints)
13. [Notifications Endpoints](#13-notifications-endpoints)
14. [Admin Endpoints](#14-admin-endpoints)
15. [Utility Endpoints](#15-utility-endpoints)
16. [Data Types Reference](#16-data-types-reference)
17. [Business Rules Reference](#17-business-rules-reference)

---

## 1. Setup & Configuration

### Base URL

```ts
// lib/api.ts (or constants/api.ts)
export const API_BASE_URL = 'https://web-production-4b44c.up.railway.app';
export const API_PREFIX = `${API_BASE_URL}/api`;
```

### Environment Variables

```bash
# .env.local
NEXT_PUBLIC_API_URL=https://web-production-4b44c.up.railway.app   # local dev
# NEXT_PUBLIC_API_URL=https://your-domain.com  # production
```

---

## 2. Authentication

The API uses **DRF Token Authentication**. After sign-in or sign-up, you receive a token that must be sent in the `Authorization` header on every authenticated request.

```
Authorization: Token <your_token_here>
```

### Token Storage

Store the token in a secure, accessible place. Recommended pattern for Next.js:

```ts
// Use httpOnly cookies via your Next.js API route (most secure), OR
// Store in localStorage (simpler, fine for most apps)

// Save token
localStorage.setItem('hourbank_token', token);

// Read token
const token = localStorage.getItem('hourbank_token');

// Remove token (on signout)
localStorage.removeItem('hourbank_token');
```

### When to Send the Token

| Endpoint Pattern | Auth Required |
|---|---|
| `POST /api/auth/signup` | ❌ Public |
| `POST /api/auth/signin` | ❌ Public |
| `GET /api/skills` | ❌ Public |
| `GET /api/skills/:id` | ❌ Public |
| `GET /api/health` | ❌ Public |
| All other endpoints | ✅ Required |
| `/api/admin/*` | ✅ Admin role required |

---

## 3. API Client Setup

### Recommended: Axios Instance

```ts
// lib/api-client.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL + '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach token automatically
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('hourbank_token');
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

// Response interceptor — handle 401 globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('hourbank_token');
      localStorage.removeItem('hourbank_user');
      window.location.href = '/signin';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

### Alternative: Native Fetch Helper

```ts
// lib/fetch.ts
const BASE = process.env.NEXT_PUBLIC_API_URL + '/api';

function getToken() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('hourbank_token');
  }
  return null;
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Token ${token}`;

  const res = await fetch(`${BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const err = new Error(body.error ?? `HTTP ${res.status}`);
    (err as any).status = res.status;
    (err as any).details = body.details ?? null;
    throw err;
  }

  return res.json();
}
```

---

## 4. Error Handling

### Error Response Format

All errors from the API follow this format:

```json
{
  "error": "Human-readable error message"
}
```

Validation errors include a `details` array:

```json
{
  "error": "Validation failed",
  "details": [
    { "field": "email", "message": "Email already exists" },
    { "field": "password", "message": "This field is required." }
  ]
}
```

### HTTP Status Codes

| Code | Meaning |
|---|---|
| `200` | Success |
| `201` | Created successfully |
| `400` | Bad request / validation error |
| `401` | Unauthenticated — token missing or invalid |
| `403` | Forbidden — authenticated but not authorized |
| `404` | Resource not found |
| `409` | Conflict — duplicate (e.g. email already exists) |

### Error Handling Utility

```ts
// lib/errors.ts
export interface ApiError {
  message: string;
  status: number;
  details?: { field: string; message: string }[];
}

export function parseApiError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;
    return {
      message: data?.error ?? error.message,
      status: error.response?.status ?? 0,
      details: data?.details ?? null,
    };
  }
  if (error instanceof Error) {
    return {
      message: error.message,
      status: (error as any).status ?? 0,
      details: (error as any).details ?? null,
    };
  }
  return { message: 'An unknown error occurred', status: 0 };
}
```

---

## 5. Auth Endpoints

### POST `/api/auth/signup`

Register a new user. Returns the user ID, email, and auth token.

**No auth required.**

```ts
interface SignupRequest {
  name: string;      // min 2 chars
  email: string;     // valid email
  password: string;  // min 6 chars
}

interface SignupResponse {
  id: number;
  email: string;
  token: string;
}

// Usage
const response = await apiClient.post<SignupResponse>('/auth/signup', {
  name: 'Alice Smith',
  email: 'alice@example.com',
  password: 'securepass',
});

// After signup, save the token
localStorage.setItem('hourbank_token', response.data.token);
```

**Errors:**
- `400` — Validation failed (name too short, invalid email, password too short)
- `409` — Email already exists

---

### POST `/api/auth/signin`

Authenticate and receive a token.

**No auth required.**

```ts
interface SigninRequest {
  email: string;
  password: string;
}

interface SigninResponse {
  token: string;
  user: {
    id: number;
    email: string;
    name: string | null;
    role: 'USER' | 'ADMIN';
    image: string | null;
    creditBalance: number;
  };
}

// Usage
const response = await apiClient.post<SigninResponse>('/auth/signin', {
  email: 'alice@example.com',
  password: 'securepass',
});

localStorage.setItem('hourbank_token', response.data.token);
localStorage.setItem('hourbank_user', JSON.stringify(response.data.user));
```

**Errors:**
- `401` — Invalid email or password
- `403` — Account disabled

---

### POST `/api/auth/signout`

Invalidates the current token on the server.

**Auth required.**

```ts
await apiClient.post('/auth/signout');

// Clean up local state
localStorage.removeItem('hourbank_token');
localStorage.removeItem('hourbank_user');
```

---

## 6. User Endpoints

### GET `/api/users/:id`

Fetch a user's full profile, including their skills, booking counts, and credit balance.

**Auth required.**

```ts
interface UserSkillEntry {
  id: number;
  proficiency: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  is_offered: boolean;
  note: string | null;
  skill: {
    id: number;
    name: string;
    slug: string;
    category: string;
  };
}

interface UserProfile {
  id: number;
  name: string | null;
  email: string;
  image: string | null;
  bio: string | null;
  location: string | null;
  creditBalance: number;
  createdAt: string;  // ISO 8601
  userSkills: UserSkillEntry[];
  _count: {
    requestedBookings: number;
    providedBookings: number;
    reviewsReceived: number;
  };
}

// Usage
const response = await apiClient.get<UserProfile>(`/users/${userId}`);
const profile = response.data;
```

**Errors:**
- `404` — User not found

---

### PATCH `/api/users/:id`

Update authenticated user's own profile. All fields are optional.

**Auth required. Own profile only.**

```ts
interface UpdateProfileRequest {
  name?: string;
  bio?: string;       // max 500 chars
  location?: string;  // max 100 chars
  image?: string;     // URL string
}

interface UpdateProfileResponse {
  id: number;
  name: string | null;
  bio: string | null;
  location: string | null;
  image: string | null;
}

// Usage
const response = await apiClient.patch<UpdateProfileResponse>(
  `/users/${currentUser.id}`,
  { bio: 'I love teaching guitar!', location: 'London' }
);
```

**Errors:**
- `400` — Validation error (e.g. bio over 500 chars)
- `403` — Trying to edit another user's profile

---

## 7. Skills Endpoints

### GET `/api/skills`

List all skills with optional search and category filter.

**No auth required.**

```ts
interface SkillEntry {
  id: number;
  name: string;
  slug: string;
  category: string;
  description: string | null;
  icon: string | null;
  _count: {
    userSkills: number;
  };
}

interface SkillsListResponse {
  skills: SkillEntry[];
  categories: string[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Usage — basic
const response = await apiClient.get<SkillsListResponse>('/skills');

// With filters
const response = await apiClient.get<SkillsListResponse>('/skills', {
  params: {
    q: 'guitar',        // search name/description
    category: 'Music',  // filter by category
    page: 1,
    limit: 20,
  },
});
```

---

### GET `/api/skills/:id`

Get a single skill's details, including all users who offer it.

**No auth required.**

```ts
interface SkillDetailResponse {
  id: number;
  name: string;
  slug: string;
  category: string;
  description: string | null;
  icon: string | null;
  userSkills: Array<{
    id: number;
    proficiency: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
    note: string | null;
    user: {
      id: number;
      name: string | null;
      image: string | null;
    };
  }>;
}

// Usage
const response = await apiClient.get<SkillDetailResponse>(`/skills/${skillId}`);
```

**Errors:**
- `404` — Skill not found

---

### POST `/api/skills`

Create a new skill. **Admin only.**

```ts
interface CreateSkillRequest {
  name: string;        // min 2 chars
  slug: string;        // unique, URL-friendly (e.g. "guitar-lessons")
  category: string;    // min 2 chars
  description?: string;
  icon?: string;       // icon identifier string (e.g. "music")
}

// Usage
const response = await apiClient.post('/skills', {
  name: 'Guitar Lessons',
  slug: 'guitar-lessons',
  category: 'Music',
  description: 'Learn acoustic or electric guitar',
  icon: 'music',
});
```

**Errors:**
- `400` — Validation failed
- `403` — Not admin
- `409` — Slug already exists

---

### PATCH `/api/skills/:id`

Update a skill. **Admin only.**

```ts
interface UpdateSkillRequest {
  name?: string;
  description?: string;
  category?: string;
  icon?: string;
}

// Usage
await apiClient.patch(`/skills/${skillId}`, { description: 'Updated description' });
```

**Errors:**
- `403` — Not admin
- `404` — Skill not found

---

### DELETE `/api/skills/:id`

Delete a skill. **Admin only.**

```ts
// Usage
await apiClient.delete(`/skills/${skillId}`);
// Response: { success: true }
```

**Errors:**
- `403` — Not admin
- `404` — Skill not found

---

## 8. User Skills Endpoints

### POST `/api/user-skills`

Add a skill to the current user's profile (either offering or wanting).

**Auth required.**

```ts
interface AddUserSkillRequest {
  skillId: number;
  isOffered: boolean;   // true = you offer this skill, false = you want to learn it
  proficiency: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  note?: string;         // max 200 chars, optional
}

interface UserSkillResponse {
  id: number;
  skillId: number;
  isOffered: boolean;
  proficiency: string;
  note: string | null;
  skill: {
    id: number;
    name: string;
    slug: string;
    category: string;
  };
}

// Usage
const response = await apiClient.post<UserSkillResponse>('/user-skills', {
  skillId: 3,
  isOffered: true,
  proficiency: 'ADVANCED',
  note: '10 years of experience',
});
```

**Errors:**
- `400` — Validation error
- `404` — Skill not found
- `409` — You have already added this skill with the same offer status

> **Note:** A user can add the same skill twice — once as offered (`isOffered: true`) and once as wanted (`isOffered: false`). The 409 only triggers if the exact `skillId + isOffered` combination already exists.

---

### PATCH `/api/user-skills/:id`

Update proficiency or note on a user skill. **Own skills only.**

```ts
interface UpdateUserSkillRequest {
  proficiency?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  note?: string;  // max 200 chars
}

// Usage
await apiClient.patch(`/user-skills/${userSkillId}`, {
  proficiency: 'EXPERT',
  note: 'Now have 15 years of experience',
});
```

**Errors:**
- `403` — Not your skill
- `404` — User skill not found

---

### DELETE `/api/user-skills/:id`

Remove a skill from your profile. **Own skills only.**

```ts
// Usage
await apiClient.delete(`/user-skills/${userSkillId}`);
// Response: { success: true }
```

**Errors:**
- `403` — Not your skill
- `404` — User skill not found

---

## 9. Bookings Endpoints

### GET `/api/bookings`

List the current user's bookings (both as requester and provider).

**Auth required.**

```ts
interface BookingEntry {
  id: number;
  status: BookingStatus;
  description: string | null;
  scheduledAt: string | null;   // ISO 8601
  durationMinutes: number;
  location: string | null;
  createdAt: string;            // ISO 8601
  skill: { id: number; name: string; category: string };
  requester: { id: number; name: string | null; image: string | null };
  provider: { id: number; name: string | null; image: string | null };
}

interface BookingsListResponse {
  bookings: BookingEntry[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

type BookingStatus = 'PENDING' | 'ACCEPTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'DISPUTED';

// Usage — all bookings
const response = await apiClient.get<BookingsListResponse>('/bookings');

// With filters
const response = await apiClient.get<BookingsListResponse>('/bookings', {
  params: { status: 'PENDING', page: 1, limit: 20 },
});
```

---

### POST `/api/bookings`

Create a new booking request. Credits are NOT deducted at this stage — they are deducted when the booking is marked `COMPLETED`.

**Auth required.**

```ts
interface CreateBookingRequest {
  skillId: number;
  providerId: number;
  description?: string;
  scheduledAt?: string;    // ISO 8601 datetime string
  durationMinutes: number; // default: 60
  location?: string;
}

// Usage
const response = await apiClient.post<BookingDetailResponse>('/bookings', {
  skillId: 3,
  providerId: 5,
  description: 'Want to learn basic chords',
  scheduledAt: '2026-09-01T14:00:00Z',
  durationMinutes: 60,
  location: 'Central Park',
});
```

**Business Rules (enforced server-side):**
- You cannot book yourself
- Provider must offer the skill (`isOffered: true`)
- Requester must have enough credits: `ceil(durationMinutes / 60)` credits needed

**Errors:**
- `400` — Cannot book yourself
- `400` — Insufficient credits
- `400` — Provider does not offer this skill
- `404` — Skill or provider not found

---

### GET `/api/bookings/:id`

Get full booking details including reviews.

**Auth required. Must be requester or provider.**

```ts
interface BookingDetailResponse extends BookingEntry {
  reviews: Array<{
    id: number;
    rating: number;
    comment: string | null;
    author: { id: number; name: string | null; image: string | null };
    createdAt: string;
  }>;
}

// Usage
const response = await apiClient.get<BookingDetailResponse>(`/bookings/${bookingId}`);
```

**Errors:**
- `403` — Not involved in this booking
- `404` — Booking not found

---

### PATCH `/api/bookings/:id`

Update the booking's status. The allowed transitions depend on your role.

**Auth required. Must be requester or provider.**

```ts
interface UpdateBookingStatusRequest {
  status: 'ACCEPTED' | 'CANCELLED' | 'IN_PROGRESS' | 'COMPLETED' | 'DISPUTED';
}

// Usage
await apiClient.patch(`/bookings/${bookingId}`, { status: 'ACCEPTED' });
```

#### Status Transition Matrix

| Current Status | Who | Can Transition To |
|---|---|---|
| `PENDING` | Provider | `ACCEPTED`, `CANCELLED` |
| `PENDING` | Requester | `CANCELLED` |
| `ACCEPTED` | Provider | `IN_PROGRESS`, `CANCELLED` |
| `ACCEPTED` | Requester | `IN_PROGRESS` |
| `IN_PROGRESS` | Provider | `COMPLETED`, `DISPUTED` |
| `IN_PROGRESS` | Requester | `COMPLETED` |
| `COMPLETED` | — | *(final state)* |
| `CANCELLED` | — | *(final state)* |
| `DISPUTED` | — | *(final state)* |

#### Side Effects on Status Change

| New Status | Side Effect |
|---|---|
| `ACCEPTED` | Notification sent to requester |
| `CANCELLED` | Notification sent to the other party |
| `COMPLETED` | Credits deducted from requester, credits added to provider, notifications to both |

**Errors:**
- `400` — Invalid status transition
- `403` — Not involved in booking or not authorized for this transition

---

## 10. Reviews Endpoints

### GET `/api/reviews?userId=:id`

List reviews received by a specific user.

**Auth required.**

```ts
interface ReviewEntry {
  id: number;
  rating: number;
  comment: string | null;
  createdAt: string;
  author: { id: number; name: string | null; image: string | null };
  booking: {
    id: number;
    skill: { name: string };
    createdAt: string;
  };
}

interface ReviewsResponse {
  reviews: ReviewEntry[];
}

// Usage
const response = await apiClient.get<ReviewsResponse>('/reviews', {
  params: { userId: profileUserId },
});
```

**Errors:**
- `400` — `userId` parameter is required

---

### POST `/api/reviews`

Create a review for a completed booking. Both parties (requester and provider) can review each other.

**Auth required.**

```ts
interface CreateReviewRequest {
  bookingId: number;
  rating: number;    // 1–5
  comment?: string;  // max 500 chars
}

// Usage
const response = await apiClient.post<ReviewEntry>('/reviews', {
  bookingId: 12,
  rating: 5,
  comment: 'Excellent teacher, very patient!',
});
```

**Business Rules:**
- Booking must have status `COMPLETED`
- You must be the requester or provider of the booking
- One review per user per booking (you cannot review twice)
- The review automatically targets the *other* party

**Errors:**
- `400` — Booking not completed
- `400` — You are not part of this booking
- `400` — You have already reviewed this booking
- `404` — Booking not found

---

## 11. Credits Endpoints

### GET `/api/credits`

Get the current user's credit balance and full transaction history.

**Auth required.**

```ts
interface CreditTransaction {
  id: number;
  amount: number;             // positive = earned/added, negative = spent/deducted
  type: 'INITIAL' | 'EARNED' | 'SPENT' | 'ADJUSTED';
  description: string | null;
  createdAt: string;
  relatedBookingId: number | null;
}

interface CreditsResponse {
  balance: number;
  transactions: CreditTransaction[];
}

// Usage
const response = await apiClient.get<CreditsResponse>('/credits');
const { balance, transactions } = response.data;
```

---

### POST `/api/credits/adjust`

Admin: Manually add or deduct credits from any user's balance.

**Admin only.**

```ts
interface CreditAdjustRequest {
  userId: number;
  amount: number;   // positive to add, negative to deduct
  reason: string;   // required description
}

interface CreditAdjustResponse {
  transaction: CreditTransaction;
  newBalance: number;
}

// Usage
const response = await apiClient.post<CreditAdjustResponse>('/credits/adjust', {
  userId: 7,
  amount: 5,
  reason: 'Bonus for community contribution',
});
```

**Errors:**
- `403` — Not admin
- `404` — User not found

---

## 12. Messages Endpoints

### GET `/api/messages`

Get a list of all conversations (one entry per unique chat partner).

**Auth required.**

```ts
interface ConversationEntry {
  otherUser: { id: number; name: string | null; image: string | null };
  lastMessage: {
    id: number;
    content: string;
    createdAt: string;
    senderId: number;
  } | null;
  unreadCount: number;
}

interface ConversationsResponse {
  conversations: ConversationEntry[];
}

// Usage
const response = await apiClient.get<ConversationsResponse>('/messages');
```

---

### GET `/api/messages/conversations?userId=:id`

Get all messages exchanged with a specific user. Also **auto-marks all unread messages from that user as read**.

**Auth required.**

```ts
interface MessageEntry {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  read: boolean;
  createdAt: string;
  sender: { id: number; name: string | null; image: string | null };
  receiver: { id: number; name: string | null; image: string | null };
}

interface ConversationDetailResponse {
  user: { id: number; name: string | null; image: string | null };
  messages: MessageEntry[];
}

// Usage — pass the other user's ID
const response = await apiClient.get<ConversationDetailResponse>('/messages/conversations', {
  params: { userId: otherUserId },
});
```

**Errors:**
- `400` — `userId` param missing
- `404` — User not found

---

### POST `/api/messages`

Send a message to another user.

**Auth required.**

```ts
interface SendMessageRequest {
  receiverId: number;
  content: string;   // min 1 char, max 2000 chars
}

// Usage
const response = await apiClient.post<MessageEntry>('/messages', {
  receiverId: 5,
  content: "Hi! I'd love to book a guitar lesson.",
});
```

**Errors:**
- `400` — Cannot message yourself
- `400` — Validation error (content too long/short)
- `404` — Receiver not found

---

### PATCH `/api/messages/:id`

Mark a single message as read. Only the receiver can do this.

**Auth required.**

```ts
// Usage
await apiClient.patch(`/messages/${messageId}`);
// Response: { success: true }
```

**Errors:**
- `403` — Only the receiver can mark as read
- `404` — Message not found

---

## 13. Notifications Endpoints

### GET `/api/notifications`

Fetch the current user's notifications.

**Auth required.**

```ts
interface NotificationEntry {
  id: number;
  type: NotificationType;
  title: string;
  body: string | null;
  read: boolean;
  link: string | null;   // e.g. "/bookings/5" — use for Next.js router.push()
  createdAt: string;
}

type NotificationType =
  | 'BOOKING_REQUEST'
  | 'BOOKING_ACCEPTED'
  | 'BOOKING_DECLINED'
  | 'BOOKING_COMPLETED'
  | 'REVIEW_RECEIVED'
  | 'MESSAGE_RECEIVED'
  | 'CREDIT_EARNED';

interface NotificationsResponse {
  notifications: NotificationEntry[];
  unreadCount: number;
}

// Usage — all notifications
const response = await apiClient.get<NotificationsResponse>('/notifications');

// Unread only
const response = await apiClient.get<NotificationsResponse>('/notifications', {
  params: { unreadOnly: true, limit: 20 },
});
```

---

### PATCH `/api/notifications`

Mark one or all notifications as read.

**Auth required.**

```ts
// Option 1 — Mark a single notification as read
await apiClient.patch('/notifications', { id: 42 });

// Option 2 — Mark ALL notifications as read
await apiClient.patch('/notifications', { markAllRead: true });

// Response in both cases: { success: true }
```

---

### DELETE `/api/notifications/:id`

Delete a notification. **Own notifications only.**

```ts
// Usage
await apiClient.delete(`/notifications/${notificationId}`);
// Response: { success: true }
```

**Errors:**
- `403` — Not your notification
- `404` — Notification not found

---

## 14. Admin Endpoints

> All admin endpoints require the user to have `role: 'ADMIN'`. They return `403` otherwise.

### GET `/api/admin`

Dashboard statistics.

```ts
interface AdminStatsResponse {
  totalUsers: number;
  totalBookings: number;
  activeBookings: number;        // PENDING + ACCEPTED + IN_PROGRESS
  totalCreditsCirculated: number;
  recentSignups: Array<{
    id: number;
    name: string | null;
    email: string;
    createdAt: string;
  }>;
}

// Usage
const response = await apiClient.get<AdminStatsResponse>('/admin');
```

---

### GET `/api/admin/users`

List all users with pagination and optional search.

```ts
interface AdminUsersResponse {
  users: Array<{
    id: number;
    name: string | null;
    email: string;
    role: 'USER' | 'ADMIN';
    creditBalance: number;
    createdAt: string;
  }>;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Usage
const response = await apiClient.get<AdminUsersResponse>('/admin/users', {
  params: { page: 1, limit: 20, search: 'alice' },
});
```

---

### PATCH `/api/admin/users`

Update a user's role.

```ts
interface UpdateUserRoleRequest {
  userId: number;
  role: 'USER' | 'ADMIN';
}

// Usage
await apiClient.patch('/admin/users', { userId: 7, role: 'ADMIN' });
// Response: Updated AdminUserSerializer object
```

---

### GET `/api/admin/bookings`

List all bookings across all users, with optional status filter.

```ts
interface AdminBookingsResponse {
  bookings: BookingEntry[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Usage
const response = await apiClient.get<AdminBookingsResponse>('/admin/bookings', {
  params: { status: 'DISPUTED', page: 1 },
});
```

---

### DELETE `/api/admin/bookings/:id`

Cancel any booking (sets status to `CANCELLED`).

```ts
// Usage
await apiClient.delete(`/admin/bookings/${bookingId}`);
// Response: { success: true }
```

---

### GET `/api/admin/skills`

List all skills with usage count data.

```ts
interface AdminSkillsResponse {
  skills: Array<{
    id: number;
    name: string;
    slug: string;
    category: string;
    _count: {
      userSkills: number;   // how many users have this skill
      bookings: number;     // how many bookings for this skill
    };
  }>;
}

// Usage
const response = await apiClient.get<AdminSkillsResponse>('/admin/skills');
```

---

## 15. Utility Endpoints

### GET `/api/health`

Server health check. No auth required.

```ts
// Response: { status: "ok", timestamp: "2026-08-05T10:00:00Z" }
const response = await apiClient.get('/health');
```

---

## 16. Data Types Reference

### TypeScript Interfaces

```ts
// types/api.ts

export type BookingStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'DISPUTED';

export type Proficiency = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';

export type CreditType = 'INITIAL' | 'EARNED' | 'SPENT' | 'ADJUSTED';

export type NotificationType =
  | 'BOOKING_REQUEST'
  | 'BOOKING_ACCEPTED'
  | 'BOOKING_DECLINED'
  | 'BOOKING_COMPLETED'
  | 'REVIEW_RECEIVED'
  | 'MESSAGE_RECEIVED'
  | 'CREDIT_EARNED';

export type UserRole = 'USER' | 'ADMIN';

export interface User {
  id: number;
  name: string | null;
  email: string;
  image: string | null;
  bio: string | null;
  location: string | null;
  role: UserRole;
  creditBalance: number;
  createdAt: string;
}

export interface Skill {
  id: number;
  name: string;
  slug: string;
  category: string;
  description: string | null;
  icon: string | null;
}

export interface UserSkill {
  id: number;
  skillId: number;
  isOffered: boolean;
  proficiency: Proficiency;
  note: string | null;
  skill: Skill;
}

export interface Booking {
  id: number;
  status: BookingStatus;
  description: string | null;
  scheduledAt: string | null;
  durationMinutes: number;
  location: string | null;
  createdAt: string;
  skill: Pick<Skill, 'id' | 'name' | 'category'>;
  requester: Pick<User, 'id' | 'name' | 'image'>;
  provider: Pick<User, 'id' | 'name' | 'image'>;
}

export interface Review {
  id: number;
  rating: number;
  comment: string | null;
  createdAt: string;
  author: Pick<User, 'id' | 'name' | 'image'>;
  booking: {
    id: number;
    skill: { name: string };
    createdAt: string;
  };
}

export interface CreditTransaction {
  id: number;
  amount: number;
  type: CreditType;
  description: string | null;
  createdAt: string;
  relatedBookingId: number | null;
}

export interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  read: boolean;
  createdAt: string;
  sender: Pick<User, 'id' | 'name' | 'image'>;
  receiver: Pick<User, 'id' | 'name' | 'image'>;
}

export interface Notification {
  id: number;
  type: NotificationType;
  title: string;
  body: string | null;
  read: boolean;
  link: string | null;
  createdAt: string;
}
```

---

## 17. Business Rules Reference

### Credit System

| Rule | Detail |
|---|---|
| Starter credits | Every new user gets **3 credits** on signup (type: `INITIAL`) |
| Cost of booking | `ceil(durationMinutes / 60)` credits — a 90-min booking costs **2 credits** |
| When credits are deducted | Only when booking status changes to `COMPLETED` |
| When credits are earned | Same moment — provider gains `ceil(duration / 60)` credits on `COMPLETED` |
| Admin override | Admins can add or subtract any amount via `POST /api/credits/adjust` |
| Prevent over-spend | The API checks balance **before** creating a booking. Show balance to user on booking form. |

### Status Transitions (Summary)

```
PENDING → ACCEPTED (provider) | CANCELLED (either)
ACCEPTED → IN_PROGRESS (either) | CANCELLED (provider)
IN_PROGRESS → COMPLETED (either) | DISPUTED (provider)
COMPLETED → [final]
CANCELLED → [final]
DISPUTED  → [final]
```

**Frontend tip:** Use the table above to hide/show action buttons based on `booking.status` and whether the current user is the requester or provider.

```ts
function getAvailableActions(
  booking: Booking,
  currentUserId: number
): BookingStatus[] {
  const isProvider = booking.provider.id === currentUserId;
  const role = isProvider ? 'provider' : 'requester';

  const matrix: Record<string, Record<string, BookingStatus[]>> = {
    PENDING: {
      provider: ['ACCEPTED', 'CANCELLED'],
      requester: ['CANCELLED'],
    },
    ACCEPTED: {
      provider: ['IN_PROGRESS', 'CANCELLED'],
      requester: ['IN_PROGRESS'],
    },
    IN_PROGRESS: {
      provider: ['COMPLETED', 'DISPUTED'],
      requester: ['COMPLETED'],
    },
  };

  return matrix[booking.status]?.[role] ?? [];
}
```

### Notification Routing

When a notification has a `link` field (e.g. `"/bookings/5"`), use it for navigation:

```ts
import { useRouter } from 'next/navigation';

const router = useRouter();

function handleNotificationClick(notification: Notification) {
  // Mark as read first
  await apiClient.patch('/notifications', { id: notification.id });

  // Navigate to linked resource
  if (notification.link) {
    router.push(notification.link);
  }
}
```

### Checking Admin Role

```ts
function isAdmin(user: User | null): boolean {
  return user?.role === 'ADMIN';
}

// In components
{isAdmin(currentUser) && <AdminPanel />}
```

### Determining Booking Role

Many booking operations depend on whether the current user is the provider or requester. Always derive this from IDs, not assumptions:

```ts
function getBookingRole(booking: Booking, currentUserId: number) {
  if (booking.provider.id === currentUserId) return 'provider';
  if (booking.requester.id === currentUserId) return 'requester';
  return null; // Not involved
}
```

---

*Generated: 2026-08-05 | Backend: Django REST Framework | Auth: Token Authentication*
