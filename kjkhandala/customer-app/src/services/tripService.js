import { supabase } from '../config/supabase';

export const tripService = {
  // Search for trips
  searchTrips: async (origin, destination, date, passengers = 1) => {
    try {
      const { data, error } = await supabase
        .from('trips')
        .select(`
          *,
          route:routes(*),
          bus:buses(*),
          driver:drivers(*)
        `)
        .eq('route.origin_city_id', origin)
        .eq('route.destination_city_id', destination)
        .gte('departure_time', date)
        .eq('status', 'scheduled')
        .gte('available_seats', passengers)
        .order('departure_time', { ascending: true });

      if (error) throw error;

      // Enhance with amenities and ratings
      const enhancedTrips = data.map(trip => ({
        ...trip,
        amenities: trip.bus?.amenities || [],
        rating: trip.rating || 4.5,
        duration: calculateDuration(trip.departure_time, trip.arrival_time),
      }));

      return { data: enhancedTrips, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Get trip details
  getTripDetails: async (tripId) => {
    try {
      const { data, error } = await supabase
        .from('trips')
        .select(`
          *,
          route:routes(*),
          bus:buses(*),
          driver:drivers(*)
        `)
        .eq('id', tripId)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Get available seats for a trip
  getAvailableSeats: async (tripId) => {
    try {
      // Get bus seat configuration
      const { data: trip, error: tripError } = await supabase
        .from('trips')
        .select('bus:buses(seat_config, seating_capacity)')
        .eq('id', tripId)
        .single();

      if (tripError) throw tripError;

      // Get booked seats
      const { data: bookings, error: bookingError } = await supabase
        .from('bookings')
        .select('seat_numbers')
        .eq('trip_id', tripId)
        .in('status', ['confirmed', 'checked_in', 'boarded']);

      if (bookingError) throw bookingError;

      const bookedSeats = bookings.flatMap(b => b.seat_numbers || []);
      const seatConfig = trip.bus.seat_config || generateDefaultSeatConfig(trip.bus.seating_capacity);

      return { 
        data: {
          seatConfig,
          bookedSeats,
          totalSeats: trip.bus.seating_capacity,
        }, 
        error: null 
      };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Get cities for search
  getCities: async () => {
    try {
      const { data, error } = await supabase
        .from('cities')
        .select('*')
        .order('name');

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Get popular routes
  getPopularRoutes: async () => {
    try {
      const { data, error } = await supabase
        .from('routes')
        .select(`
          *,
          origin:cities!routes_origin_city_id_fkey(name),
          destination:cities!routes_destination_city_id_fkey(name)
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Track bus location
  trackBus: async (tripId) => {
    try {
      const { data, error } = await supabase
        .from('gps_tracking')
        .select('*')
        .eq('trip_id', tripId)
        .order('timestamp', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Subscribe to real-time bus location
  subscribeToBusLocation: (tripId, callback) => {
    const subscription = supabase
      .channel(`trip:${tripId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'gps_tracking',
          filter: `trip_id=eq.${tripId}`,
        },
        (payload) => {
          callback(payload.new);
        }
      )
      .subscribe();

    return subscription;
  },
};

// Helper functions
const calculateDuration = (departure, arrival) => {
  const diff = new Date(arrival) - new Date(departure);
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m`;
};

const generateDefaultSeatConfig = (capacity) => {
  // Generate a default 2x2 layout
  const rows = Math.ceil(capacity / 4);
  const config = [];
  
  for (let row = 0; row < rows; row++) {
    config.push({
      row: row + 1,
      seats: [
        { number: row * 4 + 1, position: 'left-window' },
        { number: row * 4 + 2, position: 'left-aisle' },
        { number: row * 4 + 3, position: 'right-aisle' },
        { number: row * 4 + 4, position: 'right-window' },
      ].filter(seat => seat.number <= capacity),
    });
  }
  
  return config;
};
