import "react-native-gesture-handler";
import "../global.css";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Colors } from "@/constants/Colors";

export default function RootLayout() {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: { retry: 1, staleTime: 30_000, refetchOnWindowFocus: false }
    }
  }));

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="light" backgroundColor={Colors.charcoal} />
        <Stack screenOptions={{
          headerStyle: { backgroundColor: Colors.charcoal },
          headerTintColor: Colors.white,
          contentStyle: { backgroundColor: Colors.charcoal },
          headerShadowVisible: false
        }}>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="grok" options={{ title: "Grok", presentation: "modal" }} />
          <Stack.Screen name="chat/[id]" options={{ title: "Conversation" }} />
          <Stack.Screen name="profile/[id]" options={{ title: "Profile" }} />
          <Stack.Screen name="paywall" options={{ title: "Homies plans", presentation: "modal" }} />
        </Stack>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
