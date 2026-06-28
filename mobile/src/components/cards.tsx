import { Image, Text, TouchableOpacity, View } from 'react-native';
import {
  Hammer,
  Megaphone,
  PaintRoller,
  Phone,
  Droplet,
  Zap,
  MapPin,
  ChevronRight,
} from 'lucide-react-native';
import { palette } from '../theme';
import { RatingPill } from './ui';
import { callNumber } from '../lib/helpers';
import { img } from '../lib/img';
import type { Announcement, Business, ServiceSummary } from '../data/mock';

const SERVICE_ICON = {
  electrician: Zap,
  plumber: Droplet,
  carpenter: Hammer,
  painter: PaintRoller,
} as const;

/** Popular-services summary tile (icon bubble, rating, label, expert count). */
export function ServiceCard({ item, onPress }: { item: ServiceSummary; onPress?: () => void }) {
  const Icon = SERVICE_ICON[item.icon];
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      className="w-[150px] rounded-2xl border border-[#EEF1F5] bg-white p-3"
      style={cardShadow}>
      <View className="mb-3 flex-row items-center justify-between">
        <View
          className="h-11 w-11 items-center justify-center rounded-xl"
          style={{ backgroundColor: item.tint + '22' }}>
          <Icon size={22} color={item.tint} />
        </View>
        <RatingPill value={item.rating} />
      </View>
      <Text className="text-[15px] font-bold text-[#111827]">{item.label}</Text>
      <Text className="mt-0.5 text-[13px] text-[#6B7280]">{item.experts} Experts</Text>
    </TouchableOpacity>
  );
}

/** Business card with image header. Carousel width by default; full-width in lists. */
export function BusinessCard({
  item,
  onPress,
  fullWidth,
}: {
  item: Business;
  onPress?: () => void;
  fullWidth?: boolean;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      className={`${fullWidth ? 'w-full' : 'w-[200px]'} overflow-hidden rounded-2xl border border-[#EEF1F5] bg-white`}
      style={cardShadow}>
      <Image source={{ uri: img(item.photos[0], 'card') }} className="h-[120px] w-full bg-[#F1F5F9]" />
      <View className="p-3">
        <View className="flex-row items-center justify-between">
          <Text className="flex-1 text-[15px] font-bold text-[#111827]" numberOfLines={1}>
            {item.name}
          </Text>
          {item.acceptsOrders && (
            <View className="ml-2 rounded-full bg-[#E7F6EC] px-2 py-0.5">
              <Text className="text-[10px] font-bold text-[#15803D]">Orders</Text>
            </View>
          )}
        </View>
        <Text className="mt-0.5 text-[13px] text-[#6B7280]">{item.categoryLabel}</Text>

        <View className="mt-2 flex-row items-center justify-between">
          <View className="flex-row items-center">
            <RatingPill value={item.rating} />
            <Text className="ml-1 text-[12px] text-[#6B7280]">({item.reviews})</Text>
          </View>
          <TouchableOpacity
            className="h-9 w-9 items-center justify-center rounded-full bg-[#E7F6EC]"
            onPress={() => callNumber(item.phone)}
            hitSlop={8}>
            <Phone size={16} color={palette.primary} />
          </TouchableOpacity>
        </View>

        {item.distance ? (
          <View className="mt-1.5 flex-row items-center">
            <MapPin size={12} color={palette.textMuted} />
            <Text className="ml-1 text-[12px] text-[#6B7280]">{item.distance}</Text>
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

/** Announcement banner card. */
export function AnnouncementCard({ item, onPress }: { item: Announcement; onPress?: () => void }) {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      className="flex-row items-center rounded-2xl border border-[#D6EEDD] bg-[#EAF7EF] p-3">
      <View className="mr-3 h-11 w-11 items-center justify-center rounded-full bg-[#16A34A1F]">
        <Megaphone size={20} color={palette.announce} />
      </View>
      <View className="flex-1">
        <Text className="text-[15px] font-bold text-[#111827]" numberOfLines={2}>
          {item.title}
        </Text>
        <Text className="mt-0.5 text-[13px] text-[#6B7280]" numberOfLines={2}>
          {item.body}
        </Text>
        <Text className="mt-1.5 text-[11px] text-[#9CA3AF]">{item.time}</Text>
      </View>
      <ChevronRight size={18} color={palette.textMuted} />
    </TouchableOpacity>
  );
}

const cardShadow = {
  shadowColor: '#0B1F16',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.06,
  shadowRadius: 6,
  elevation: 2,
};
