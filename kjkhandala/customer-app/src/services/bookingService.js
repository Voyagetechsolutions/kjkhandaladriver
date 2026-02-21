import { supabase } from '../config/supabase';

export const bookingService = {
  // Create a new booking
  createBooking: async (bookingData) => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .insert({
          trip_id: bookingData.tripId,
          user_id: bookingData.userId,
          passenger_name: bookingData.passengerName,
          passenger_phone: bookingData.passengerPhone,
          passenger_id_number: bookingData.passengerIdNumber,
          passenger_gender: bookingData.passengerGender,
          next_of_kin: bookingData.nextOfKin,
          seat_numbers: bookingData.seatNumbers,
          total_amount: bookingData.totalAmount,
          luggage_count: bookingData.luggageCount || 0,
          luggage_fee: bookingData.luggageFee || 0,
          promo_code: bookingData.promoCode,
          discount_amount: bookingData.discountAmount || 0,
          status: 'pending',
          payment_status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;

      // Generate booking reference
      const bookingRef = `VB${data.id.substring(0, 8).toUpperCase()}`;
      await supabase
        .from('bookings')
        .update({ booking_reference: bookingRef })
        .eq('id', data.id);

      return { data: { ...data, booking_reference: bookingRef }, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Get user bookings
  getUserBookings: async (userId, status = null) => {
    try {
      let query = supabase
        .from('bookings')
        .select(`
          id,
          booking_reference,
          seat_number,
          booking_status,
          payment_status,
          total_amount,
          created_at,
          trip:trips(
            id,
            trip_number,
            scheduled_departure,
            scheduled_arrival,
            fare,
            status,
            routes(origin, destination),
            buses(name, bus_type, registration_number)
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('booking_status', status);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching bookings:', error);
        throw error;
      }
      
      console.log('Fetched bookings:', data?.length || 0);
      return { data, error: null };
    } catch (error) {
      console.error('getUserBookings error:', error);
      return { data: null, error };
    }
  },

  // Get booking details
  getBookingDetails: async (bookingId) => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          trip:trips(
            *,
            route:routes(*),
            bus:buses(*),
            driver:drivers(*)
          ),
          payment:payments(*)
        `)
        .eq('id', bookingId)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Cancel booking
  cancelBooking: async (bookingId, reason) => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .update({
          status: 'cancelled',
          cancellation_reason: reason,
          cancelled_at: new Date().toISOString(),
        })
        .eq('id', bookingId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Request refund
  requestRefund: async (bookingId, reason, bankDetails) => {
    try {
      // Get booking details
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .select('*, trip:trips(departure_time)')
        .eq('id', bookingId)
        .single();

      if (bookingError) throw bookingError;

      // Calculate refund amount based on cancellation policy
      const refundAmount = calculateRefundAmount(
        booking.total_amount,
        booking.trip.departure_time
      );

      // Create refund request
      const { data, error } = await supabase
        .from('refunds')
        .insert({
          booking_id: bookingId,
          amount: refundAmount,
          reason,
          bank_details: bankDetails,
          status: 'pending',
          requested_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      // Update booking status
      await supabase
        .from('bookings')
        .update({ status: 'refund_requested' })
        .eq('id', bookingId);

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Reschedule booking
  rescheduleBooking: async (bookingId, newTripId) => {
    try {
      // Get current booking
      const { data: currentBooking, error: currentError } = await supabase
        .from('bookings')
        .select('*, trip:trips(*)')
        .eq('id', bookingId)
        .single();

      if (currentError) throw currentError;

      // Get new trip
      const { data: newTrip, error: newTripError } = await supabase
        .from('trips')
        .select('*')
        .eq('id', newTripId)
        .single();

      if (newTripError) throw newTripError;

      // Calculate fare difference
      const fareDifference = newTrip.fare - currentBooking.trip.fare;

      // Update booking
      const { data, error } = await supabase
        .from('bookings')
        .update({
          trip_id: newTripId,
          total_amount: currentBooking.total_amount + fareDifference,
          rescheduled_at: new Date().toISOString(),
        })
        .eq('id', bookingId)
        .select()
        .single();

      if (error) throw error;

      return { 
        data: {
          ...data,
          fareDifference,
          requiresPayment: fareDifference > 0,
        }, 
        error: null 
      };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Check-in
  checkIn: async (bookingId) => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .update({
          status: 'checked_in',
          checked_in_at: new Date().toISOString(),
        })
        .eq('id', bookingId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Validate promo code
  validatePromoCode: async (code, tripId, amount) => {
    try {
      const { data, error } = await supabase
        .from('promotions')
        .select('*')
        .eq('code', code.toUpperCase())
        .eq('status', 'active')
        .lte('valid_from', new Date().toISOString())
        .gte('valid_until', new Date().toISOString())
        .single();

      if (error) throw error;

      // Calculate discount
      let discountAmount = 0;
      if (data.discount_type === 'percentage') {
        discountAmount = (amount * data.discount_value) / 100;
        if (data.max_discount && discountAmount > data.max_discount) {
          discountAmount = data.max_discount;
        }
      } else {
        discountAmount = data.discount_value;
      }

      return { 
        data: {
          ...data,
          discountAmount,
          finalAmount: amount - discountAmount,
        }, 
        error: null 
      };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Add luggage
  addLuggage: async (bookingId, luggageCount, luggageFee) => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .update({
          luggage_count: luggageCount,
          luggage_fee: luggageFee,
        })
        .eq('id', bookingId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },
};

// Helper function to calculate refund amount
const calculateRefundAmount = (totalAmount, departureTime) => {
  const now = new Date();
  const departure = new Date(departureTime);
  const hoursUntilDeparture = (departure - now) / (1000 * 60 * 60);

  // Refund policy
  if (hoursUntilDeparture > 48) {
    return totalAmount * 0.9; // 90% refund
  } else if (hoursUntilDeparture > 24) {
    return totalAmount * 0.7; // 70% refund
  } else if (hoursUntilDeparture > 12) {
    return totalAmount * 0.5; // 50% refund
  } else if (hoursUntilDeparture > 6) {
    return totalAmount * 0.3; // 30% refund
  } else {
    return 0; // No refund
  }
};
