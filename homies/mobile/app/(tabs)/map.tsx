import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/constants/Colors";

export default function MapScreen() {
  return (
    <SafeAreaView className="flex-1 bg-charcoal px-5 pt-5" edges={["top"]}>
      <Text className="text-3xl font-bold text-white">Map</Text>
      <Text className="mt-2 leading-6" style={{ color: Colors.grayLight }}>
        Map rendering is not enabled yet. Location sharing must be opt-in, approximate by default, and authorized by the backend.
      </Text>
      <View className="mt-6 rounded-2xl border p-5" style={{ backgroundColor: Colors.grayDark, borderColor: Colors.grayMid }}>
        <Text className="font-semibold text-white">Map integration pending</Text>
        <Text className="mt-2" style={{ color: Colors.grayLight }}>No location is requested or transmitted by this screen.</Text>
      </View>
    </SafeAreaView>
  );
}
