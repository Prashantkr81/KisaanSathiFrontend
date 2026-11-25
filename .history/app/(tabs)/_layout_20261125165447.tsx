import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    
    <Tabs screenOptions={{ headerShown: false }} >
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="crops" options={{ title: "Crops" }} />
      <Tabs.Screen name="mandi" options={{ title: "Mandi" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
      <Tabs.Screen name="farms" options={{ title: "Farms" }} />

      <Tabs.Screen name="schemes" options={{title: "Schemes" }}/>
    </Tabs>
  );
}