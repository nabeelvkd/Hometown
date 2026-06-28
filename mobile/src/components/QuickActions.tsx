import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Megaphone, ShieldPlus, Store, Bus, Wrench } from 'lucide-react-native';
import { palette } from '../theme';

type Item = {
  key: string;
  label: string;
  sub: string;
  Icon: typeof Store;
  color: string;
};

const ITEMS: Item[] = [
  { key: 'businesses', label: 'Businesses', sub: 'Shops & Stores', Icon: Store, color: palette.business },
  { key: 'services', label: 'Services', sub: 'Find Experts', Icon: Wrench, color: palette.service },
  { key: 'emergency', label: 'Emergency', sub: 'Important Contacts', Icon: ShieldPlus, color: palette.emergency },
  { key: 'transport', label: 'Transport', sub: 'Bus & Travel Info', Icon: Bus, color: palette.transport },
  { key: 'announcements', label: 'Announcements', sub: 'Local Updates', Icon: Megaphone, color: palette.announce },
];

export function QuickActions({ onPress }: { onPress?: (key: string) => void }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}>
      {ITEMS.map(({ key, label, sub, Icon, color }) => (
        <TouchableOpacity
          key={key}
          activeOpacity={0.85}
          onPress={() => onPress?.(key)}
          className="w-[96px] items-center rounded-2xl border border-[#EEF1F5] bg-white px-2 py-3"
          style={tileShadow}>
          <View
            className="mb-2 h-[50px] w-[50px] items-center justify-center rounded-xl"
            style={{ backgroundColor: color + '1A' }}>
            <Icon size={26} color={color} />
          </View>
          <Text className="text-[13px] font-bold text-[#111827]">{label}</Text>
          <Text className="mt-0.5 text-center text-[10px] text-[#6B7280]">{sub}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const tileShadow = {
  shadowColor: '#0B1F16',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.05,
  shadowRadius: 5,
  elevation: 2,
};
