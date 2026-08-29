export type ProviderApiEnvelope<T> = {
  success: boolean;
  data?: T;
  message?: string;
  error_code?: string;
  timestamp?: string;
};

export type ProviderCredits = {
  credits: number;
};

export type ProviderPackage = {
  id: number;
  name: string;
  is_trial: boolean;
  is_official: boolean;
  credits: number;
  max_connections: number;
  duration: number;
  duration_unit: string;
  expire_date: string;
};

export type ProviderLine = {
  id: number;
  username: string;
  password?: string;
  exp_date: number;
  enabled: boolean;
  max_connections?: number;
  is_trial?: boolean;
  notes?: string;
};

export type ProviderLinesPage = {
  data: ProviderLine[];
  pagination?: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
};

export type ProviderStatus = {
  connected: boolean;
  credits: number | null;
  label: string;
};
