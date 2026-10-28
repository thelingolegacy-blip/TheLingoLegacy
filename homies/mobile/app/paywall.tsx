import { Text, View } from "react-native";
import { Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/constants/Colors";

const plans = [
  { name: "Free", price: "$0", detail: "Basic discovery and chat" },
  { name: "Homies+", price: "$14.99/mo", detail: "Expanded discovery features" },
  { name: "Homies Black", price: "$29.99/mo", detail: "Premium experience and features" }
];

export default function PaywallScreen() {
  return (
    <SafeAreaView className="flex-1 bg-charcoal px-5 pt-5">
      <Stack.Screen options={{ title: "Homies plans" }} />
      <Text className="text-3xl font-bold text-white">Go further with Homies</Text>
      <Text className="mt-2 leading-6" style={{ color: Colors.grayLight }}>Proposed plans only; billing is not connected.</Text>
      {plans.map((plan) => (
        <View key={plan.name} className="mt-4 rounded-2xl border p-5" style={{ backgroundColor: Colors.grayDark, borderColor: Colors.grayMid }}>
          <Text className="text-lg font-bold text-white">{plan.name}</Text>
          <Text className="mt-1 text-2xl font-bold" style={{ color: Colors.crimson }}>{plan.price}</Text>
          <Text className="mt-2" style={{ color: Colors.grayLight }}>{plan.detail}</Text>
          <Text className="mt-3 text-xs" style={{ color: Colors.grayLight }}>Preview only · checkout disabled</Text>
        </View>
      ))}
    </SafeAreaView>
  );
}
