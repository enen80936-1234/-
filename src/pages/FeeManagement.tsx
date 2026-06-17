import { useState, useEffect } from 'react';
import { Plus, Trash2, ArrowDownLeft, ArrowUpRight, Wallet } from 'lucide-react';
import { FeeRecord, FeeBalance } from '../types/fee';
import { getFeeRecords, getFeeBalance, createFeeRecord, deleteFeeRecord } from '../services/feeService';

export default function FeeManagement() {
  const [records, setRecords] = useState<FeeRecord[]>([]);
  const [balance, setBalance] = useState<FeeBalance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    type: 'deposit' as 'deposit' | 'withdraw',
    amount: '',
    source: '',
    purpose: '',
    operator: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [recordsData, balanceData] = await Promise.all([
        getFeeRecords(),
        getFeeBalance(),
      ]);
      setRecords(recordsData);
      setBalance(balanceData);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载数据失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.amount || !formData.operator) {
      setError('请填写金额和操作人');
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      setError('金额必须大于 0');
      return;
    }

    try {
      await createFeeRecord({
        type: formData.type,
        amount,
        source: formData.source,
        purpose: formData.purpose,
        operator: formData.operator,
      });
      setShowModal(false);
      setFormData({
        type: 'deposit',
        amount: '',
        source: '',
        purpose: '',
        operator: '',
      });
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : '创建记录失败');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('确定要删除这条记录吗？')) return;

    try {
      await deleteFeeRecord(id);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除记录失败');
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Wallet className="w-7 h-7 text-blue-600" />
          班费管理
        </h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          添加记录
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="text-green-100 text-sm mb-1">总收入</div>
          <div className="text-2xl font-bold">¥{balance?.totalDeposit.toFixed(2) || '0.00'}</div>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white">
          <div className="text-red-100 text-sm mb-1">总支出</div>
          <div className="text-2xl font-bold">¥{balance?.totalWithdraw.toFixed(2) || '0.00'}</div>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="text-blue-100 text-sm mb-1">剩余余额</div>
          <div className="text-2xl font-bold">¥{balance?.balance.toFixed(2) || '0.00'}</div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">收支记录</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {records.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-500">
              暂无记录，点击上方按钮添加
            </div>
          ) : (
            records.map((record) => (
              <div key={record.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    record.type === 'deposit' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {record.type === 'deposit' ? (
                      <ArrowDownLeft className="w-5 h-5 text-green-600" />
                    ) : (
                      <ArrowUpRight className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-gray-800">
                      {record.type === 'deposit' ? '存入' : '转出'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {record.type === 'deposit' ? `来源: ${record.source}` : `用途: ${record.purpose}`}
                    </div>
                    <div className="text-xs text-gray-400">
                      {record.operator} · {formatDate(record.createdAt)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className={`font-bold ${
                    record.type === 'deposit' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {record.type === 'deposit' ? '+' : '-'}¥{record.amount.toFixed(2)}
                  </div>
                  <button
                    onClick={() => handleDelete(record.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-xl">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">添加记录</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">类型</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="type"
                      value="deposit"
                      checked={formData.type === 'deposit'}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as 'deposit' })}
                      className="w-4 h-4 text-green-600"
                    />
                    <span className="text-gray-700">存入</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="type"
                      value="withdraw"
                      checked={formData.type === 'withdraw'}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as 'withdraw' })}
                      className="w-4 h-4 text-red-600"
                    />
                    <span className="text-gray-700">转出</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">金额</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="请输入金额"
                />
              </div>

              {formData.type === 'deposit' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">金额来源</label>
                  <input
                    type="text"
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="如：开学收班费"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">金额用途</label>
                  <input
                    type="text"
                    value={formData.purpose}
                    onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="如：购买班级用品"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">操作人</label>
                <input
                  type="text"
                  value={formData.operator}
                  onChange={(e) => setFormData({ ...formData, operator: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="如：班长"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  添加
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
