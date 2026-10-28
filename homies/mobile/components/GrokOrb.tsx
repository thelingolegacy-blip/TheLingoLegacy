import { Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Colors } from "@/constants/Colors";

export function GrokOrb() {
  const router = useRouter();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Open Grok assistant"
      onPress={() => router.push("/grok")}
      className="absolute bottom-7 right-5 h-14 w-14 items-center justify-center rounded-full"
      style={{
        backgroundColor: Colors.crimson,
        shadowColor: Colors.crimson,
        shadowOpacity: 0.35,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 5 },
        elevation: 8
      }}
    >
      <Ionicons name="sparkles" size={25} color={Colors.white} />
    </Pressable>
  );
}
