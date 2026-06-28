import { Text, TouchableOpacity, View } from 'react-native';
import { ChevronRight, Star } from 'lucide-react-native';
import { palette } from '../theme';

export function SectionHeader({ title, onViewAll }: { title: string; onViewAll?: () => void }) {
  return (
    <View className="mb-3 flex-row items-center justify-between">
      <Text className="text-[19px] font-extrabold text-[#111827]">{title}</Text>
      {onViewAll ? (
        <TouchableOpacity className="flex-row items-center" onPress={onViewAll} hitSlop={8}>
          <Text className="mr-0.5 text-[13px] font-bold text-[#16A34A]">View all</Text>
          <ChevronRight size={15} color={palette.primary} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

export function RatingPill({ value }: { value: number }) {
  return (
    <View className="flex-row items-center rounded-lg border border-[#EEF1F5] bg-white px-1.5 py-0.5">
      <Star size={11} color={palette.star} fill={palette.star} />
      <Text className="ml-0.5 text-[11px] font-bold text-[#111827]">{value.toFixed(1)}</Text>
    </View>
  );
}
