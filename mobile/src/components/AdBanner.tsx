import { useEffect, useRef, useState } from 'react';
import { Dimensions, Image, Linking, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { TrendingUp } from 'lucide-react-native';
import { nattileApi } from '../api/nattile';
import { useVillage } from '../store/village';
import { img } from '../lib/img';

export interface AdItem {
  id: string;
  title: string;
  subtitle: string;
  cta: string;
  image?: string;
  onPress?: () => void;
}

// Placeholder ad inventory shown until live (approved) ads load.
const DEFAULT_ADS: AdItem[] = [
  {
    id: 'ad-grow',
    title: 'Grow your business',
    subtitle: 'Advertise here and reach thousands in your locality.',
    cta: 'Learn More',
  },
  {
    id: 'ad-list',
    title: 'List your shop free',
    subtitle: 'Get discovered by neighbours searching nearby.',
    cta: 'Get Started',
  },
];

const SCREEN_W = Dimensions.get('window').width;
const GAP = 12;
const ITEM_W = SCREEN_W - 40; // matches the screen's mx-5 (20px) gutters
const BANNER_H = 132;
const RADIUS = 16; // matches rounded-2xl

/**
 * Sponsored-banner carousel that sits between the hero and search. Purely a
 * placeholder ad slot for now — content comes from `ads`.
 */
export function AdBanner() {
  const { village } = useVillage();
  const [index, setIndex] = useState(0);
  const [ads, setAds] = useState<AdItem[]>(DEFAULT_ADS);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    let active = true;
    nattileApi.listAds(village?.id).then((items) => {
      if (!active || items.length === 0) return; // keep defaults if none
      setAds(
        items.map((a) => ({
          id: a.id,
          title: a.title,
          subtitle: a.subtitle ?? '',
          cta: a.cta ?? 'Learn More',
          image: a.image,
          onPress: a.ctaUrl ? () => Linking.openURL(a.ctaUrl!).catch(() => undefined) : undefined,
        }))
      );
    });
    return () => {
      active = false;
    };
  }, [village?.id]);

  // Auto-advance through the banners so every ad gets seen (only if >1).
  useEffect(() => {
    if (ads.length <= 1) return;
    const id = setInterval(() => {
      setIndex((prev) => {
        const next = (prev + 1) % ads.length;
        scrollRef.current?.scrollTo({ x: next * (ITEM_W + GAP), animated: true });
        return next;
      });
    }, 4000);
    return () => clearInterval(id);
  }, [ads.length]);

  return (
    <View>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={ITEM_W + GAP}
        decelerationRate="fast"
        contentContainerStyle={{ paddingHorizontal: 20 }}
        onMomentumScrollEnd={(e) =>
          setIndex(Math.round(e.nativeEvent.contentOffset.x / (ITEM_W + GAP)))
        }>
        {ads.map((ad, i) => {
          const marginRight = i < ads.length - 1 ? GAP : 0;

          // Image-only banner — the whole image is tappable and opens the link.
          if (ad.image) {
            return (
              <TouchableOpacity
                key={ad.id}
                activeOpacity={ad.onPress ? 0.9 : 1}
                onPress={ad.onPress}
                style={{ width: ITEM_W, height: BANNER_H, marginRight, borderRadius: RADIUS, overflow: 'hidden' }}
                className="border border-[#D6EEDD]">
                <Image
                  source={{ uri: img(ad.image, 'banner') }}
                  resizeMode="cover"
                  style={{ width: '100%', height: '100%' }}
                />
                {/* AD watermark */}
                <View className="absolute left-2 top-2 rounded-md bg-black/55 px-1.5 py-0.5">
                  <Text className="text-[10px] font-bold tracking-wide text-white">AD</Text>
                </View>
              </TouchableOpacity>
            );
          }

          // Text-only banner (no image): the green placeholder card.
          return (
            <View
              key={ad.id}
              style={{ width: ITEM_W, height: BANNER_H, marginRight, borderRadius: RADIUS, overflow: 'hidden' }}
              className="justify-center border border-[#D6EEDD] bg-[#EAF7EF] p-4">
              {/* faint decorative graphic */}
              <View className="absolute -right-3 bottom-0 opacity-10">
                <TrendingUp size={120} color="#16A34A" />
              </View>

              <View className="self-start rounded-md border border-[#BFE3CC] bg-white px-1.5 py-0.5">
                <Text className="text-[10px] font-bold tracking-wide text-[#6B7280]">AD</Text>
              </View>

              <View className="mt-2 flex-row items-end justify-between">
                <View className="flex-1 pr-3">
                  <Text className="text-[17px] font-extrabold text-[#15803D]">{ad.title}</Text>
                  <Text className="mt-1 text-[13px] leading-[18px] text-[#4B5563]">{ad.subtitle}</Text>
                </View>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={ad.onPress}
                  className="rounded-full bg-[#16A34A] px-4 py-2.5">
                  <Text className="text-[13px] font-bold text-white">{ad.cta}</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* pager dots */}
      {ads.length > 1 && (
        <View className="mt-2.5 flex-row justify-center">
          {ads.map((a, i) => (
            <View
              key={a.id}
              className={`mx-[3px] h-[6px] rounded-full ${i === index ? 'w-[16px] bg-[#16A34A]' : 'w-[6px] bg-[#CBD5C0]'}`}
            />
          ))}
        </View>
      )}
    </View>
  );
}
