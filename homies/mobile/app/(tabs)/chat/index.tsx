import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/constants/Colors";

export default function ChatListScreen() {
  return (
    <SafeAreaView className="flex-1 bg-charcoal px-5 pt-5" edges={["top"]}>
      <Text className="text-3xl font-bold text-white">Chat</Text>
      <View className="mt-5 rounded-2xl border p-5" style={{ backgroundColor: Colors.grayDark, borderColor: Colors.grayMid }}>
        <Text className="font-semibold text-white">Your conversations</Text>
        <Text className="mt-2 leading-6" style={{ color: Colors.grayLight }}>
          Conversations will load after authenticated API and WebSocket services are implemented. No demo messages are presented as real data.
        </Text>
      </View>
    </SafeAreaView>
  );
}
