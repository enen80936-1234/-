import express from 'express';
import { getFeeRecords, getFeeBalance, createFeeRecord, deleteFeeRecord } from '../db.js';

const router = express.Router();

router.get('/records', (req, res) => {
  try {
    const records = getFeeRecords();
    res.json(records);
  } catch (error) {
    console.error('Get fee records error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

router.get('/balance', (req, res) => {
  try {
    const balance = getFeeBalance();
    res.json(balance);
  } catch (error) {
    console.error('Get fee balance error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

router.post('/records', (req, res) => {
  try {
    const { type, amount, source, purpose, operator } = req.body;

    if (!type || !amount || !operator) {
      return res.status(400).json({ message: '缺少必填字段' });
    }

    if (type !== 'deposit' && type !== 'withdraw') {
      return res.status(400).json({ message: '类型必须是 deposit 或 withdraw' });
    }

    if (amount <= 0) {
      return res.status(400).json({ message: '金额必须大于 0' });
    }

    const record = createFeeRecord({
      type,
      amount: parseFloat(amount),
      source: type === 'deposit' ? source : '',
      purpose: type === 'withdraw' ? purpose : '',
      operator,
    });

    res.status(201).json(record);
  } catch (error) {
    console.error('Create fee record error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

router.delete('/records/:id', (req, res) => {
  try {
    const { id } = req.params;
    const success = deleteFeeRecord(id);

    if (!success) {
      return res.status(404).json({ message: '记录不存在' });
    }

    res.json({ message: '删除成功' });
  } catch (error) {
    console.error('Delete fee record error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

export default router;
