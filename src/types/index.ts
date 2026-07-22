import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      creditBalance: number;
    } & DefaultSession["user"];
  }
}

export interface SkillWithUserCount {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string | null;
  icon: string | null;
  _count: {
    userSkills: number;
  };
}

export interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  bio: string | null;
  location: string | null;
  creditBalance: number;
  role: string;
  createdAt: Date;
  userSkills: Array<{
    id: string;
    proficiency: string;
    isOffered: boolean;
    note: string | null;
    skill: {
      id: string;
      name: string;
      slug: string;
      category: string;
      icon: string | null;
    };
  }>;
}

export interface BookingWithDetails {
  id: string;
  status: string;
  description: string | null;
  scheduledAt: Date | null;
  durationMinutes: number;
  location: string | null;
  createdAt: Date;
  requester: {
    id: string;
    name: string | null;
    image: string | null;
  };
  provider: {
    id: string;
    name: string | null;
    image: string | null;
  };
  skill: {
    id: string;
    name: string;
    slug: string;
    category: string;
  };
}

export interface ReviewWithAuthor {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
  author: {
    id: string;
    name: string | null;
    image: string | null;
  };
}
