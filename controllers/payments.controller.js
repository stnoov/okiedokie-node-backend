require("dotenv").config();
const db = require("../models");
const sha1 = require("sha1");
const { v4: uuidv4 } = require('uuid');

const User = db.user;
const Payments = db.payments;

class YooKassaService {
  constructor() {
    this.shopId = process.env.YOOKASSA_SHOP_ID;
    this.secretKey = process.env.YOOKASSA_SECRET_KEY;
    this.apiUrl = 'https://api.yookassa.ru/v3';

    if (typeof fetch === 'undefined') {
      this.fetch = require('node-fetch');
    } else {
      this.fetch = fetch;
    }
  }

  getAuthHeader() {
    const credentials = Buffer.from(`${this.shopId}:${this.secretKey}`).toString('base64');
    return `Basic ${credentials}`;
  }

  async makeRequest(endpoint, method = 'GET', data = null) {
    const url = `${this.apiUrl}${endpoint}`;

    const options = {
      method,
      headers: {
        'Authorization': this.getAuthHeader(),
        'Content-Type': 'application/json',
      },
    };

    if (method === 'POST') {
      options.headers['Idempotence-Key'] = uuidv4();
    }

    if (data) {
      options.body = JSON.stringify(data);
    }

    try {
      const response = await this.fetch(url, options);
      const result = await response.json();

      if (!response.ok) {
        console.error('YooKassa API Error Response:', result);
        throw new Error(`YooKassa API Error: ${result.description || result.error_description || response.statusText}`);
      }

      return result;
    } catch (error) {
      console.error('YooKassa API request failed:', error);
      throw error;
    }
  }

  // Create payment according to YooKassa docs
  async createPayment({ amount, description, metadata = {}, paymentMethodData = null }) {
    const paymentData = {
      amount: {
        value: amount.toFixed(2),
        currency: 'RUB'
      },
      confirmation: {
        type: 'redirect',
        return_url: `https://okiedokie.club/payment/success?amount=${amount}&currency=RUB`
      },
      description: description,
      metadata: metadata,
      capture: true, 

      receipt: {
        customer: {
          email: metadata.user_email || 'noreply@okiedokie.com'
        },
        items: [
          {
            description: description || 'Пополнение баланса',
            quantity: '1.00',
            amount: {
              value: amount.toFixed(2),
              currency: 'RUB'
            },
            vat_code: 1, // НДС не облагается
            payment_mode: 'full_payment',
            payment_subject: 'service' // Услуга
          }
        ]
      }
    };

    if (paymentMethodData) {
      paymentData.payment_method_data = paymentMethodData;
    } else {
      paymentData.payment_method_data = {
        type: 'bank_card'
      };
    }

    return await this.makeRequest('/payments', 'POST', paymentData);
  }

  async getPayment(paymentId) {
    return await this.makeRequest(`/payments/${paymentId}`);
  }
}

const yooKassa = new YooKassaService();

// Legacy YooMoney webhook handler (keep for transition)
exports.handle_payments = (req, res) => {
  const checkNotification = `${req.body.notification_type}&${req.body.operation_id}&${req.body.amount}&${req.body.currency}&${req.body.datetime}&${req.body.sender}&${req.body.codepro}&${process.env.NOTIFICATION_SECRET}&${req.body.label}`;
  const sha1_hash = sha1(checkNotification);
  console.log("sha1_hash: ", sha1_hash);

  if (req.body.sha1_hash === sha1_hash) {
    console.log("sha1 OK");
    User.findOne({
      where: {
        id: req.body.label,
      },
    }).then((user) => {
      user
        .update({
          balance: parseInt(user.balance) + parseInt(req.body.withdraw_amount),
        })
        .then(() => {
          Payments.create({
            withdraw_amount: req.body.withdraw_amount,
            datetime: req.body.datetime,
            codepro: req.body.codepro,
            accepted: req.body.unaccepted,
            userId: req.body.label,
          });
        })
        .then(() => {
          return res.status(200).send({ message: "Success!" });
        });
    });
  }
};

