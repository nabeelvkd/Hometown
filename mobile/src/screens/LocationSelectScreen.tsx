import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronRight, MapPin } from 'lucide-react-native';
import { palette } from '../theme';
import { nattileApi, type LocationOption } from '../api/nattile';
import { useVillage } from '../store/village';

export function LocationSelectScreen({ onDone }: { onDone: () => void }) {
  const insets = useSafeAreaInsets();
  const { setVillage } = useVillage();

  const [districts, setDistricts] = useState<LocationOption[]>([]);
  const [areas, setAreas] = useState<LocationOption[]>([]);
  const [villages, setVillages] = useState<LocationOption[]>([]);
  const [district, setDistrict] = useState<LocationOption | null>(null);
  const [area, setArea] = useState<LocationOption | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    nattileApi
      .listDistricts()
      .then((d) => setDistricts(d))
      .catch(() => setError('Couldn’t reach the server.'))
      .finally(() => setLoading(false));
  }, []);

  const pickDistrict = (d: LocationOption) => {
    setDistrict(d);
    setArea(null);
    setVillages([]);
    setAreas([]);
    setBusy(true);
    nattileApi
      .listAreas(d._id)
      .then(setAreas)
      .catch(() => setAreas([]))
      .finally(() => setBusy(false));
  };

  const pickArea = (a: LocationOption) => {
    setArea(a);
    setVillages([]);
    setBusy(true);
    nattileApi
      .listVillages(a._id)
      .then(setVillages)
      .catch(() => setVillages([]))
      .finally(() => setBusy(false));
  };

  const pickVillage = (v: LocationOption) => {
    setVillage({ id: v._id, name: v.name, area: area?.name ?? '', district: district?.name ?? '' });
    onDone();
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View style={{ paddingTop: insets.top + 24 }} className="bg-[#15803D] px-6 pb-7">
        <View className="h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
          <MapPin size={26} color="#fff" />
        </View>
        <Text className="mt-3 text-[24px] font-extrabold text-white">Choose your location</Text>
        <Text className="mt-1 text-[14px] text-white/85">
          Nattile shows shops, services and updates for your village.
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator className="mt-16" color={palette.primary} />
      ) : error && districts.length === 0 ? (
        <View className="m-6 rounded-2xl border border-[#FCD9D9] bg-[#FEF2F2] p-5">
          <Text className="text-[15px] font-bold text-[#9B3B3B]">{error}</Text>
          <Text className="mt-1 text-[13px] text-[#9B3B3B]">
            Please check your connection and try again.
          </Text>
          <TouchableOpacity
            onPress={() => {
              setError(null);
              setLoading(true);
              nattileApi
                .listDistricts()
                .then(setDistricts)
                .catch(() => setError('Couldn’t reach the server.'))
                .finally(() => setLoading(false));
            }}
            className="mt-4 items-center rounded-xl bg-[#16A34A] py-3">
            <Text className="text-[15px] font-bold text-white">Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
          {/* Step 1 — District */}
          <Step n={1} label="District" />
          <View className="mb-5 mt-2 flex-row flex-wrap gap-2">
            {districts.map((d) => (
              <Chip key={d._id} active={district?._id === d._id} label={d.name} onPress={() => pickDistrict(d)} />
            ))}
          </View>

          {/* Step 2 — Area */}
          {district && (
            <>
              <Step n={2} label="Area" />
              <View className="mb-5 mt-2 flex-row flex-wrap gap-2">
                {busy && areas.length === 0 ? (
                  <ActivityIndicator color={palette.primary} />
                ) : areas.length === 0 ? (
                  <Text className="text-[13px] text-[#6B7280]">No areas yet.</Text>
                ) : (
                  areas.map((a) => (
                    <Chip key={a._id} active={area?._id === a._id} label={a.name} onPress={() => pickArea(a)} />
                  ))
                )}
              </View>
            </>
          )}

          {/* Step 3 — Village */}
          {area && (
            <>
              <Step n={3} label="Village / Town" />
              <View className="mt-2 overflow-hidden rounded-2xl border border-[#EEF1F5]">
                {busy && villages.length === 0 ? (
                  <ActivityIndicator className="py-6" color={palette.primary} />
                ) : villages.length === 0 ? (
                  <Text className="p-4 text-[13px] text-[#6B7280]">No villages yet.</Text>
                ) : (
                  villages.map((v, i) => (
                    <TouchableOpacity
                      key={v._id}
                      onPress={() => pickVillage(v)}
                      className={`flex-row items-center justify-between px-4 py-3.5 ${i < villages.length - 1 ? 'border-b border-[#EEF1F5]' : ''}`}>
                      <View>
                        <Text className="text-[15px] font-semibold text-[#111827]">{v.name}</Text>
                        {v.nameMl ? <Text className="text-[12px] text-[#6B7280]">{v.nameMl}</Text> : null}
                      </View>
                      <ChevronRight size={18} color={palette.textMuted} />
                    </TouchableOpacity>
                  ))
                )}
              </View>
            </>
          )}
        </ScrollView>
      )}
    </View>
  );
}

function Step({ n, label }: { n: number; label: string }) {
  return (
    <View className="flex-row items-center">
      <View className="h-6 w-6 items-center justify-center rounded-full bg-[#16A34A]">
        <Text className="text-[12px] font-bold text-white">{n}</Text>
      </View>
      <Text className="ml-2 text-[15px] font-bold text-[#111827]">{label}</Text>
    </View>
  );
}

function Chip({ active, label, onPress }: { active: boolean; label: string; onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`rounded-full border px-4 py-2 ${active ? 'border-[#16A34A] bg-[#16A34A]' : 'border-[#EEF1F5] bg-[#F5F7F9]'}`}>
      <Text className={`text-[13px] font-semibold ${active ? 'text-white' : 'text-[#374151]'}`}>{label}</Text>
    </TouchableOpacity>
  );
}
