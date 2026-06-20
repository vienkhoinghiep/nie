// VINEN — Mentor module types

export type MentorStatus = "pending" | "confirmed" | "completed" | "cancelled" | "no_show";

export interface MentorExpertise {
  id: string;
  slug: string;
  label: string;
  description: string | null;
  color: string;
  icon: string | null;
  sort_order: number;
}

export interface Mentor {
  id: string;
  user_id: string | null;
  slug: string;
  full_name: string;
  title: string | null;
  bio: string | null;
  short_bio: string | null;
  avatar: string | null;
  cover_image: string | null;
  expertise_tags: string[];
  industries: string[];
  years_experience: number;
  current_position: string | null;
  past_companies: string[];
  education: string | null;
  languages: string[];
  timezone: string;
  linkedin: string | null;
  twitter: string | null;
  website: string | null;
  email_public: string | null;
  calendar_link: string | null;
  hourly_rate: number;
  free_intro_minutes: number;
  is_active: boolean;
  is_featured: boolean;
  accepts_bookings: boolean;
  sort_order: number;
  total_sessions: number;
  completed_sessions: number;
  avg_rating: number;
  avg_nps: number;
  total_ratings: number;
  created_at: string;
  updated_at: string;
}

export interface MentorAvailability {
  id: string;
  mentor_id: string;
  day_of_week: number; // 0=Sun, 6=Sat
  start_time: string;
  end_time: string;
  timezone: string;
  is_active: boolean;
}

export interface MentorSession {
  id: string;
  mentor_id: string;
  mentee_id: string;
  scheduled_at: string;
  duration_minutes: number;
  meeting_link: string | null;
  topic: string;
  goals: string | null;
  mentee_notes: string | null;
  mentor_notes: string | null;
  status: MentorStatus;
  price_paid: number;
  order_id: string | null;
  confirmed_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
  cancellation_reason: string | null;
  cancelled_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface MentorRating {
  id: string;
  session_id: string;
  mentor_id: string;
  mentee_id: string;
  rating: number; // 1..5
  nps_score: number | null; // 0..10
  feedback: string | null;
  private_feedback: string | null;
  would_recommend: boolean | null;
  topics_discussed: string[];
  is_public: boolean;
  created_at: string;
}

export interface MentorStats {
  mentor_id: string;
  slug: string;
  full_name: string;
  is_active: boolean;
  is_featured: boolean;
  total_sessions: number;
  completed_sessions: number;
  completion_rate_pct: number;
  avg_rating: number;
  avg_nps: number;
  total_ratings: number;
  total_hours_mentored: number;
  nps_index: number | null;
}
