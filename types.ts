// Portfolio Type Definitions

export interface Skill {
  name: string;
  level?: string;
}

export interface Experience {
  company: string;
  position: string;
  description: string;
  period?: string;
}

export interface Education {
  institution: string;
  degree: string;
  period?: string;
}

export interface Project {
  name: string;
  description: string;
  imageUrl: string;
  technologies?: string[];
  githubUrl?: string;
  reportUrl?: string;
}

export interface Portfolio {
  id: string;
  userId: string;
  name: string;
  title: string;
  about: string;
  smallIntro?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  profilePictureUrl?: string;
  hasCv: boolean;
  cvUrl?: string;
  templateId: string;
  skills: Skill[];
  experience: Experience[];
  education: Education[];
  projects: Project[];
  githubProfile?: string;
  slug: string;
  createdAt?: string;
  updatedAt?: string;
  isPreviewPaid?: boolean;
  paymentStatus?: string;
  paymentSessionId?: string | null;
  [key: string]: any; // For any other properties
} 