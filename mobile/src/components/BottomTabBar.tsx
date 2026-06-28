import { Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Heart, Home, Plus, Search, User } from 'lucide-react-native';
import { palette } from '../theme';

export type TabKey = 'home' | 'search' | 'favorites' | 'profile';

const TABS: { key: TabKey; label: string; Icon: typeof Home }[] = [
  { key: 'home', label: 'Home', Icon: Home },
  { key: 'search', label: 'Search', Icon: Search },
  { key: 'favorites', label: 'Favorites', Icon: Heart },
  { key: 'profile', label: 'Profile', Icon: User },
];

export function BottomTabBar({
  active,
  onChange,
  onAdd,
}: {
  active: TabKey;
  onChange: (key: TabKey) => void;
  onAdd?: () => void;
}) {
  const insets = useSafeAreaInsets();
  // Render Home, Search, [FAB], Favorites, Profile
  const left = TABS.slice(0, 2);
  const right = TABS.slice(2);

  return (
    <View
      className="flex-row items-start border-t border-[#EEF1F5] bg-white px-2 pt-2.5"
      style={{ paddingBottom: Math.max(insets.bottom, 10) }}>
      {left.map((t) => (
        <Tab key={t.key} tab={t} active={active === t.key} onPress={() => onChange(t.key)} />
      ))}

      {/* Center FAB */}
      <View className="flex-1 items-center">
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={onAdd}
          className="absolute -top-[34px] h-[58px] w-[58px] items-center justify-center rounded-full border-4 border-white bg-[#16A34A]"
          style={fabShadow}>
          <Plus size={30} color="#fff" />
        </TouchableOpacity>
      </View>

      {right.map((t) => (
        <Tab key={t.key} tab={t} active={active === t.key} onPress={() => onChange(t.key)} />
      ))}
    </View>
  );
}

function Tab({
  tab,
  active,
  onPress,
}: {
  tab: { key: TabKey; label: string; Icon: typeof Home };
  active: boolean;
  onPress: () => void;
}) {
  const { Icon, label } = tab;
  const color = active ? palette.primary : palette.textMuted;
  return (
    <TouchableOpacity className="flex-1 items-center" activeOpacity={0.7} onPress={onPress}>
      <Icon size={22} color={color} fill={active ? color : 'transparent'} />
      <Text
        className="mt-0.5 text-[11px]"
        style={{ color, fontWeight: active ? '700' : '500' }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const fabShadow = {
  shadowColor: '#16A34A',
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.35,
  shadowRadius: 10,
  elevation: 6,
};
