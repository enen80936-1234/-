export interface FeeRecord {
  id: string;
  type: 'deposit' | 'withdraw';
  amount: number;
  source: string;
  purpose: string;
  operator: string;
  createdAt: string;
}

export interface FeeBalance {
  totalDeposit: number;
  totalWithdraw: number;
  balance: number;
}

export interface CreateFeeRecordRequest {
  type: 'deposit' | 'withdraw';
  amount: number;
  source?: string;
  purpose?: string;
  operator: string;
}
