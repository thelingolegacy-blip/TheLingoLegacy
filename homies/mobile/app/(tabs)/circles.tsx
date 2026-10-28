import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/constants/Colors";

export default function CirclesScreen() {
  return (
    <SafeAreaView className="flex-1 bg-charcoal px-5 pt-5" edges={["top"]}>
      <Text className="text-3xl font-bold text-white">Circles</Text>
      <View className="mt-5 rounded-2xl border p-5" style={{ backgroundColor: Colors.grayDark, borderColor: Colors.grayMid }}>
        <Text className="font-semibold text-white">Find your people</Text>
        <Text className="mt-2 leading-6" style={{ color: Colors.grayLight }}>Circle discovery and membership are awaiting the authenticated backend.</Text>
      </View>
    </SafeAreaView>
  );
}
