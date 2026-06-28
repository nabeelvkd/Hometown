import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  type LayoutChangeEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bus, ChevronLeft, ChevronRight, Clock, Info } from 'lucide-react-native';
import { palette } from '../theme';
import { BUS_FILTERS, type BusTrip } from '../data/mock';
import { nattileApi } from '../api/nattile';
import { useVillage } from '../store/village';

const toMins = (t: string) => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};

function fmtTime(t: string) {
  let [h] = t.split(':').map(Number);
  const m = t.split(':')[1];
  const ap = h < 12 ? 'AM' : 'PM';
  const hh = ((h + 11) % 12) + 1;
  return { hm: `${hh}:${m}`, ap };
}

function fmtCountdown(mins: number) {
  if (mins <= 0) return 'Departing now';
  if (mins < 60) return `Departs in ${mins} min`;
  return `Departs in ${Math.floor(mins / 60)}h ${mins % 60}m`;
}

export function BusTimesScreen({ onBack }: { onBack: () => void }) {
  const insets = useSafeAreaInsets();
  const { village } = useVillage();
  const [allTrips, setAllTrips] = useState<BusTrip[]>([]);
  const [destination, setDestination] = useState('');
  const [filter, setFilter] = useState('all');
  const [now, setNow] = useState(() => new Date());

  // Load this village's bus trips from the backend.
  useEffect(() => {
    nattileApi.listBusTrips(village?.id).then(setAllTrips);
  }, [village?.id]);

  // Tick every 30s so the highlight + countdown stay live.
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(id);
  }, []);

  const nowMins = now.getHours() * 60 + now.getMinutes();

  // Destinations are derived from this village's own trips.
  const destinations = useMemo(
    () => [...new Set(allTrips.map((t) => t.destination || 'Other'))],
    [allTrips]
  );

  // Keep the selected destination valid as data loads.
  useEffect(() => {
    if (destinations.length && !destinations.includes(destination)) setDestination(destinations[0]);
  }, [destinations, destination]);

  const trips = useMemo(() => {
    return allTrips
      .filter((t) => (t.destination || 'Other') === destination)
      .filter((t) => filter === 'all' || t.tags.includes(filter));
  }, [allTrips, destination, filter]);

  // Next bus = first upcoming today; if today's are all done, wrap to
  // tomorrow's first departure so a "next bus" is always highlighted.
  const { nextIndex, isTomorrow } = useMemo(() => {
    if (!trips.length) return { nextIndex: -1, isTomorrow: false };
    const up = trips.findIndex((t) => toMins(t.time) >= nowMins);
    return up >= 0 ? { nextIndex: up, isTomorrow: false } : { nextIndex: 0, isTomorrow: true };
  }, [trips, nowMins]);

  // Measured Y offset of each row within the scroll content, so we can scroll
  // the next bus to the top regardless of variable row heights.
  const scrollRef = useRef<ScrollView>(null);
  const offsets = useRef<Record<number, number>>({});

  const scrollToNext = () => {
    const y = offsets.current[nextIndex];
    if (nextIndex >= 0 && y != null) {
      scrollRef.current?.scrollTo({ y: Math.max(y - 8, 0), animated: true });
    }
  };

  // Auto-scroll the next bus to the top on open / destination / filter / data change.
  useEffect(() => {
    const id = setTimeout(scrollToNext, 400);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [destination, filter, trips.length]);

  const onRowLayout = (index: number) => (e: LayoutChangeEvent) => {
    offsets.current[index] = e.nativeEvent.layout.y;
  };

  return (
    <View className="flex-1 bg-[#F4F7F5]">
      {/* Header */}
      <View
        style={{ paddingTop: insets.top + 8 }}
        className="flex-row items-center gap-2 border-b border-[#EEF1F5] bg-white px-3 pb-3">
        <TouchableOpacity onPress={onBack} hitSlop={10} className="h-10 w-10 items-center justify-center rounded-full bg-[#F5F7F9]">
          <ChevronLeft size={24} color={palette.text} />
        </TouchableOpacity>
        <Text className="flex-1 text-[18px] font-extrabold text-[#111827]">Bus Times</Text>
        <TouchableOpacity
          hitSlop={10}
          onPress={() => Alert.alert('Bus Times', 'Sample timetable. The next departure is highlighted and scrolled to the top automatically.')}
          className="h-9 w-9 items-center justify-center rounded-full border border-[#D6EEDD]">
          <Info size={18} color={palette.primary} />
        </TouchableOpacity>
      </View>

      {/* Destination */}
      <View className="bg-white px-5 pb-3 pt-3">
        <Text className="text-[13px] text-[#6B7280]">To</Text>
        <Text className="text-[26px] font-extrabold text-[#111827]">{destination}</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingTop: 12, paddingRight: 12 }}>
          {destinations.map((d) => {
            const active = d === destination;
            return (
              <TouchableOpacity
                key={d}
                onPress={() => setDestination(d)}
                className={`rounded-full border px-4 py-2 ${active ? 'border-[#16A34A] bg-[#E7F6EC]' : 'border-[#EEF1F5] bg-white'}`}>
                <Text className={`text-[13px] font-semibold ${active ? 'text-[#15803D]' : 'text-[#6B7280]'}`}>{d}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Schedule (auto-scrolls the next bus to the top) */}
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
        {trips.map((t, i) => {
          const isNext = i === nextIndex;
          // When wrapped to tomorrow, today's buses aren't "past" — don't dim.
          const past = !isTomorrow && toMins(t.time) < nowMins;
          const { hm, ap } = fmtTime(t.time);
          if (isNext) {
            const mins = isTomorrow ? 1440 - nowMins + toMins(t.time) : toMins(t.time) - nowMins;
            return (
              <View key={t.id} onLayout={onRowLayout(i)} className="mb-2">
                <View className="rounded-2xl border border-[#BFE3CC] bg-[#E7F6EC] p-4">
                  <View className="flex-row items-center">
                    <View className="flex-row items-center rounded-md bg-[#16A34A] px-2 py-1">
                      <Text className="text-[11px] font-extrabold tracking-wide text-white">NEXT BUS</Text>
                      <Bus size={12} color="#fff" style={{ marginLeft: 4 }} />
                    </View>
                    {isTomorrow && (
                      <View className="ml-2 rounded-md bg-[#FEF3E2] px-2 py-1">
                        <Text className="text-[11px] font-extrabold tracking-wide text-[#B7791F]">TOMORROW</Text>
                      </View>
                    )}
                  </View>
                  <View className="mt-2 flex-row items-center">
                    <View className="flex-1 flex-row items-baseline">
                      <Text className="text-[34px] font-extrabold leading-[38px] text-[#15803D]">{hm}</Text>
                      <Text className="ml-1 text-[14px] font-bold text-[#16A34A]">{ap}</Text>
                    </View>
                    <View className="h-10 w-[1px] bg-[#BFE3CC]" />
                    <View className="ml-3 h-12 w-12 items-center justify-center rounded-full bg-[#16A34A1A]">
                      <Bus size={24} color={palette.primary} />
                    </View>
                    <View className="ml-2 flex-1">
                      <Text className="text-[15px] font-bold text-[#111827]">{t.operator}</Text>
                      <Text className="text-[12px] text-[#6B7280]">{t.number}</Text>
                    </View>
                    <ChevronRight size={20} color={palette.primary} />
                  </View>
                  <View className="mt-2 flex-row items-center">
                    <Clock size={14} color={palette.primary} />
                    <Text className="ml-1.5 text-[13px] font-bold text-[#15803D]">
                      {isTomorrow ? `Departs tomorrow ${hm} ${ap} · in ${fmtCountdown(mins).replace('Departs in ', '')}` : fmtCountdown(mins)}
                    </Text>
                  </View>
                </View>
              </View>
            );
          }
          return (
            <View
              key={t.id}
              onLayout={onRowLayout(i)}
              className="mb-2 flex-row items-center rounded-2xl border border-[#EEF1F5] bg-white px-4 py-3"
              style={{ opacity: past ? 0.5 : 1 }}>
              <View className="w-[78px] flex-row items-baseline">
                <Text className="text-[20px] font-extrabold text-[#111827]">{hm}</Text>
                <Text className="ml-1 text-[12px] font-semibold text-[#6B7280]">{ap}</Text>
              </View>
              <View className="h-9 w-9 items-center justify-center rounded-full bg-[#16A34A14]">
                <Bus size={18} color={palette.primary} />
              </View>
              <View className="ml-3 flex-1">
                <Text className="text-[15px] font-bold text-[#111827]">{t.operator}</Text>
                <Text className="text-[12px] text-[#6B7280]">{t.number}</Text>
              </View>
              <ChevronRight size={18} color={palette.textMuted} />
            </View>
          );
        })}

        {trips.length === 0 && (
          <View className="mt-4 items-center rounded-2xl bg-white p-6">
            <Text className="text-[14px] font-semibold text-[#6B7280]">No buses on this route yet</Text>
            <Text className="mt-1 text-[12px] text-[#9CA3AF]">Try another destination or filter.</Text>
          </View>
        )}
      </ScrollView>

      {/* Type filter bar */}
      <View
        style={{ paddingBottom: Math.max(insets.bottom, 12) }}
        className="border-t border-[#EEF1F5] bg-white pt-3">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}>
          {BUS_FILTERS.map((f) => {
            const active = f.key === filter;
            return (
              <TouchableOpacity
                key={f.key}
                onPress={() => setFilter(f.key)}
                className={`rounded-full border px-4 py-2 ${active ? 'border-[#16A34A] bg-[#16A34A]' : 'border-[#EEF1F5] bg-white'}`}>
                <Text className={`text-[13px] font-semibold ${active ? 'text-white' : 'text-[#6B7280]'}`}>{f.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
}
