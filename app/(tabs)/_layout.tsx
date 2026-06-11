import * as Haptics from "expo-haptics";
import { Tabs } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { Strings } from "../../src/constants/strings";
import {
  Colors,
  FontSize,
  Radius,
  Shadow,
  Spacing,
} from "../../src/constants/theme";

type RouteName = "index" | "reminders";

const TAB_ICONS: Record<RouteName, { active: string; inactive: string }> = {
  index: { active: "⌂", inactive: "⌂" },
  reminders: { active: "≡", inactive: "≡" },
};

const TAB_LABELS: Record<RouteName, string> = {
  index: Strings.tabHome,
  reminders: Strings.tabReminders,
};

interface TabItemProps {
  routeName: RouteName;
  isFocused: boolean;
  onPress: () => void;
}

function TabItem({ routeName, isFocused, onPress }: TabItemProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.tab}
      accessibilityRole="button"
      accessibilityState={{ selected: isFocused }}
    >
      <View style={styles.iconWrapper}>
        <Text style={[styles.tabIcon, isFocused && styles.tabIconFocused]}>
          {routeName === "index" ? "⌂" : "≡"}
        </Text>
      </View>
      <Text style={[styles.tabLabel, isFocused && styles.tabLabelFocused]}>
        {TAB_LABELS[routeName]}
      </Text>
    </TouchableOpacity>
  );
}

interface TabBarRoute {
  key: string;
  name: string;
}

interface TabBarState {
  index: number;
  routes: TabBarRoute[];
}

interface TabBarNavigation {
  emit: (opts: {
    type: string;
    target: string;
    canPreventDefault: boolean;
  }) => { defaultPrevented: boolean };
  navigate: (name: string) => void;
}

interface TabBarProps {
  state: TabBarState;
  navigation: TabBarNavigation;
}

function CustomTabBar({ state, navigation }: TabBarProps) {
  const indicatorX = useSharedValue(0);
  const tabWidth = useRef(0);

  useEffect(() => {
    if (tabWidth.current > 0) {
      indicatorX.value = withSpring(state.index * tabWidth.current, {
        damping: 20,
        stiffness: 200,
      });
    }
  }, [state.index, indicatorX]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value }],
  }));

  const tabPercent = `${100 / state.routes.length}%` as `${number}%`;

  return (
    <View style={styles.tabBar}>
      <View
        style={styles.tabBarInner}
        onLayout={(e) => {
          const w = e.nativeEvent.layout.width / state.routes.length;
          tabWidth.current = w;
          indicatorX.value = state.index * w;
        }}
      >
        {/* Sliding indicator */}
        <Animated.View
          style={[styles.indicator, indicatorStyle, { width: tabPercent }]}
        />

        {state.routes.map((route, i) => {
          const isFocused = state.index === i;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              Haptics.selectionAsync();
              navigation.navigate(route.name);
            }
          };

          return (
            <TabItem
              key={route.key}
              routeName={route.name as RouteName}
              isFocused={isFocused}
              onPress={onPress}
            />
          );
        })}
      </View>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => (
        <CustomTabBar {...(props as unknown as TabBarProps)} />
      )}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: Colors.bg },
      }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="reminders" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: "absolute",
    bottom: Platform.OS === "ios" ? 24 : 16,
    left: Spacing.lg,
    right: Spacing.lg,
    ...Shadow.lg,
  },
  tabBarInner: {
    flexDirection: "row",
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
    position: "relative",
  },
  indicator: {
    position: "absolute",
    top: 0,
    bottom: 0,
    backgroundColor: Colors.accentMuted,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    gap: 3,
    minHeight: 64,
  },
  iconWrapper: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  tabIcon: {
    fontSize: 20,
    color: Colors.textMuted,
  },
  tabIconFocused: {
    color: Colors.accent,
  },
  tabLabel: {
    fontSize: FontSize.xs,
    fontFamily: "Inter_400Regular",
    color: Colors.textMuted,
  },
  tabLabelFocused: {
    color: Colors.accent,
    fontFamily: "Inter_600SemiBold",
  },
});
