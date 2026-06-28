import { Linking, Modal, Text, TouchableOpacity, View } from 'react-native';
import { Rocket } from 'lucide-react-native';
import type { AppUpdateInfo } from '../api/nattile';

/**
 * Update popup driven by the super admin's config. When `mandatory`, it blocks
 * the app (no dismiss / no "Later"); otherwise it can be dismissed.
 */
export function UpdateModal({
  info,
  onDismiss,
}: {
  info: AppUpdateInfo | null;
  onDismiss: () => void;
}) {
  const visible = !!info?.updateAvailable;
  const mandatory = !!info?.mandatory;

  const openLink = () => {
    if (info?.url) Linking.openURL(info.url).catch(() => undefined);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      // Android hardware back: ignored when mandatory, dismisses otherwise.
      onRequestClose={() => {
        if (!mandatory) onDismiss();
      }}>
      <View className="flex-1 items-center justify-center bg-black/50 px-7">
        <View className="w-full max-w-[380px] items-center rounded-3xl bg-white p-6">
          <View className="h-16 w-16 items-center justify-center rounded-full bg-[#E7F6EC]">
            <Rocket size={30} color="#16A34A" />
          </View>

          <Text className="mt-4 text-center text-[20px] font-extrabold text-[#111827]">
            {info?.title || 'Update available'}
          </Text>
          <Text className="mt-2 text-center text-[14px] leading-[21px] text-[#4B5563]">
            {info?.message || 'A new version of the app is available.'}
          </Text>
          {!!info?.latestVersion && (
            <Text className="mt-1 text-[12px] font-semibold text-[#9CA3AF]">
              Version {info.latestVersion}
            </Text>
          )}

          <TouchableOpacity
            onPress={openLink}
            activeOpacity={0.9}
            className="mt-5 w-full items-center rounded-2xl bg-[#16A34A] py-3.5">
            <Text className="text-[16px] font-bold text-white">Update now</Text>
          </TouchableOpacity>

          {!mandatory && (
            <TouchableOpacity onPress={onDismiss} hitSlop={8} className="mt-3 py-1">
              <Text className="text-[14px] font-semibold text-[#6B7280]">Maybe later</Text>
            </TouchableOpacity>
          )}

          {mandatory && (
            <Text className="mt-3 text-center text-[12px] text-[#9CA3AF]">
              This update is required to continue.
            </Text>
          )}
        </View>
      </View>
    </Modal>
  );
}