// New YooKassa payment creation 
exports.create_payment = async (req, res) => {
  try {
    const { amount, description, payment_method_type } = req.body;
    const userId = req.userId; 

    // Validate input
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid amount'
      });
    }

    if (amount < 1) { // YooKassa minimum is 1 RUB
      return res.status(400).json({
        success: false,
        message: 'Minimum amount is 1 RUB'
      });
    }

    if (amount > 999999.99) { // YooKassa maximum
      return res.status(400).json({
        success: false,
        message: 'Maximum amount is 999,999.99 RUB'
      });
    }

    let paymentMethodData = null;
    if (payment_method_type) {
      switch (payment_method_type) {
        case 'bank_card':
          paymentMethodData = { type: 'bank_card' };
          break;
        case 'yoo_money':
          paymentMethodData = { type: 'yoo_money' };
          break;
        case 'sberbank':
          paymentMethodData = { type: 'sberbank' };
          break;
        case 'qiwi':
          paymentMethodData = { type: 'qiwi' };
          break;
        default:
          paymentMethodData = { type: 'bank_card' }; // Default to bank card
      }
    }

    // Create payment in YooKassa
    const paymentData = await yooKassa.createPayment({
      amount: amount,
      description: description || `Пополнение баланса на ${amount} ₽`,
      metadata: {
        user_id: userId.toString(),
        user_email: req.user?.email || 'noreply@okiedokie.com', // Add user email
        created_from: 'web_app',
        order_id: `balance_${userId}_${Date.now()}`
      },
      returnUrl: `${process.env.FRONTEND_URL}/payment/success?payment_id={payment_id}`,
      paymentMethodData: paymentMethodData
    });

    // Save payment to database
    await Payments.create({
      payment_id: paymentData.id,
      userId: userId,
      amount: amount,
      currency: 'RUB',
      status: paymentData.status,
      description: description || `Пополнение баланса на ${amount} ₽`,
      yookassa_data: JSON.stringify(paymentData),
      createdAt: new Date(),
      updatedAt: new Date()
    });

    console.log(`YooKassa payment created: ${paymentData.id} for user ${userId}, amount: ${amount} RUB`);

    return res.json({
      success: true,
      payment: {
        id: paymentData.id,
        status: paymentData.status,
        amount: {
          value: paymentData.amount.value,
          currency: paymentData.amount.currency
        },
        confirmation_url: paymentData.confirmation?.confirmation_url,
        created_at: paymentData.created_at,
        description: paymentData.description
      }
    });

  } catch (error) {
    console.error('Create YooKassa payment error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create payment',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// YooKassa webhook handler (corrected according to docs)
exports.handle_yookassa_webhook = async (req, res) => {
  try {
    const { type, event, object: paymentObject } = req.body;

    console.log('YooKassa webhook received:', {
      type,
      event,
      payment_id: paymentObject?.id,
      status: paymentObject?.status,
      paid: paymentObject?.paid
    });

    // Respond immediately to YooKassa (required)
    res.status(200).json({ success: true });

    // Process webhook asynchronously
    if (type === 'notification') {
      switch (event) {
        case 'payment.succeeded':
          await processPaymentSucceeded(paymentObject);
          break;
        case 'payment.canceled':
          await processPaymentCanceled(paymentObject);
          break;
        case 'payment.waiting_for_capture':
          await processPaymentWaitingForCapture(paymentObject);
          break;
        default:
          console.log(`Unhandled YooKassa event: ${event}`);
      }
    }

  } catch (error) {
    console.error('YooKassa webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
};

// Process successful payment (according to YooKassa response structure)
async function processPaymentSucceeded(paymentObject) {
  try {
    const paymentId = paymentObject.id;
    const amount = parseFloat(paymentObject.amount.value);
    const userId = paymentObject.metadata?.user_id;

    if (!userId) {
      console.error('No user_id in payment metadata:', paymentId);
      return;
    }

    // Find payment in database
    const payment = await Payments.findOne({
      where: { payment_id: paymentId }
    });

    if (!payment) {
      console.error('Payment not found in database:', paymentId);
      return;
    }

    // Update payment status
    await payment.update({
      status: 'succeeded',
      yookassa_data: JSON.stringify(paymentObject),
      updatedAt: new Date()
    });

    // Update user balance
    const user = await User.findByPk(userId);
    if (user) {
      const currentBalance = parseFloat(user.balance || 0);
      const newBalance = currentBalance + amount;

      await user.update({
        balance: newBalance.toFixed(2),
        updatedAt: new Date()
      });

      console.log(`Balance updated for user ${userId}: +${amount} RUB, new balance: ${newBalance} RUB`);
    }

  } catch (error) {
    console.error('Process payment succeeded error:', error);
  }
}

// Process canceled payment
async function processPaymentCanceled(paymentObject) {
  try {
    const paymentId = paymentObject.id;

    const payment = await Payments.findOne({
      where: { payment_id: paymentId }
    });

    if (payment) {
      await payment.update({
        status: 'canceled',
        yookassa_data: JSON.stringify(paymentObject),
        updatedAt: new Date()
      });

      console.log(`❌ Payment canceled: ${paymentId}`);
    }

  } catch (error) {
    console.error('Process payment canceled error:', error);
  }
}

// Process payment waiting for capture
async function processPaymentWaitingForCapture(paymentObject) {
  try {
    const paymentId = paymentObject.id;

    const payment = await Payments.findOne({
      where: { payment_id: paymentId }
    });

    if (payment) {
      await payment.update({
        status: 'waiting_for_capture',
        yookassa_data: JSON.stringify(paymentObject),
        updatedAt: new Date()
      });

      console.log(`⏳ Payment waiting for capture: ${paymentId}`);
    }

    // Auto-capture if enabled (optional)
    if (process.env.YOOKASSA_AUTO_CAPTURE === 'true') {
      try {
        await yooKassa.capturePayment(paymentId);
        console.log(`✅ Auto-captured payment: ${paymentId}`);
      } catch (error) {
        console.error('Auto-capture failed:', error);
      }
    }

  } catch (error) {
    console.error('Process payment waiting for capture error:', error);
  }
}

// Get payment status
exports.get_payment_status = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const userId = req.userId;

    // Find payment in database
    const payment = await Payments.findOne({
      where: {
        payment_id: paymentId,
        userId: userId // Ensure user owns this payment
      }
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Get fresh status from YooKassa
    try {
      const yooKassaPayment = await yooKassa.getPayment(paymentId);

      // Update status if different
      if (yooKassaPayment.status !== payment.status) {
        await payment.update({
          status: yooKassaPayment.status,
          yookassa_data: JSON.stringify(yooKassaPayment),
          updatedAt: new Date()
        });
      }

      return res.json({
        success: true,
        payment: {
          id: yooKassaPayment.id,
          status: yooKassaPayment.status,
          paid: yooKassaPayment.paid,
          amount: yooKassaPayment.amount,
          description: yooKassaPayment.description,
          created_at: yooKassaPayment.created_at,
          confirmation: yooKassaPayment.confirmation
        }
      });

    } catch (error) {
      // If YooKassa request fails, return database status
      return res.json({
        success: true,
        payment: {
          id: payment.payment_id,
          status: payment.status,
          amount: {
            value: payment.amount,
            currency: payment.currency
          },
          description: payment.description,
          created_at: payment.createdAt
        }
      });
    }

  } catch (error) {
    console.error('Get payment status error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get payment status'
    });
  }
};

// Get payment history
exports.get_payment_history = async (req, res) => {
  try {
    const userId = req.userId;
    const { page = 1, limit = 10, status } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = { userId: userId };

    if (status) {
      whereClause.status = status;
    }

    const { count, rows: payments } = await Payments.findAndCountAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    return res.json({
      success: true,
      payments: payments.map(payment => ({
        id: payment.payment_id || payment.id,
        amount: payment.amount || payment.withdraw_amount,
        currency: payment.currency || 'RUB',
        status: payment.status || 'completed',
        description: payment.description,
        created_at: payment.createdAt || payment.datetime,
        payment_method: payment.yookassa_data ? JSON.parse(payment.yookassa_data).payment_method : null
      })),
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });

  } catch (error) {
    console.error('Get payment history error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get payment history'
    });
  }
};
