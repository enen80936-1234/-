export async function parseApiError(response: Response): Promise<string> {
  try {
    const data = await response.json();
    if (data?.message) return data.message;
  } catch {
    // ignore JSON parse errors
  }
  return `请求失败 (${response.status})`;
}

export function getNetworkErrorMessage(error: unknown): string {
  if (error instanceof TypeError) {
    return '网络连接失败，请检查网络后重试。若在国内访问，建议使用 Zeabur 部署并选择香港/台湾节点。';
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return '发生未知错误，请稍后重试';
}
