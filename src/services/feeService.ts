import { FeeRecord, FeeBalance, CreateFeeRecordRequest } from '../types/fee';

const BASE_URL = '/api/fee';

export async function getFeeRecords(): Promise<FeeRecord[]> {
  const response = await fetch(`${BASE_URL}/records`);
  if (!response.ok) {
    throw new Error('获取记录失败');
  }
  return response.json();
}

export async function getFeeBalance(): Promise<FeeBalance> {
  const response = await fetch(`${BASE_URL}/balance`);
  if (!response.ok) {
    throw new Error('获取余额失败');
  }
  return response.json();
}

export async function createFeeRecord(data: CreateFeeRecordRequest): Promise<FeeRecord> {
  const response = await fetch(`${BASE_URL}/records`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || '创建记录失败');
  }
  return response.json();
}

export async function deleteFeeRecord(id: string): Promise<void> {
  const response = await fetch(`${BASE_URL}/records/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || '删除记录失败');
  }
}
