import React, { memo, useCallback, useEffect, useRef } from "react";
import { Dimensions, FlatList, StyleSheet, Text, View } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  SharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { Colors, FontSize, Radius } from "../constants/theme";

const { width: SCREEN_W } = Dimensions.get("window");
const ITEM_HEIGHT = 48;
const VISIBLE_ITEMS = 5;
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

interface ScrollPickerProps {
  data: string[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList<string>);

const PickerItem = memo(function PickerItem({
  item,
  index,
  scrollY,
  totalItems,
}: {
  item: string;
  index: number;
  scrollY: SharedValue<number>;
  totalItems: number;
}) {
  const animatedStyle = useAnimatedStyle(() => {
    const center = scrollY.value / ITEM_HEIGHT;
    const distance = Math.abs(index - center);
    const opacity = interpolate(
      distance,
      [0, 2],
      [1, 0.25],
      Extrapolation.CLAMP,
    );
    const scale = interpolate(
      distance,
      [0, 1.5],
      [1, 0.82],
      Extrapolation.CLAMP,
    );
    return { opacity, transform: [{ scale }] };
  });

  return (
    <Animated.View style={[styles.item, animatedStyle]}>
      <Text style={styles.itemText}>{item}</Text>
    </Animated.View>
  );
});

export const ScrollPicker = memo(function ScrollPicker({
  data,
  selectedIndex,
  onSelect,
}: ScrollPickerProps) {
  const scrollY = useSharedValue(selectedIndex * ITEM_HEIGHT);
  const listRef = useRef<FlatList<string>>(null);

  useEffect(() => {
    scrollY.value = selectedIndex * ITEM_HEIGHT;
    listRef.current?.scrollToOffset({
      offset: selectedIndex * ITEM_HEIGHT,
      animated: false,
    });
  }, [selectedIndex, scrollY]);

  // Pad data so first and last items can center
  const paddedData = [...Array(2).fill(""), ...data, ...Array(2).fill("")];

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollY.value = e.contentOffset.y;
    },
  });

  const handleMomentumEnd = useCallback(
    (e: { nativeEvent: { contentOffset: { y: number } } }) => {
      const idx = Math.round(e.nativeEvent.contentOffset.y / ITEM_HEIGHT);
      const clamped = Math.max(0, Math.min(idx, data.length - 1));
      onSelect(clamped);
    },
    [data.length, onSelect],
  );

  const renderItem = useCallback(
    ({ item, index }: { item: string; index: number }) => (
      <PickerItem
        item={item}
        index={index - 2} // offset for padding
        scrollY={scrollY}
        totalItems={data.length}
      />
    ),
    [scrollY, data.length],
  );

  const keyExtractor = useCallback((_: string, i: number) => i.toString(), []);

  return (
    <View style={styles.container}>
      {/* Center highlight */}
      <View style={styles.highlight} pointerEvents="none" />

      <AnimatedFlatList
        ref={listRef}
        data={paddedData}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        onMomentumScrollEnd={handleMomentumEnd}
        initialScrollIndex={selectedIndex}
        getItemLayout={(_, index) => ({
          length: ITEM_HEIGHT,
          offset: ITEM_HEIGHT * index,
          index,
        })}
        style={styles.list}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    height: PICKER_HEIGHT,
    width: 80,
    position: "relative",
    overflow: "hidden",
  },
  list: {
    flex: 1,
  },
  item: {
    height: ITEM_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
  },
  itemText: {
    fontSize: FontSize.xxl,
    fontFamily: "Inter_600SemiBold",
    color: Colors.text,
  },
  highlight: {
    position: "absolute",
    top: ITEM_HEIGHT * 2,
    left: 0,
    right: 0,
    height: ITEM_HEIGHT,
    backgroundColor: Colors.accentMuted,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.accent + "44",
    zIndex: 1,
  },
});

export { ITEM_HEIGHT, PICKER_HEIGHT };
