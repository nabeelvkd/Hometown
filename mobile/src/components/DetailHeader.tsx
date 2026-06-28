import { Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import { palette } from '../theme';

/** Top bar with a back button for pushed (non-tab) screens. */
export function DetailHeader({
  title,
  subtitle,
  onBack,
}: {
  title: string;
  subtitle?: string;
  onBack: () => void;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={{ paddingTop: insets.top + 8 }}
      className="flex-row items-center gap-2 border-b border-[#EEF1F5] bg-white px-3 pb-3">
      <TouchableOpacity
        onPress={onBack}
        hitSlop={10}
        className="h-10 w-10 items-center justify-center rounded-full bg-[#F5F7F9]">
        <ChevronLeft size={24} color={palette.text} />
      </TouchableOpacity>
      <View className="flex-1">
        <Text className="text-[18px] font-extrabold text-[#111827]" numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? <Text className="text-[12px] text-[#6B7280]">{subtitle}</Text> : null}
      </View>
    </View>
  );
}
