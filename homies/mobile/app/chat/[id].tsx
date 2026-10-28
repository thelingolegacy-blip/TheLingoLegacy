import { Text, View } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/constants/Colors";

export default function ConversationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <SafeAreaView className="flex-1 bg-charcoal px-5 pt-5">
      <Stack.Screen options={{ title: "Conversation" }} />
      <View className="rounded-2xl border p-5" style={{ backgroundColor: Colors.grayDark, borderColor: Colors.grayMid }}>
        <Text className="font-semibold text-white">Conversation unavailable</Text>
        <Text className="mt-2 leading-6" style={{ color: Colors.grayLight }}>Conversation {id ?? "unknown"} is a UI scaffold. Server-side membership authorization is required before messages can load or send.</Text>
      </View>
    </SafeAreaView>
  );
}
