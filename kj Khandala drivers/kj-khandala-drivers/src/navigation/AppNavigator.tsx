import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../context/AuthContext';
import { LoginScreen } from '../screens/LoginScreen';
import { PasswordResetScreen } from '../screens/PasswordResetScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { MyTripsScreen } from '../screens/MyTripsScreen';
import { MyShiftsScreen } from '../screens/MyShiftsScreen';
import { PreTripInspectionScreen } from '../screens/PreTripInspectionScreen';
import { FuelLogScreen } from '../screens/FuelLogScreen';
import { BreakdownReportScreen } from '../screens/BreakdownReportScreen';
import { PassengerCheckInScreen } from '../screens/PassengerCheckInScreen';
import { BusHealthScreen } from '../screens/BusHealthScreen';
import { DriverProfileScreen } from '../screens/DriverProfileScreen';
import { ChangePasswordScreen } from '../screens/ChangePasswordScreen';
import { ViewDocumentsScreen } from '../screens/ViewDocumentsScreen';
import { PerformanceReportScreen } from '../screens/PerformanceReportScreen';
import { ActivityIndicator, View, StyleSheet, Text } from 'react-native';
import { theme } from '../config/theme';

export type RootStackParamList = {
  Login: undefined;
  PasswordReset: undefined;
  MainTabs: undefined;
  PreTripInspection: undefined;
  FuelLog: undefined;
  BreakdownReport: undefined;
  PassengerCheckIn: { tripId?: string };
  BusHealth: undefined;
  DriverProfile: undefined;
  ChangePassword: undefined;
  ViewDocuments: undefined;
  PerformanceReport: undefined;
};

export type TabParamList = {
  Home: undefined;
  MyTrips: undefined;
  MyShifts: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

const MainTabs: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>🏠</Text>,
        }}
      />
      <Tab.Screen
        name="MyTrips"
        component={MyTripsScreen}
        options={{
          tabBarLabel: 'Trips',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>🚌</Text>,
        }}
      />
      <Tab.Screen
        name="MyShifts"
        component={MyShiftsScreen}
        options={{
          tabBarLabel: 'Shifts',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>📅</Text>,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={DriverProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>👤</Text>,
        }}
      />
    </Tab.Navigator>
  );
};

export const AppNavigator: React.FC = () => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        {!isAuthenticated ? (
          // Auth Stack
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen
              name="PasswordReset"
              component={PasswordResetScreen}
              options={{
                headerShown: true,
                title: 'Reset Password',
                headerBackTitle: 'Back',
              }}
            />
          </>
        ) : (
          // Authenticated Stack - Role-based routing
          <>
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen name="PreTripInspection" component={PreTripInspectionScreen} />
            <Stack.Screen name="FuelLog" component={FuelLogScreen} />
            <Stack.Screen name="BreakdownReport" component={BreakdownReportScreen} />
            <Stack.Screen name="PassengerCheckIn" component={PassengerCheckInScreen} />
            <Stack.Screen name="BusHealth" component={BusHealthScreen} />
            <Stack.Screen name="DriverProfile" component={DriverProfileScreen} />
            <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
            <Stack.Screen name="ViewDocuments" component={ViewDocumentsScreen} />
            <Stack.Screen name="PerformanceReport" component={PerformanceReportScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
});
