export interface AssistantContext {
  page: string;
  route: string;
  role: string;
  entity?: {
    type: string;
    id?: string | number;
    name?: string;
    status?: string;
  };
  data?: Record<string, unknown>;
}

export type UserRole = 'BRAND' | 'CREATOR' | 'FREELANCER' | 'TALENT_MANAGER';

export type CampaignStatus = 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';

export type CollaborationRequestStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';

export type ContractStatus = 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'TERMINATED';

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
