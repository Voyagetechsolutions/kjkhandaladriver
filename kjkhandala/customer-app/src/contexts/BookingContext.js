import React, { createContext, useState, useContext } from 'react';
import { bookingService } from '../services/bookingService';
import { useAuth } from './AuthContext';

const BookingContext = createContext({});

export const BookingProvider = ({ children }) => {
  const { user } = useAuth();
  const [bookingFlow, setBookingFlow] = useState({
    trip: null,
    passengers: 1,
    selectedSeats: [],
    passengerDetails: [],
    totalAmount: 0,
    promoCode: null,
    discountAmount: 0,
  });

  const [cart, setCart] = useState([]);

  // Start booking flow
  const startBooking = (trip, passengers) => {
    setBookingFlow({
      trip,
      passengers,
      selectedSeats: [],
      passengerDetails: [],
      totalAmount: trip.fare * passengers,
      promoCode: null,
      discountAmount: 0,
    });
  };

  // Update selected seats
  const updateSeats = (seats) => {
    setBookingFlow(prev => ({
      ...prev,
      selectedSeats: seats,
    }));
  };

  // Update passenger details
  const updatePassengerDetails = (details) => {
    setBookingFlow(prev => ({
      ...prev,
      passengerDetails: details,
    }));
  };

  // Apply promo code
  const applyPromoCode = async (code) => {
    try {
      const { data, error } = await bookingService.validatePromoCode(
        code,
        bookingFlow.trip.id,
        bookingFlow.totalAmount
      );

      if (error) throw error;

      setBookingFlow(prev => ({
        ...prev,
        promoCode: code,
        discountAmount: data.discountAmount,
        totalAmount: data.finalAmount,
      }));

      return { success: true, discount: data.discountAmount };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Add to cart
  const addToCart = () => {
    const cartItem = {
      id: Date.now().toString(),
      trip: bookingFlow.trip,
      seats: bookingFlow.selectedSeats,
      passengers: bookingFlow.passengerDetails,
      amount: bookingFlow.totalAmount,
      discountAmount: bookingFlow.discountAmount,
      promoCode: bookingFlow.promoCode,
    };

    setCart(prev => [...prev, cartItem]);
    
    // Reset booking flow
    setBookingFlow({
      trip: null,
      passengers: 1,
      selectedSeats: [],
      passengerDetails: [],
      totalAmount: 0,
      promoCode: null,
      discountAmount: 0,
    });

    return cartItem;
  };

  // Remove from cart
  const removeFromCart = (itemId) => {
    setCart(prev => prev.filter(item => item.id !== itemId));
  };

  // Clear cart
  const clearCart = () => {
    setCart([]);
  };

  // Get cart total
  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.amount, 0);
  };

  // Create bookings from cart
  const createBookingsFromCart = async () => {
    try {
      const bookings = [];

      for (const item of cart) {
        for (let i = 0; i < item.passengers.length; i++) {
          const passenger = item.passengers[i];
          const seat = item.seats[i];

          const bookingData = {
            tripId: item.trip.id,
            userId: user.id,
            passengerName: passenger.fullName,
            passengerPhone: passenger.phone || user.profile?.phone,
            passengerIdNumber: passenger.idNumber,
            passengerGender: passenger.gender,
            nextOfKin: passenger.nextOfKin,
            seatNumbers: [seat],
            totalAmount: item.trip.fare,
            promoCode: item.promoCode,
            discountAmount: item.discountAmount / item.passengers.length,
          };

          const { data, error } = await bookingService.createBooking(bookingData);
          if (error) throw error;
          bookings.push(data);
        }
      }

      return { data: bookings, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  // Reset booking flow
  const resetBookingFlow = () => {
    setBookingFlow({
      trip: null,
      passengers: 1,
      selectedSeats: [],
      passengerDetails: [],
      totalAmount: 0,
      promoCode: null,
      discountAmount: 0,
    });
  };

  const value = {
    bookingFlow,
    cart,
    startBooking,
    updateSeats,
    updatePassengerDetails,
    applyPromoCode,
    addToCart,
    removeFromCart,
    clearCart,
    getCartTotal,
    createBookingsFromCart,
    resetBookingFlow,
  };

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};
