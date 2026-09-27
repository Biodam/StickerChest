export interface QuotaCheckOptions {
  strict?: boolean;
  allowPrivate?: boolean;
}

export interface QuotaCheckResult {
  isPublic: boolean;
  isPrivate: boolean;
  activeRuns: number;
  billing: any;
}

export function checkQuota(options?: QuotaCheckOptions): Promise<QuotaCheckResult>;
