import { Dimensions, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import {
  BadgeCheck,
  Clock,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
  Star,
} from 'lucide-react-native';
import { palette } from '../theme';
import { callNumber, openMap, openDirections, openWhatsApp } from '../lib/helpers';
import { img } from '../lib/img';
import { DetailHeader } from '../components/DetailHeader';
import { MiniMap } from '../components/MiniMap';
import type { Business } from '../data/mock';

const { width } = Dimensions.get('window');

export function BusinessDetailScreen({ business, onBack }: { business: Business; onBack: () => void }) {
  const b = business;
  const hasGeo = typeof b.lat === 'number' && typeof b.lng === 'number';
  return (
    <View className="flex-1 bg-white">
      <DetailHeader title={b.name} subtitle={b.categoryLabel} onBack={onBack} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 110 }}>
        {/* Photo gallery */}
        <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
          {b.photos.map((uri, i) => (
            <Image key={i} source={{ uri: img(uri, 'gallery') }} style={{ width, height: 240 }} className="bg-[#F1F5F9]" />
          ))}
        </ScrollView>

        <View className="p-5">
          {/* Title + rating */}
          <View className="flex-row items-start justify-between">
            <View className="flex-1">
              <View className="flex-row items-center">
                <Text className="text-[22px] font-extrabold text-[#111827]">{b.name}</Text>
                {b.verified && <BadgeCheck size={20} color={palette.primary} style={{ marginLeft: 6 }} />}
              </View>
              <Text className="mt-0.5 text-[14px] text-[#6B7280]">{b.categoryLabel}</Text>
            </View>
            <View className="flex-row items-center rounded-lg bg-[#FFF7E6] px-2 py-1">
              <Star size={14} color={palette.star} fill={palette.star} />
              <Text className="ml-1 text-[14px] font-bold text-[#111827]">{b.rating.toFixed(1)}</Text>
              <Text className="ml-1 text-[12px] text-[#9CA3AF]">({b.reviews})</Text>
            </View>
          </View>

          {/* Order availability banner */}
          {b.acceptsOrders && (
            <View className="mt-4 flex-row items-center rounded-xl bg-[#E7F6EC] p-3">
              <MessageCircle size={18} color={palette.primary} />
              <Text className="ml-2 flex-1 text-[13px] font-semibold text-[#15803D]">
                Online ordering available via WhatsApp
              </Text>
            </View>
          )}

          {/* About */}
          <Text className="mt-5 text-[16px] font-bold text-[#111827]">About</Text>
          <Text className="mt-1 text-[14px] leading-[21px] text-[#4B5563]">{b.description}</Text>

          {/* Working hours */}
          <View className="mt-5 flex-row items-start">
            <Clock size={18} color={palette.textMuted} />
            <View className="ml-3 flex-1">
              <Text className="text-[14px] font-bold text-[#111827]">Working hours</Text>
              <Text className="mt-0.5 text-[14px] text-[#4B5563]">{b.workingHours}</Text>
            </View>
          </View>

          {/* Contact */}
          <View className="mt-4 flex-row items-start">
            <Phone size={18} color={palette.textMuted} />
            <View className="ml-3 flex-1">
              <Text className="text-[14px] font-bold text-[#111827]">Contact</Text>
              <Text className="mt-0.5 text-[14px] text-[#4B5563]">{b.phone}</Text>
            </View>
          </View>

          {/* Location / map */}
          <Text className="mt-6 text-[16px] font-bold text-[#111827]">Location</Text>
          <TouchableOpacity
            activeOpacity={0.9}
            disabled={!hasGeo}
            onPress={() => hasGeo && openMap(b.lat!, b.lng!, b.name)}
            className="mt-2">
            {hasGeo && (
              <View className="h-[170px] overflow-hidden rounded-2xl border border-[#EEF1F5]">
                <MiniMap lat={b.lat!} lng={b.lng!} />
                <View className="absolute bottom-2 right-2 flex-row items-center rounded-full bg-white px-3 py-1.5" style={mapPillShadow}>
                  <Navigation size={13} color={palette.primary} />
                  <Text className="ml-1 text-[12px] font-bold text-[#15803D]">Open in Google Maps</Text>
                </View>
              </View>
            )}
            <View className="mt-2 flex-row items-start">
              <MapPin size={16} color={palette.textMuted} />
              <Text className="ml-2 flex-1 text-[14px] text-[#4B5563]">{b.address}</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Sticky action bar */}
      <View className="absolute bottom-0 left-0 right-0 flex-row gap-3 border-t border-[#EEF1F5] bg-white px-5 pb-7 pt-3">
        <TouchableOpacity
          onPress={() => callNumber(b.phone)}
          className="flex-1 flex-row items-center justify-center rounded-xl border border-[#16A34A] py-3">
          <Phone size={18} color={palette.primary} />
          <Text className="ml-2 text-[15px] font-bold text-[#15803D]">Call</Text>
        </TouchableOpacity>

        {b.acceptsOrders && b.whatsapp ? (
          <TouchableOpacity
            onPress={() => openWhatsApp(b.whatsapp!, `Hi ${b.name}, I'd like to place an order.`)}
            className="flex-[1.4] flex-row items-center justify-center rounded-xl bg-[#16A34A] py-3">
            <MessageCircle size={18} color="#fff" />
            <Text className="ml-2 text-[15px] font-bold text-white">Order on WhatsApp</Text>
          </TouchableOpacity>
        ) : hasGeo ? (
          <TouchableOpacity
            onPress={() => openDirections(b.lat!, b.lng!)}
            className="flex-[1.4] flex-row items-center justify-center rounded-xl bg-[#16A34A] py-3">
            <Navigation size={18} color="#fff" />
            <Text className="ml-2 text-[15px] font-bold text-white">Directions</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

const mapPillShadow = {
  shadowColor: '#0B1F16',
  shadowOpacity: 0.12,
  shadowRadius: 6,
  shadowOffset: { width: 0, height: 2 },
  elevation: 3,
};
