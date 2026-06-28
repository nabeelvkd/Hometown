import { useEffect, useState } from 'react';
import {
  ImageBackground,
  Image,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Bell,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  CloudSun,
  LayoutGrid,
  MapPin,
  Menu,
  Mic,
  Search,
} from 'lucide-react-native';
import { palette } from '../theme';
import { todayLabel } from '../lib/helpers';
import { useVillage } from '../store/village';
import { useProfile } from '../store/profile';
import { useNotifications } from '../store/notifications';
import { AdBanner } from '../components/AdBanner';
import { nattileApi } from '../api/nattile';
import { categoryIcon } from '../components/categoryIcons';
import { img } from '../lib/img';
import { DEFAULT_CATEGORIES, type HomeCategoryItem } from '../data/mock';

const HERO_IMAGE = 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=900&q=70';

const VISIBLE_LIMIT = 8;

// In-memory caches (per village) so re-opening the Home tab shows the real
// categories/hero immediately instead of flashing the default order each time.
const catCache = new Map<string, HomeCategoryItem[]>();
const heroCache = new Map<string, string | undefined>();

export function HomeScreen({
  onCategory,
  onSearchPress,
  onChangeLocation,
  onNotifications,
}: {
  onCategory?: (cat: HomeCategoryItem) => void;
  onSearchPress?: () => void;
  onChangeLocation?: () => void;
  onNotifications?: () => void;
}) {
  const insets = useSafeAreaInsets();
  const { village } = useVillage();
  const villageKey = village?.id ?? '';
  const { profile } = useProfile();
  const { unread, refresh } = useNotifications();
  const [refreshing, setRefreshing] = useState(false);
  const [heroUri, setHeroUri] = useState<string | undefined>(() => heroCache.get(villageKey));
  const [cats, setCats] = useState<HomeCategoryItem[]>(
    () => catCache.get(villageKey) ?? DEFAULT_CATEGORIES
  );
  const [expanded, setExpanded] = useState(false);

  const name = village?.name ?? 'your village';

  useEffect(() => {
    let active = true;
    // Seed from cache first so switching back to Home doesn't flash the default
    // order; the network results below update the cache + UI when they arrive.
    setCats(catCache.get(villageKey) ?? DEFAULT_CATEGORIES);
    setHeroUri(heroCache.get(villageKey));

    nattileApi.getVillageHero(village?.id).then((uri) => {
      heroCache.set(villageKey, uri);
      if (active) setHeroUri(uri);
    });
    nattileApi.listHomeCategories(village?.id).then((list) => {
      catCache.set(villageKey, list);
      if (active) {
        setCats(list);
        setExpanded(false);
      }
    });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [village?.id]);

  // Re-check unread notices each time the Home tab is opened.
  useEffect(() => {
    refresh();
  }, [refresh]);

  const hasMore = cats.length > VISIBLE_LIMIT;
  // Collapsed shows 7 tiles + a "More" tile (8 total); expanded shows all + "See less".
  const visible = !hasMore || expanded ? cats : cats.slice(0, VISIBLE_LIMIT - 1);

  const openCategory = (cat: HomeCategoryItem) => onCategory?.(cat);

  return (
    <ScrollView
      className="flex-1 bg-[#F4F7F5]"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 28 }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            setTimeout(() => setRefreshing(false), 500);
          }}
          tintColor="#fff"
        />
      }>
      {/* ---------- Hero ---------- */}
      <ImageBackground
        source={{ uri: img(heroUri, 'hero') ?? HERO_IMAGE }}
        style={{ paddingTop: insets.top + 10 }}
        imageStyle={{ resizeMode: 'cover' }}
        className="bg-[#15803D] px-5 pb-10">
        <View className="absolute inset-0 bg-black/45" />

        <View className="flex-row items-center justify-between">
          <TouchableOpacity hitSlop={8}>
            <Menu size={26} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity className="flex-1 ml-2" onPress={onChangeLocation} activeOpacity={0.8}>
            <View className="flex-row items-center">
              <MapPin size={15} color="#fff" />
              <Text className="ml-1 text-[17px] font-extrabold text-white">{name}</Text>
              <ChevronDown size={15} color="#fff" />
            </View>
            <Text className="text-[12px] ml-1 text-white/80">
              {village ? `${village.area}, ${village.district}` : 'Tap to choose'}
            </Text>
          </TouchableOpacity>

          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={onNotifications}
              className="h-[38px] w-[38px] items-center justify-center rounded-full bg-white/20"
              hitSlop={6}>
              <Bell size={19} color="#fff" />
              {unread > 0 && (
                <View className="absolute right-1.5 top-1 min-w-[16px] items-center justify-center rounded-full border border-[#15803D] bg-[#EF4444] px-1">
                  <Text className="text-[10px] font-extrabold text-white">{unread > 9 ? '9+' : unread}</Text>
                </View>
              )}
            </TouchableOpacity>
            {profile.avatar ? (
              <Image
                source={{ uri: img(profile.avatar, 'avatar') }}
                className="ml-2.5 h-[40px] w-[40px] rounded-full border-2 border-white/70 bg-white/20"
              />
            ) : (
              <View className="ml-2.5 h-[40px] w-[40px] items-center justify-center rounded-full border-2 border-white/70 bg-white/20">
                <Text className="text-[15px] font-extrabold text-white">
                  {(profile.name ?? '?').trim().charAt(0).toUpperCase() || '?'}
                </Text>
              </View>
            )}
          </View>
        </View>

        <View className="mt-6 flex-row items-end justify-between">
          <View className="flex-1">
            {/* <Text className="text-[15px] font-medium text-white/90">{greeting()} 👋</Text> */}
            <Text className="mt-1 text-[18px] font-extrabold text-white">
              Welcome to
            </Text>
            <Text className="text-[27px] font-extrabold text-white">
               {name}
            </Text>
          </View>
          <View className="items-center rounded-2xl bg-white/15 px-3 py-2">
            <CloudSun size={22} color="#FFD24A" />
            <Text className="mt-0.5 text-[15px] font-bold text-white">26°</Text>
          </View>
        </View>
        <Text className="mt-1 text-[12px] text-white/70">{todayLabel()} · Partly cloudy</Text>

        <View className="h-5" />
      </ImageBackground>

      {/* ---------- Ads banner (overlaps hero) ---------- */}
      <View className="-mt-7">
        <AdBanner />
      </View>

      {/* ---------- Search ---------- */}
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onSearchPress}
        className="mx-5 mt-5 flex-row items-center rounded-full bg-white py-3 pl-4 pr-2"
        style={searchShadow}>
        <Search size={20} color={palette.textMuted} />
        <TextInput
          editable={false}
          pointerEvents="none"
          placeholder="Search shops, services, contacts…"
          placeholderTextColor={palette.textMuted}
          className="ml-3 flex-1 p-0 text-[15px] text-[#111827]"
        />
        <View className="h-[38px] w-[38px] items-center justify-center rounded-full bg-[#16A34A]">
          <Mic size={18} color="#fff" />
        </View>
      </TouchableOpacity>

      {/* ---------- Categories (4-per-row, single card) ---------- */}
      <View className="mt-6 px-5">
        <View className="mb-3 flex-row items-center justify-between">
          <Text className="text-[19px] font-extrabold text-[#111827]">Categories</Text>
          {hasMore && (
            <TouchableOpacity
              className="flex-row items-center"
              hitSlop={8}
              onPress={() => setExpanded((v) => !v)}>
              <Text className="mr-0.5 text-[12px] font-bold text-[#16A34A]">
                {expanded ? 'See less' : 'View all'}
              </Text>
              {expanded ? (
                <ChevronUp size={15} color={palette.primary} />
              ) : (
                <ChevronRight size={15} color={palette.primary} />
              )}
            </TouchableOpacity>
          )}
        </View>

        <View className="flex-row flex-wrap rounded-2xl border items-center border-[#EEF1F5] bg-white px-2 py-4" style={cardShadow}>
          {visible.map((cat) => {
            const Icon = categoryIcon(cat.icon);
            return (
              <TouchableOpacity
                key={cat.key}
                activeOpacity={0.85}
                onPress={() => openCategory(cat)}
                className="mb-5 w-[21%] items-center px-1 ml-3 mt-2">
                <View
                  className="h-16 w-16 items-center justify-center rounded-xl"
                  style={{ backgroundColor: cat.color + '1A' }}>
                  <Icon size={24} color={cat.color} />
                </View>
                <Text className="mt-2 text-[10px] text-[#111827]" numberOfLines={1}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}

          {hasMore && (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setExpanded((v) => !v)}
              className="mb-5 w-[21%] items-center px-1 ml-3 mt-2">
              <View className="h-16 w-16 items-center justify-center rounded-xl bg-[#6B72801A]">
                {expanded ? (
                  <ChevronUp size={24} color="#6B7280" />
                ) : (
                  <LayoutGrid size={24} color="#6B7280" />
                )}
              </View>
              <Text className="mt-2 text-[10px] text-[#111827]" numberOfLines={1}>
                {expanded ? 'See less' : 'More'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const searchShadow = {
  shadowColor: '#0B1F16',
  shadowOffset: { width: 0, height: 3 },
  shadowOpacity: 0.05,
  shadowRadius: 10,
  elevation: 2,
};

const cardShadow = {
  shadowColor: '#0B1F16',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.01,
  shadowRadius: 1,
  elevation: 1,
};
