import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import {
  BadgeCheck,
  Camera,
  Car,
  Check,
  ChevronRight,
  Globe,
  Heart,
  HelpCircle,
  Info,
  MapPin,
  Phone,
  Search,
  Siren,
  Star,
  X,
} from 'lucide-react-native';
import { palette } from '../theme';
import { useVillage } from '../store/village';
import { useProfile } from '../store/profile';
import { callNumber } from '../lib/helpers';
import { img } from '../lib/img';
import { nattileApi, type SearchResults } from '../api/nattile';
import type { Business, ServiceProvider } from '../data/mock';

function Header({ title }: { title: string }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ paddingTop: insets.top + 12 }} className="px-5 pb-2">
      <Text className="text-[26px] font-extrabold text-[#111827]">{title}</Text>
    </View>
  );
}

const EMPTY: SearchResults = { businesses: [], services: [], taxis: [], emergency: [] };

export function SearchScreen({
  onOpenBusiness,
  onOpenService,
}: {
  onOpenBusiness?: (b: Business) => void;
  onOpenService?: (p: ServiceProvider) => void;
}) {
  const { village } = useVillage();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResults>(EMPTY);
  const [loading, setLoading] = useState(false);

  // Debounced search as the user types (min 2 chars).
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults(EMPTY);
      setLoading(false);
      return;
    }
    setLoading(true);
    let active = true;
    const t = setTimeout(() => {
      nattileApi.search(village?.id, q).then((r) => {
        if (active) {
          setResults(r);
          setLoading(false);
        }
      });
    }, 300);
    return () => {
      active = false;
      clearTimeout(t);
    };
  }, [query, village?.id]);

  const total =
    results.businesses.length +
    results.services.length +
    results.taxis.length +
    results.emergency.length;
  const hasQuery = query.trim().length >= 2;

  return (
    <View className="flex-1 bg-white">
      <Header title="Search" />
      <View className="mx-5 flex-row items-center rounded-full border border-[#EEF1F5] bg-[#F5F7F9] px-4 py-3">
        <Search size={20} color={palette.textMuted} />
        <TextInput
          autoFocus
          value={query}
          onChangeText={setQuery}
          placeholder="Search shops, services, taxis…"
          placeholderTextColor={palette.textMuted}
          returnKeyType="search"
          className="ml-3 flex-1 p-0 text-[15px] text-[#111827]"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')} hitSlop={8}>
            <X size={18} color={palette.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Idle prompt */}
      {!hasQuery && (
        <View className="mt-16 items-center px-10">
          <Search size={48} color="#D1D5DB" />
          <Text className="mt-3 text-center text-[15px] text-[#6B7280]">
            Find anything in {village?.name ?? 'your village'} — shops, electricians, taxis and more.
          </Text>
        </View>
      )}

      {hasQuery && (
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
          {loading ? (
            <ActivityIndicator className="mt-10" color={palette.primary} />
          ) : total === 0 ? (
            <View className="mt-16 items-center px-6">
              <Text className="text-[15px] font-semibold text-[#6B7280]">No results for “{query.trim()}”</Text>
              <Text className="mt-1 text-center text-[13px] text-[#9CA3AF]">Try a different name or keyword.</Text>
            </View>
          ) : (
            <>
              {results.businesses.length > 0 && (
                <Section label="Businesses">
                  {results.businesses.map((b) => (
                    <ResultRow
                      key={b.id}
                      photo={b.photos?.[0]}
                      title={b.name}
                      subtitle={b.categoryLabel}
                      verified={b.verified}
                      phone={b.phone}
                      onPress={() => onOpenBusiness?.(b)}
                    />
                  ))}
                </Section>
              )}

              {results.services.length > 0 && (
                <Section label="Services">
                  {results.services.map((p) => (
                    <ResultRow
                      key={p.id}
                      photo={p.photo}
                      round
                      title={p.name}
                      subtitle={`${p.categoryLabel} · ${p.experienceYears} yrs`}
                      verified={p.verified}
                      rating={p.rating}
                      phone={p.phone}
                      onPress={() => onOpenService?.(p)}
                    />
                  ))}
                </Section>
              )}

              {results.taxis.length > 0 && (
                <Section label="Taxis">
                  {results.taxis.map((t) => (
                    <ResultRow
                      key={t.id}
                      photo={t.photo}
                      round
                      kind="taxi"
                      title={t.driverName}
                      subtitle={`${t.vehicleTypeLabel} · ${t.vehicleNumber}`}
                      verified={t.verified}
                      phone={t.phone}
                    />
                  ))}
                </Section>
              )}

              {results.emergency.length > 0 && (
                <Section label="Emergency">
                  {results.emergency.map((e) => (
                    <ResultRow
                      key={e.id}
                      kind="emergency"
                      title={e.name}
                      subtitle={e.typeLabel}
                      phone={e.phone}
                    />
                  ))}
                </Section>
              )}
            </>
          )}
        </ScrollView>
      )}
    </View>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View className="mb-4">
      <Text className="mb-2 text-[13px] font-bold uppercase tracking-wide text-[#9CA3AF]">{label}</Text>
      <View className="gap-2">{children}</View>
    </View>
  );
}

