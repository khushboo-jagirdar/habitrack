import express from 'express';
import Transaction from '../models/Transaction.js';
import Property from '../models/Property.js';

const router = express.Router();

function validateCard(cardNumber, expiryDate, cvv) {
  const clean = cardNumber.replace(/\s/g, '');
  if (clean.length < 13 || clean.length > 19 || !/^\d+$/.test(clean)) return false;
  if (!/^\d{3,4}$/.test(cvv)) return false;
  if (!/^\d{2}\/\d{2}$/.test(expiryDate)) return false;
  return true;
}

// Create transaction
router.post('/', async (req, res) => {
  try {
    const { userId, propertyId, type, amount, cardNumber, cardHolder, expiryDate, cvv } = req.body;
    if (!userId || !propertyId || !type || !amount) {
      return res.status(400).json({ message: 'All fields are required.' });
    }
    if (type !== 'buy' && type !== 'rent') {
      return res.status(400).json({ message: 'Type must be "buy" or "rent".' });
    }
    if (!cardNumber || !cardHolder || !expiryDate || !cvv) {
      return res.status(400).json({ message: 'Payment information is incomplete.' });
    }
    if (!validateCard(cardNumber, expiryDate, cvv)) {
      return res.status(400).json({ message: 'Invalid payment details.' });
    }

    const property = await Property.findById(propertyId);
    if (!property) return res.status(404).json({ message: 'Property not found.' });

    const transaction = new Transaction({
      propertyId,
      buyerId: userId,
      ownerId: property.ownerId,
      type,
      amount: Number(amount),
      status: 'completed',
      paymentLast4: cardNumber.replace(/\s/g, '').slice(-4),
    });
    await transaction.save();
    res.status(201).json({
      message: `Property ${type === 'buy' ? 'purchased' : 'rented'} successfully!`,
      transaction,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get user transactions
router.get('/user/:userId', async (req, res) => {
  try {
    const transactions = await Transaction.find({ buyerId: req.params.userId });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all transactions
router.get('/', async (req, res) => {
  try {
    const transactions = await Transaction.find();
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
