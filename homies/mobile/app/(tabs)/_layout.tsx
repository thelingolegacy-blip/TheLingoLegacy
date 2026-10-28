import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";

const tabIcons = {
  explore: ["compass", "compass-outline"],
  map: ["map", "map-outline"],
  chat: ["chatbubbles", "chatbubbles-outline"],
  circles: ["people", "people-outline"],
  profile: ["person-circle", "person-circle-outline"]
} as const;

type TabName = keyof typeof tabIcons;

export default function TabLayout() {
  return (
    <Tabs screenOptions={({ route }) => {
      const name = route.name as TabName;
      const pair = tabIcons[name] ?? ["ellipse", "ellipse-outline"];
      return {
        headerShown: false,
        tabBarActiveTintColor: Colors.crimson,
        tabBarInactiveTintColor: Colors.grayLight,
        tabBarStyle: {
          backgroundColor: Colors.charcoal,
          borderTopColor: Colors.grayMid,
          height: 82,
          paddingTop: 9,
          paddingBottom: 20
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
        tabBarIcon: ({ focused, color, size }) => (
          <Ionicons name={(focused ? pair[0] : pair[1]) as never} color={color} size={size} />
        )
      };
    }}>
      <Tabs.Screen name="explore" options={{ title: "Explore" }} />
      <Tabs.Screen name="map" options={{ title: "Map" }} />
      <Tabs.Screen name="chat" options={{ title: "Chat", tabBarBadge: undefined }} />
      <Tabs.Screen name="circles" options={{ title: "Circles" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
    </Tabs>
  );
}
