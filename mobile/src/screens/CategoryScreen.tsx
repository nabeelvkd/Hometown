import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Linking, Text, TouchableOpacity, View } from 'react-native';
import { ChevronRight, MessageCircle, Phone } from 'lucide-react-native';
import { palette } from '../theme';
import { callNumber, openWhatsApp } from '../lib/helpers';
import { img } from '../lib/img';
import { categoryIcon } from '../components/categoryIcons';
import { DetailHeader } from '../components/DetailHeader';
import { nattileApi } from '../api/nattile';
import type { CategoryEntryItem, HomeCategoryItem } from '../data/mock';

export function CategoryScreen({
  category,
  onBack,
}: {
  category: HomeCategoryItem;
  onBack: () => void;
}) {
  const [items, setItems] = useState<CategoryEntryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const directory = category.template === 'directory';
  const Icon = categoryIcon(category.icon);

  useEffect(() => {
    setLoading(true);
    nattileApi
      .listCategoryEntries(category.id)
      .then(setItems)
      .finally(() => setLoading(false));
  }, [category.id]);

  return (
    <View className="flex-1 bg-[#F4F7F5]">
      <DetailHeader title={category.label} subtitle={category.sub} onBack={onBack} />
      <FlatList
        data={items}
        keyExtractor={(e) => e.id}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        renderItem={({ item }) =>
          directory ? (
            // Directory: avatar + name + call/whatsapp
            <View
              className="flex-row items-center rounded-2xl border border-[#EEF1F5] bg-white p-3"
              style={cardShadow}>
              {item.photo ? (
                <Image source={{ uri: img(item.photo, 'avatar') }} className="h-16 w-16 rounded-xl bg-[#F1F5F9]" />
              ) : (
                <View className="h-16 w-16 items-center justify-center rounded-xl" style={{ backgroundColor: category.color + '1A' }}>
                  <Icon size={26} color={category.color} />
                </View>
              )}
              <View className="ml-3 flex-1">
                <Text className="text-[15px] font-bold text-[#111827]">{item.title}</Text>
                {item.subtitle ? <Text className="mt-0.5 text-[13px] text-[#6B7280]">{item.subtitle}</Text> : null}
                {item.description ? (
                  <Text className="mt-0.5 text-[12px] text-[#9CA3AF]" numberOfLines={2}>{item.description}</Text>
                ) : null}
              </View>
              {item.phone ? (
                <TouchableOpacity
                  onPress={() => callNumber(item.phone!)}
                  className="ml-1 h-10 w-10 items-center justify-center rounded-full bg-[#E7F6EC]">
                  <Phone size={18} color={palette.primary} />
                </TouchableOpacity>
              ) : null}
              {item.whatsapp ? (
                <TouchableOpacity
                  onPress={() => openWhatsApp(item.whatsapp!)}
                  className="ml-2 h-10 w-10 items-center justify-center rounded-full bg-[#E7F6EC]">
                  <MessageCircle size={18} color={palette.primary} />
                </TouchableOpacity>
              ) : null}
            </View>
          ) : (
            // Places: banner image + title + details (+ optional link)
            <TouchableOpacity
              activeOpacity={item.link ? 0.9 : 1}
              onPress={() => item.link && Linking.openURL(item.link).catch(() => undefined)}
              className="overflow-hidden rounded-2xl border border-[#EEF1F5] bg-white"
              style={cardShadow}>
              {item.photo ? (
                <Image source={{ uri: img(item.photo, 'gallery') }} className="h-[150px] w-full bg-[#F1F5F9]" />
              ) : null}
              <View className="p-3">
                <View className="flex-row items-center justify-between">
                  <Text className="flex-1 text-[16px] font-bold text-[#111827]">{item.title}</Text>
                  {item.link ? <ChevronRight size={18} color={palette.textMuted} /> : null}
                </View>
                {item.subtitle ? <Text className="mt-0.5 text-[13px] text-[#6B7280]">{item.subtitle}</Text> : null}
                {item.description ? (
                  <Text className="mt-1 text-[13px] leading-[19px] text-[#4B5563]">{item.description}</Text>
                ) : null}
              </View>
            </TouchableOpacity>
          )
        }
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator className="mt-10" color={palette.primary} />
          ) : (
            <Text className="mt-10 text-center text-[#6B7280]">Nothing here yet.</Text>
          )
        }
      />
    </View>
  );
}

const cardShadow = {
  shadowColor: '#0B1F16',
  shadowOpacity: 0.05,
  shadowRadius: 5,
  shadowOffset: { width: 0, height: 2 },
  elevation: 2,
};
