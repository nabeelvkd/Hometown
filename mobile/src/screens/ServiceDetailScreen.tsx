import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { BadgeCheck, Briefcase, MessageCircle, Phone, Star } from 'lucide-react-native';
import { palette } from '../theme';
import { callNumber, openWhatsApp } from '../lib/helpers';
import { img } from '../lib/img';
import { DetailHeader } from '../components/DetailHeader';
import type { ServiceProvider } from '../data/mock';

export function ServiceDetailScreen({
  provider,
  onBack,
}: {
  provider: ServiceProvider;
  onBack: () => void;
}) {
  const p = provider;
  return (
    <View className="flex-1 bg-white">
      <DetailHeader title={p.name} subtitle={p.categoryLabel} onBack={onBack} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 110 }}>
        {/* Photo of the person / service */}
        <View className="items-center bg-[#EAF3EC] py-6">
          <Image source={{ uri: img(p.photo, 'avatar') }} className="h-32 w-32 rounded-full border-4 border-white bg-[#F1F5F9]" />
          <View className="mt-3 flex-row items-center">
            <Text className="text-[20px] font-extrabold text-[#111827]">{p.name}</Text>
            {p.verified && <BadgeCheck size={18} color={palette.primary} style={{ marginLeft: 6 }} />}
          </View>
          <Text className="mt-0.5 text-[14px] text-[#6B7280]">{p.categoryLabel}</Text>
        </View>

        <View className="p-5">
          {/* Stats */}
          <View className="flex-row gap-3">
            <View className="flex-1 items-center rounded-2xl border border-[#EEF1F5] bg-white py-3">
              <View className="flex-row items-center">
                <Star size={16} color={palette.star} fill={palette.star} />
                <Text className="ml-1 text-[18px] font-extrabold text-[#111827]">{p.rating.toFixed(1)}</Text>
              </View>
              <Text className="mt-0.5 text-[12px] text-[#6B7280]">{p.reviews} reviews</Text>
            </View>
            <View className="flex-1 items-center rounded-2xl border border-[#EEF1F5] bg-white py-3">
              <View className="flex-row items-center">
                <Briefcase size={16} color={palette.primary} />
                <Text className="ml-1 text-[18px] font-extrabold text-[#111827]">{p.experienceYears}</Text>
              </View>
              <Text className="mt-0.5 text-[12px] text-[#6B7280]">years exp.</Text>
            </View>
          </View>

          <Text className="mt-6 text-[16px] font-bold text-[#111827]">About</Text>
          <Text className="mt-1 text-[14px] leading-[21px] text-[#4B5563]">{p.about}</Text>

          <View className="mt-5 flex-row items-start">
            <Phone size={18} color={palette.textMuted} />
            <View className="ml-3 flex-1">
              <Text className="text-[14px] font-bold text-[#111827]">Contact</Text>
              <Text className="mt-0.5 text-[14px] text-[#4B5563]">{p.phone}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 flex-row gap-3 border-t border-[#EEF1F5] bg-white px-5 pb-7 pt-3">
        <TouchableOpacity
          onPress={() => callNumber(p.phone)}
          className="flex-1 flex-row items-center justify-center rounded-xl bg-[#16A34A] py-3">
          <Phone size={18} color="#fff" />
          <Text className="ml-2 text-[15px] font-bold text-white">Call</Text>
        </TouchableOpacity>
        {p.whatsapp && (
          <TouchableOpacity
            onPress={() => openWhatsApp(p.whatsapp!, `Hi ${p.name}, I need ${p.categoryLabel.toLowerCase()} help.`)}
            className="flex-1 flex-row items-center justify-center rounded-xl border border-[#16A34A] py-3">
            <MessageCircle size={18} color={palette.primary} />
            <Text className="ml-2 text-[15px] font-bold text-[#15803D]">WhatsApp</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