function ResultRow({
  photo,
  title,
  subtitle,
  verified,
  rating,
  phone,
  round,
  kind,
  onPress,
}: {
  photo?: string;
  title: string;
  subtitle: string;
  verified?: boolean;
  rating?: number;
  phone: string;
  round?: boolean;
  kind?: 'taxi' | 'emergency';
  onPress?: () => void;
}) {
  const fallback =
    kind === 'emergency'
      ? { Icon: Siren, bg: '#FEE2E2', color: '#EF4444' }
      : kind === 'taxi'
        ? { Icon: Car, bg: '#FEF3E2', color: '#F59E0B' }
        : { Icon: Search, bg: '#FEF3E2', color: '#F59E0B' };
  return (
    <TouchableOpacity
      activeOpacity={onPress ? 0.85 : 1}
      onPress={onPress}
      className="flex-row items-center rounded-2xl border border-[#EEF1F5] bg-white p-3">
      {photo ? (
        <Image
          source={{ uri: img(photo, 'avatar') }}
          className={`h-14 w-14 bg-[#F1F5F9] ${round ? 'rounded-full' : 'rounded-xl'}`}
        />
      ) : (
        <View
          className={`h-14 w-14 items-center justify-center ${round ? 'rounded-full' : 'rounded-xl'}`}
          style={{ backgroundColor: fallback.bg }}>
          <fallback.Icon size={22} color={fallback.color} />
        </View>
      )}
      <View className="ml-3 flex-1">
        <View className="flex-row items-center">
          <Text className="text-[15px] font-bold text-[#111827]" numberOfLines={1}>
            {title}
          </Text>
          {verified && <BadgeCheck size={15} color={palette.primary} style={{ marginLeft: 4 }} />}
        </View>
        <Text className="mt-0.5 text-[13px] text-[#6B7280]" numberOfLines={1}>
          {subtitle}
        </Text>
        {rating != null && rating > 0 && (
          <View className="mt-1 flex-row items-center">
            <Star size={12} color={palette.star} fill={palette.star} />
            <Text className="ml-1 text-[12px] font-bold text-[#111827]">{rating.toFixed(1)}</Text>
          </View>
        )}
      </View>
      <TouchableOpacity
        onPress={() => callNumber(phone)}
        hitSlop={8}
        className="mr-1 h-10 w-10 items-center justify-center rounded-full bg-[#E7F6EC]">
        <Phone size={18} color={palette.primary} />
      </TouchableOpacity>
      {onPress && <ChevronRight size={18} color={palette.textMuted} />}
    </TouchableOpacity>
  );
}

export function FavoritesScreen() {
  return (
    <View className="flex-1 bg-white">
      <Header title="Favorites" />
      <View className="mt-24 items-center px-10">
        <Heart size={52} color="#D1D5DB" />
        <Text className="mt-3 text-[17px] font-bold text-[#111827]">No favorites yet</Text>
        <Text className="mt-1 text-center text-[15px] leading-[22px] text-[#6B7280]">
          Tap the heart on a shop or service to keep it here for quick access.
        </Text>
      </View>
    </View>
  );
}

