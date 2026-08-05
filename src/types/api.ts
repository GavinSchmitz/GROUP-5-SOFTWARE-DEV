export type BookingStatus =
  | "PENDING"
  | "ACCEPTED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "DISPUTED";

export type Proficiency = "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT";

export type CreditType = "INITIAL" | "EARNED" | "SPENT" | "ADJUSTED";

export type NotificationType =
  | "BOOKING_REQUEST"
  | "BOOKING_ACCEPTED"
  | "BOOKING_DECLINED"
  | "BOOKING_COMPLETED"
  | "REVIEW_RECEIVED"
  | "MESSAGE_RECEIVED"
  | "CREDIT_EARNED";

export type UserRole = "USER" | "ADMIN";

export interface UserBrief {
  id: number;
  name: string | null;
  image: string | null;
}

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
  skill: Pick<Skill, "id" | "name" | "category">;
  requester: UserBrief;
  provider: UserBrief;
}

export interface Review {
  id: number;
  rating: number;
  comment: string | null;
  createdAt: string;
  author: UserBrief;
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
  sender: UserBrief;
  receiver: UserBrief;
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

// ─── Auth ───

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
}

export interface SignupResponse {
  id: number;
  email: string;
  token: string;
}

export interface SigninRequest {
  email: string;
  password: string;
}

export interface SigninUser {
  id: number;
  email: string;
  name: string | null;
  role: UserRole;
  image: string | null;
  creditBalance: number;
}

export interface SigninResponse {
  token: string;
  user: SigninUser;
}

// ─── Users ───

export interface UserSkillEntry {
  id: number;
  proficiency: Proficiency;
  is_offered: boolean;
  note: string | null;
  skill: {
    id: number;
    name: string;
    slug: string;
    category: string;
  };
}

export interface UserProfile {
  id: number;
  name: string | null;
  email: string;
  image: string | null;
  bio: string | null;
  location: string | null;
  creditBalance: number;
  createdAt: string;
  userSkills: UserSkillEntry[];
  _count: {
    requestedBookings: number;
    providedBookings: number;
    reviewsReceived: number;
  };
}

export interface UpdateProfileRequest {
  name?: string;
  bio?: string;
  location?: string;
  image?: string;
}

export interface UpdateProfileResponse {
  id: number;
  name: string | null;
  bio: string | null;
  location: string | null;
  image: string | null;
}

// ─── Skills ───

export interface SkillEntry {
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

export interface SkillsListResponse {
  skills: SkillEntry[];
  categories: string[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SkillDetailUserSkill {
  id: number;
  proficiency: Proficiency;
  note: string | null;
  user: UserBrief & { location?: string | null };
}

export interface SkillDetailResponse {
  id: number;
  name: string;
  slug: string;
  category: string;
  description: string | null;
  icon: string | null;
  userSkills: SkillDetailUserSkill[];
}

export interface CreateSkillRequest {
  name: string;
  slug: string;
  category: string;
  description?: string;
  icon?: string;
}

export interface UpdateSkillRequest {
  name?: string;
  description?: string;
  category?: string;
  icon?: string;
}

// ─── User Skills ───

export interface AddUserSkillRequest {
  skillId: number;
  isOffered: boolean;
  proficiency: Proficiency;
  note?: string;
}

export interface UserSkillResponse {
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

export interface UpdateUserSkillRequest {
  proficiency?: Proficiency;
  note?: string;
}

// ─── Bookings ───

export type BookingEntry = Booking;

export interface BookingsListResponse {
  bookings: BookingEntry[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateBookingRequest {
  skillId: number;
  providerId: number;
  description?: string;
  scheduledAt?: string;
  durationMinutes: number;
  location?: string;
}

export interface BookingDetailResponse extends BookingEntry {
  reviews: Array<{
    id: number;
    rating: number;
    comment: string | null;
    author: UserBrief;
    createdAt: string;
  }>;
}

export interface UpdateBookingStatusRequest {
  status: Exclude<BookingStatus, "PENDING">;
}

// ─── Reviews ───

export interface ReviewEntry {
  id: number;
  rating: number;
  comment: string | null;
  createdAt: string;
  author: UserBrief;
  booking: {
    id: number;
    skill: { name: string };
    createdAt: string;
  };
}

export interface ReviewsResponse {
  reviews: ReviewEntry[];
}

export interface CreateReviewRequest {
  bookingId: number;
  rating: number;
  comment?: string;
}

// ─── Credits ───

export interface CreditsResponse {
  balance: number;
  transactions: CreditTransaction[];
}

export interface CreditAdjustRequest {
  userId: number;
  amount: number;
  reason: string;
}

export interface CreditAdjustResponse {
  transaction: CreditTransaction;
  newBalance: number;
}

// ─── Messages ───

export interface ConversationEntry {
  otherUser: UserBrief;
  lastMessage: {
    id: number;
    content: string;
    createdAt: string;
    senderId: number;
  } | null;
  unreadCount: number;
}

export interface ConversationsResponse {
  conversations: ConversationEntry[];
}

export type MessageEntry = Message;

export interface ConversationDetailResponse {
  user: UserBrief;
  messages: MessageEntry[];
}

export interface SendMessageRequest {
  receiverId: number;
  content: string;
}

// ─── Notifications ───

export type NotificationEntry = Notification;

export interface NotificationsResponse {
  notifications: NotificationEntry[];
  unreadCount: number;
}

// ─── Admin ───

export interface AdminStatsResponse {
  totalUsers: number;
  totalBookings: number;
  activeBookings: number;
  totalCreditsCirculated: number;
  recentSignups: Array<{
    id: number;
    name: string | null;
    email: string;
    createdAt: string;
  }>;
}

export interface AdminUser {
  id: number;
  name: string | null;
  email: string;
  role: UserRole;
  creditBalance: number;
  createdAt: string;
}

export interface AdminUsersResponse {
  users: AdminUser[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UpdateUserRoleRequest {
  userId: number;
  role: UserRole;
}

export interface AdminBookingsResponse {
  bookings: BookingEntry[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AdminSkillEntry {
  id: number;
  name: string;
  slug: string;
  category: string;
  _count: {
    userSkills: number;
    bookings: number;
  };
}

export interface AdminSkillsResponse {
  skills: AdminSkillEntry[];
}

export interface SuccessResponse {
  success: true;
}
