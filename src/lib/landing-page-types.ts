/** Type definitions for the landing_pages table. */

export interface BonusItem {
  name: string;
  value: string;
  icon?: string;
}

export interface Testimonial {
  name: string;
  role: string;
  content: string;
  avatar?: string;
}

export type FormField = "name" | "email" | "phone";

export interface LandingPage {
  id: string;
  slug: string;
  title: string;
  meta_description: string | null;

  hero_badge: string | null;
  hero_headline: string;
  hero_subheadline: string | null;
  hero_image_url: string | null;

  benefits: string[];
  bonus_items: BonusItem[];
  testimonials: Testimonial[];
  body_html: string | null;

  form_fields: FormField[];
  cta_label: string;

  success_message: string;
  success_redirect_url: string | null;

  tag_on_submit: string | null;
  automation_id: string | null;
  add_to_list_id: string | null;

  brand_color: string | null;

  status: "draft" | "published" | "archived";
  views: number;
  conversions: number;

  created_at: string;
  updated_at: string;
}
