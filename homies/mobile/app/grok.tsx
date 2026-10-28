import { useState } from "react";
import { FlatList, KeyboardAvoidingView, Platform, Pressable, Text, TextInput, View } from "react-native";
import { Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/constants/Colors";

type Message = { id: string; role: "assistant" | "user"; content: string };

export default function GrokScreen() {
  const [messages] = useState<Message[]>([
    { id: "welcome", role: "assistant", content: "Hey — I'm Grok, the Homies assistant. The secure AI service isn't connected yet, so this preview can't send messages." }
  ]);
  const [input, setInput] = useState("");

  return (
    <SafeAreaView className="flex-1 bg-charcoal" edges={["bottom"]}>
      <Stack.Screen options={{ title: "Grok", headerShown: true }} />
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={88}>
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, gap: 12, flexGrow: 1 }}
          renderItem={({ item }) => (
            <View className="max-w-[88%] rounded-2xl p-4" style={{
              alignSelf: item.role === "user" ? "flex-end" : "flex-start",
              backgroundColor: item.role === "user" ? Colors.crimson : Colors.grayDark
            }}>
              <Text className="mb-1 text-xs font-semibold" style={{ color: item.role === "user" ? "#FFE8ED" : "#FFB8C4" }}>
                {item.role === "assistant" ? "GROK · PREVIEW" : "YOU"}
              </Text>
              <Text className="leading-6 text-white">{item.content}</Text>
            </View>
          )}
          ListFooterComponent={<Text className="px-1 text-xs leading-5" style={{ color: Colors.grayLight }}>AI responses are not safety guarantees. Do not share sensitive information until privacy controls are available.</Text>}
        />
        <View className="flex-row items-center gap-2 border-t px-4 py-3" style={{ borderColor: Colors.grayMid }}>
          <TextInput
            value={input}
            onChangeText={setInput}
            editable={false}
            placeholder="Grok service not connected"
            placeholderTextColor={Colors.grayLight}
            accessibilityLabel="Grok message input, disabled in preview"
            className="min-h-12 flex-1 rounded-2xl px-4 text-white"
            style={{ backgroundColor: Colors.grayDark }}
          />
          <Pressable accessibilityRole="button" accessibilityLabel="Send disabled in preview" disabled style={{ backgroundColor: Colors.grayMid }} className="h-12 w-12 items-center justify-center rounded-full opacity-60">
            <Ionicons name="arrow-up" size={22} color={Colors.white} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
