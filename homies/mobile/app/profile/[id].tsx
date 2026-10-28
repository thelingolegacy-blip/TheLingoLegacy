import { Text, View } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/constants/Colors";

export default function PublicProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <SafeAreaView className="flex-1 bg-charcoal px-5 pt-5">
      <Stack.Screen options={{ title: "Profile" }} />
      <View className="rounded-2xl border p-5" style={{ backgroundColor: Colors.grayDark, borderColor: Colors.grayMid }}>
        <Text className="font-semibold text-white">Profile preview</Text>
        <Text className="mt-2 leading-6" style={{ color: Colors.grayLight }}>Profile {id ?? "unknown"} loads only after authenticated API access and privacy filtering are implemented.</Text>
      </View>
    </SafeAreaView>
  );
}
