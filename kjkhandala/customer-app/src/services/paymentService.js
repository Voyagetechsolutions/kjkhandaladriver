import { supabase } from '../config/supabase';
import axios from 'axios';
import { API_BASE_URL } from '../config/constants';

export const paymentService = {
  // Initialize payment
  initiatePayment: async ({ bookingId, amount, paymentMethod }) => {
    try {
      const { data, error } = await supabase
        .from('payments')
        .insert({
          booking_id: bookingId,
          amount: amount,
          payment_method: paymentMethod,
          payment_status: 'pending',
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      // For CASH (pay at office), mark booking as reserved
      if (paymentMethod === 'CASH') {
        await supabase
          .from('bookings')
          .update({ booking_status: 'confirmed', payment_status: 'pending' })
          .eq('id', bookingId);
      }

      return { 
        data: { 
          ...data, 
          reference: data.id 
        }, 
        error: null 
      };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Verify payment status
  verifyPayment: async (paymentId) => {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('id', paymentId)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Complete payment
  completePayment: async (paymentId, transactionRef) => {
    try {
      const { data, error } = await supabase
        .from('payments')
        .update({
          status: 'completed',
          transaction_reference: transactionRef,
          completed_at: new Date().toISOString(),
        })
        .eq('id', paymentId)
        .select()
        .single();

      if (error) throw error;

      // Update booking status
      await supabase
        .from('bookings')
        .update({
          payment_status: 'completed',
          status: 'confirmed',
        })
        .eq('id', data.booking_id);

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Get payment history
  getPaymentHistory: async (userId) => {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          booking:bookings(
            *,
            trip:trips(*)
          )
        `)
        .eq('booking.user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },
};

// Payment processor functions
const processOrangeMoney = async (paymentId, details) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/payments/orange-money`, {
      paymentId,
      phoneNumber: details.phoneNumber,
      amount: details.amount,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

const processMascomMyZaka = async (paymentId, details) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/payments/mascom-myzaka`, {
      paymentId,
      phoneNumber: details.phoneNumber,
      amount: details.amount,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

const processSmegaWallet = async (paymentId, details) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/payments/smega-wallet`, {
      paymentId,
      walletId: details.walletId,
      amount: details.amount,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

const processCapitecPay = async (paymentId, details) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/payments/capitec-pay`, {
      paymentId,
      phoneNumber: details.phoneNumber,
      amount: details.amount,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

const processOzow = async (paymentId, details) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/payments/ozow`, {
      paymentId,
      amount: details.amount,
      email: details.email,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

const processCardPayment = async (paymentId, details) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/payments/card`, {
      paymentId,
      cardNumber: details.cardNumber,
      expiryDate: details.expiryDate,
      cvv: details.cvv,
      amount: details.amount,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

const processCashReservation = async (paymentId) => {
  try {
    // Generate reservation code
    const reservationCode = `CASH${Date.now().toString().slice(-8)}`;
    
    await supabase
      .from('payments')
      .update({
        status: 'pending',
        transaction_reference: reservationCode,
      })
      .eq('id', paymentId);

    return {
      success: true,
      reservationCode,
      message: 'Please pay at the station within 24 hours',
    };
  } catch (error) {
    throw error;
  }
};
