import type { PropsWithChildren } from "react";
import { ActivityIndicator, Pressable, Text, type PressableProps } from "react-native";
import { clsx } from "clsx";
import { Colors } from "@/constants/Colors";

type Variant = "primary" | "secondary" | "ghost" | "destructive";
type Props = PropsWithChildren<{
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}> & Pick<PressableProps, "onPress" | "accessibilityLabel" | "testID">;

export function Button({
  children, variant = "primary", loading = false, disabled = false,
  className, onPress, accessibilityLabel, testID
}: Props) {
  const unavailable = disabled || loading;
  const bg = variant === "primary" ? Colors.crimson
    : variant === "destructive" ? "#7F1D1D" : "transparent";
  const borderColor = variant === "secondary" ? Colors.grayMid : bg;
  const textColor = variant === "ghost" ? Colors.crimson : Colors.white;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: unavailable, busy: loading }}
      testID={testID}
      disabled={unavailable}
      onPress={onPress}
      className={clsx("min-h-12 flex-row items-center justify-center rounded-xl px-5", className)}
      style={({ pressed }) => ({
        backgroundColor: bg,
        borderColor,
        borderWidth: variant === "secondary" ? 1 : 0,
        opacity: unavailable ? 0.55 : pressed ? 0.86 : 1,
        transform: [{ scale: pressed && !unavailable ? 0.98 : 1 }]
      })}
    >
      {loading ? <ActivityIndicator color={textColor} /> : (
        <Text className="font-semibold" style={{ color: textColor }}>{children}</Text>
      )}
    </Pressable>
  );
}
