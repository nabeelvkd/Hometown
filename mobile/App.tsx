import './global.css';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, BackHandler, Platform, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Constants from 'expo-constants';
import { VillageProvider, useVillage } from './src/store/village';
import { ProfileProvider } from './src/store/profile';
import { NotificationsProvider } from './src/store/notifications';
import { UpdateModal } from './src/components/UpdateModal';
import { nattileApi, type AppUpdateInfo } from './src/api/nattile';
import { getDeviceId } from './src/lib/device';
import { LocationSelectScreen } from './src/screens/LocationSelectScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { SearchScreen, FavoritesScreen, ProfileScreen } from './src/screens/Placeholders';
import { BusinessesScreen } from './src/screens/BusinessesScreen';
import { BusinessDetailScreen } from './src/screens/BusinessDetailScreen';
import { ServicesScreen } from './src/screens/ServicesScreen';
import { ServiceDetailScreen } from './src/screens/ServiceDetailScreen';
import { EmergencyScreen } from './src/screens/EmergencyScreen';
import { AnnouncementsScreen } from './src/screens/AnnouncementsScreen';
import { TaxisScreen } from './src/screens/TaxisScreen';
import { BusTimesScreen } from './src/screens/BusTimesScreen';
import { CategoryScreen } from './src/screens/CategoryScreen';
import { BottomTabBar, type TabKey } from './src/components/BottomTabBar';
import type { Business, HomeCategoryItem, ServiceProvider } from './src/data/mock';
import { Linking } from 'react-native';

type Screen =
  | { name: 'businesses'; category?: string }
  | { name: 'businessDetail'; business: Business }
  | { name: 'services'; category?: string }
  | { name: 'serviceDetail'; provider: ServiceProvider }
  | { name: 'emergency' }
  | { name: 'announcements' }
  | { name: 'taxis' }
  | { name: 'busTimes' }
  | { name: 'category'; category: HomeCategoryItem };

function Root() {
  const { village, ready } = useVillage();
  const [tab, setTab] = useState<TabKey>('home');
  const [stack, setStack] = useState<Screen[]>([]);
  const [relocating, setRelocating] = useState(false);

  const push = useCallback((s: Screen) => setStack((prev) => [...prev, s]), []);
  const pop = useCallback(() => setStack((prev) => prev.slice(0, -1)), []);
  const top = stack[stack.length - 1];

  // Anonymous unique-user ping for the selected village (super-admin analytics).
  useEffect(() => {
    if (!village?.id) return;
    getDeviceId().then((id) => nattileApi.pingDevice(id, village.id)).catch(() => undefined);
  }, [village?.id]);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      // 1. A pushed detail screen — pop it.
      if (stack.length > 0) {
        pop();
        return true;
      }
      // 2. Changing location — cancel back to the app.
      if (relocating && village) {
        setRelocating(false);
        return true;
      }
      // 3. On a non-home tab — go to Home instead of quitting.
      if (tab !== 'home') {
        setTab('home');
        return true;
      }
      // 4. On Home — confirm before quitting.
      Alert.alert('Exit OneVillage', 'Do you want to quit the app?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Quit', style: 'destructive', onPress: () => BackHandler.exitApp() },
      ]);
      return true;
    });
    return () => sub.remove();
  }, [stack.length, pop, relocating, village, tab]);

  const handleQuickAction = (key: string, label: string) => {
    if (key === 'businesses') return push({ name: 'businesses' });
    if (key === 'services') return push({ name: 'services' });
    if (key === 'emergency') return push({ name: 'emergency' });
    if (key === 'announcements') return push({ name: 'announcements' });
    if (key === 'transport') return push({ name: 'taxis' });
    if (key === 'bus') return push({ name: 'busTimes' });
    Alert.alert(label, 'This section is coming soon.');
  };

  // Decides what a home tile does: templated categories open their item list,
  // link categories open a URL, built-in keys route to their screen.
  const handleCategory = (cat: HomeCategoryItem) => {
    if (cat.template === 'directory' || cat.template === 'places') {
      return push({ name: 'category', category: cat });
    }
    if (cat.link) {
      Linking.openURL(cat.link).catch(() => undefined);
      return;
    }
    handleQuickAction(cat.key, cat.label);
  };

  // Still restoring the saved village.
  if (!ready) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator color="#16A34A" />
      </View>
    );
  }

  // First launch (or changing location) — village picker.
  if (!village || relocating) {
    return (
      <>
        <StatusBar style="light" />
        <LocationSelectScreen onDone={() => setRelocating(false)} />
      </>
    );
  }

  // Pushed screen takes over the whole view.
  if (top) {
    return (
      <>
        <StatusBar style="dark" />
        {top.name === 'businesses' && (
          <BusinessesScreen
            initialCategory={top.category}
            onBack={pop}
            onOpen={(b) => push({ name: 'businessDetail', business: b })}
          />
        )}
        {top.name === 'businessDetail' && <BusinessDetailScreen business={top.business} onBack={pop} />}
        {top.name === 'services' && (
          <ServicesScreen
            initialCategory={top.category}
            onBack={pop}
            onOpen={(p) => push({ name: 'serviceDetail', provider: p })}
          />
        )}
        {top.name === 'serviceDetail' && <ServiceDetailScreen provider={top.provider} onBack={pop} />}
        {top.name === 'emergency' && <EmergencyScreen onBack={pop} />}
        {top.name === 'announcements' && <AnnouncementsScreen onBack={pop} />}
        {top.name === 'taxis' && <TaxisScreen onBack={pop} />}
        {top.name === 'busTimes' && <BusTimesScreen onBack={pop} />}
        {top.name === 'category' && <CategoryScreen category={top.category} onBack={pop} />}
      </>
    );
  }

  return (
    <>
      <StatusBar style={tab === 'home' ? 'light' : 'dark'} />
      <View className="flex-1 bg-white">
        <View className="flex-1">
          {tab === 'home' && (
            <HomeScreen
              onCategory={handleCategory}
              onSearchPress={() => setTab('search')}
              onChangeLocation={() => setRelocating(true)}
              onNotifications={() => push({ name: 'announcements' })}
            />
          )}
          {tab === 'search' && (
            <SearchScreen
              onOpenBusiness={(b) => push({ name: 'businessDetail', business: b })}
              onOpenService={(p) => push({ name: 'serviceDetail', provider: p })}
            />
          )}
          {tab === 'favorites' && <FavoritesScreen />}
          {tab === 'profile' && <ProfileScreen onChangeLocation={() => setRelocating(true)} />}
        </View>

        <BottomTabBar
          active={tab}
          onChange={setTab}
          onAdd={() =>
            Alert.alert(
              'Suggest a place',
              'Know a local shop or service that should be listed? Residents will suggest it here.'
            )
          }
        />
      </View>
    </>
  );
}

/** Checks for a newer app version on launch and shows the update popup. */
function UpdateGate() {
  const [info, setInfo] = useState<AppUpdateInfo | null>(null);

  useEffect(() => {
    nattileApi
      .checkAppUpdate(Platform.OS, Constants.expoConfig?.version ?? undefined)
      .then((u) => {
        if (u?.updateAvailable) setInfo(u);
      });
  }, []);

  return <UpdateModal info={info} onDismiss={() => setInfo(null)} />;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ProfileProvider>
        <VillageProvider>
          <NotificationsProvider>
            <Root />
            <UpdateGate />
          </NotificationsProvider>
        </VillageProvider>
      </ProfileProvider>
    </SafeAreaProvider>
  );
}
