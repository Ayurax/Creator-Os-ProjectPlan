export interface User {
  id: string;
  email: string;
  role: 'BRAND' | 'CREATOR' | 'FREELANCER' | 'TALENT_MANAGER';
  name?: string;
  bio?: string;
}

export interface Campaign {
  id: string;
  name: string;
  description?: string;
  budget?: number;
  status: string;
  brandId: string;
  createdAt: string;
}

export interface Creator {
  id: string;
  email: string;
  name?: string;
  bio?: string;
  niche?: string;
  followers?: number;
  engagementRate?: number;
  platforms?: string[];
}

export interface Collaboration {
  id: string;
  campaignId: string;
  creatorId: string;
  status: string;
  message?: string;
  createdAt: string;
}

export interface Contract {
  id: string;
  collaborationRequestId: string;
  status: string;
  terms?: string;
  createdAt: string;
}

export interface Task {
  id: string;
  contractId: string;
  description: string;
  status: string;
  assigneeId?: string;
  dueDate?: string;
  deliverables?: Deliverable[];
  createdAt: string;
}

export interface Deliverable {
  id: string;
  description?: string;
  mediaUrl?: string;
  submittedAt?: string;
}

export interface Payment {
  id: string;
  contractId: string;
  amount: number;
  status: string;
  createdAt: string;
}

export interface Review {
  id: string;
  campaignId: string;
  creatorId: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface Message {
  id: string;
  receiverId: string;
  content: string;
  createdAt: string;
}

export interface PortfolioItem {
  id: string;
  title: string;
  description?: string;
  mediaUrl?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
}
