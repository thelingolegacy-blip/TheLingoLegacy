import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GrokOrb } from "@/components/GrokOrb";
import { Colors } from "@/constants/Colors";

export default function ExploreScreen() {
  return (
    <SafeAreaView className="flex-1 bg-charcoal" edges={["top"]}>
      <View className="px-5 pb-4 pt-3">
        <Text className="text-sm font-semibold uppercase tracking-widest" style={{ color: Colors.crimson }}>HOMIES</Text>
        <Text className="mt-2 text-3xl font-bold text-white">Discovery</Text>
        <Text className="mt-2 text-base" style={{ color: Colors.grayLight }}>Find homies worth your time.</Text>
      </View>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120 }}>
        <View className="rounded-2xl border p-5" style={{ backgroundColor: Colors.grayDark, borderColor: Colors.grayMid }}>
          <Text className="text-lg font-semibold text-white">Your next connection starts here.</Text>
          <Text className="mt-2 leading-6" style={{ color: Colors.grayLight }}>
            Profile discovery will appear here when the authenticated discovery API is connected.
          </Text>
          <View className="mt-4 self-start rounded-full px-3 py-1" style={{ backgroundColor: "#3A1820" }}>
            <Text className="text-xs font-semibold" style={{ color: "#FFB8C4" }}>PREVIEW · NO LIVE PROFILES</Text>
          </View>
        </View>
      </ScrollView>
      <GrokOrb />
    </SafeAreaView>
  );
}