export function ProfileScreen({ onChangeLocation }: { onChangeLocation?: () => void }) {
  const { village } = useVillage();
  const { profile, update } = useProfile();

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(profile.name);

  const initials =
    profile.name
      .split(' ')
      .map((p) => p[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || '?';

  const startEdit = () => {
    setName(profile.name);
    setEditing(true);
  };

  const saveName = () => {
    const trimmed = name.trim();
    if (trimmed) update({ name: trimmed });
    setEditing(false);
  };

  const changePhoto = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission needed', 'Allow photo access to change your picture.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (result.canceled || !result.assets?.[0]) return;
    update({ avatar: result.assets[0].uri });
  };

  const rows = [
    { Icon: MapPin, label: 'Change location', onPress: onChangeLocation },
    { Icon: HelpCircle, label: 'Help & support', onPress: () => Alert.alert('Help & support', 'Reach us at support@nattile.app') },
    { Icon: Info, label: 'About OneVillage', onPress: () => Alert.alert('About OneVillage', 'OneVillage · v1.0.0\nYour village, in your pocket.') },
  ];

  return (
    <ScrollView className="flex-1 bg-[#F4F7F5]" contentContainerStyle={{ paddingBottom: 28 }}>
      <Header title="Profile" />

      {/* Identity card */}
      <View className="mx-5 rounded-2xl border border-[#EEF1F5] bg-white p-4">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={changePhoto} activeOpacity={0.8} className="relative">
            {profile.avatar ? (
              <Image source={{ uri: profile.avatar }} className="h-16 w-16 rounded-full bg-[#F1F5F9]" />
            ) : (
              <View className="h-16 w-16 items-center justify-center rounded-full bg-[#E7F6EC]">
                <Text className="text-[20px] font-extrabold text-[#15803D]">{initials}</Text>
              </View>
            )}
            <View className="absolute -bottom-1 -right-1 h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-[#16A34A]">
              <Camera size={13} color="#fff" />
            </View>
          </TouchableOpacity>

          <View className="ml-3 flex-1">
            {editing ? (
              <TextInput
                value={name}
                onChangeText={setName}
                autoFocus
                placeholder="Your name"
                placeholderTextColor={palette.textMuted}
                className="rounded-xl border border-[#D6EEDD] bg-[#F7FBF8] px-3 py-2 text-[16px] font-bold text-[#111827]"
              />
            ) : (
              <Text className="text-[18px] font-extrabold text-[#111827]">{profile.name}</Text>
            )}
            <Text className="mt-0.5 text-[13px] text-[#6B7280]" numberOfLines={1}>
              {village ? village.name : 'Resident'}
            </Text>
          </View>

          {editing ? (
            <View className="flex-row">
              <TouchableOpacity
                onPress={() => setEditing(false)}
                className="mr-2 h-9 w-9 items-center justify-center rounded-full bg-[#F3F4F6]">
                <X size={18} color="#6B7280" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={saveName}
                className="h-9 w-9 items-center justify-center rounded-full bg-[#16A34A]">
                <Check size={18} color="#fff" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity onPress={startEdit} className="rounded-full bg-[#E7F6EC] px-4 py-2">
              <Text className="text-[13px] font-semibold text-[#15803D]">Edit</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Village line */}
        <View className="mt-4 flex-row items-center rounded-xl bg-[#F4F7F5] px-3 py-2.5">
          <MapPin size={16} color={palette.primary} />
          <Text className="ml-2 flex-1 text-[13px] text-[#374151]">
            {village ? `${village.name} · ${village.area}, ${village.district}` : 'No location set'}
          </Text>
        </View>
      </View>

      {/* Language */}
      <View className="mx-5 mt-4 rounded-2xl border border-[#EEF1F5] bg-white p-4">
        <View className="flex-row items-center">
          <Globe size={18} color={palette.primary} />
          <Text className="ml-2 text-[15px] font-bold text-[#111827]">Language</Text>
        </View>
        <View className="mt-3 flex-row gap-2">
          {(['en', 'ml'] as const).map((lang) => {
            const active = profile.language === lang;
            const disabled = lang === 'ml'; // Malayalam coming soon
            return (
              <TouchableOpacity
                key={lang}
                disabled={disabled}
                onPress={() => update({ language: lang })}
                className={`flex-1 items-center rounded-xl border py-2.5 ${
                  disabled
                    ? 'border-[#EEF1F5] bg-[#F5F7F9]'
                    : active
                      ? 'border-[#16A34A] bg-[#E7F6EC]'
                      : 'border-[#EEF1F5] bg-white'
                }`}>
                <Text
                  className={`text-[14px] font-bold ${
                    disabled ? 'text-[#C4C8CE]' : active ? 'text-[#15803D]' : 'text-[#6B7280]'
                  }`}>
                  {lang === 'en' ? 'English' : 'മലയാളം'}
                </Text>
                {disabled && (
                  <Text className="mt-0.5 text-[10px] font-semibold text-[#9CA3AF]">Coming soon</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Menu rows */}
      <View className="mx-5 mt-4 overflow-hidden rounded-2xl border border-[#EEF1F5] bg-white">
        {rows.map((r, i) => (
          <TouchableOpacity
            key={r.label}
            onPress={r.onPress}
            className={`flex-row items-center px-4 py-3.5 ${i < rows.length - 1 ? 'border-b border-[#EEF1F5]' : ''}`}>
            <r.Icon size={20} color={palette.primary} />
            <Text className="ml-3 flex-1 text-[15px] font-medium text-[#111827]">{r.label}</Text>
            <ChevronRight size={18} color={palette.textMuted} />
          </TouchableOpacity>
        ))}
      </View>

      <Text className="mt-5 text-center text-[13px] text-[#9CA3AF]">OneVillage · v1.0.0</Text>
    </ScrollView>
  );
}
