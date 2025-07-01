import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

// Yaha ma sabai tabs ko layout banako chu, jastai mero notebook ma sabai pages cha!
export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false, // Header hide gareko chu, jastai cap launu parinna class ma!
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: 'absolute',
          },
          default: {},
        }),
      }}
      initialRouteName="home" // Yaha home page lai default banako chu, jastai ghar nai sabai bhanda safe!
    >
      {/* Yaha home tab cha, jastai ghar jane button! */}
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      {/* Yo chai favourite things ko tab, jastai mero man parne toys! */}
      <Tabs.Screen
        name="favourite"
        options={{
          title: 'Favourites',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="heart.fill" color={color} />,
        }}
      />
      {/* Profile tab ma mero sabai details cha, jastai school ID card ma! */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
        }}
      />
      {/* Yaha login page cha but tab ma dekhaudaina, jastai lukeko treasure! */}
      <Tabs.Screen
        name="login"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      {/* Register page pani lukayeko cha, jastai secret diary! */}
      <Tabs.Screen
        name="register"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      {/* Select page ma buyer ya seller choose garne, jastai game ma character choose garne! */}
      <Tabs.Screen
        name="select"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      {/* Home-buyer page lukayeko cha, special buyers ko lagi! */}
      <Tabs.Screen
        name="home-buyer"
        options={{
          href: null, // Hide from tab bar
        }}
      />
    </Tabs>
  );
}