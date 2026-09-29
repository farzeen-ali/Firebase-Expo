import { Text, View } from 'react-native';

type ConfigMissingProps = {
  message: string;
};

export function ConfigMissing({ message }: ConfigMissingProps) {
  return (
    <View className="flex-1 items-center justify-center bg-[#F4F7FB] px-6 dark:bg-[#070B14]">
      <View className="w-full max-w-[440px] gap-3 rounded-3xl bg-white p-6 dark:bg-zinc-900">
        <Text className="text-2xl font-semibold text-zinc-950 dark:text-white">Firebase setup needed</Text>
        <Text className="text-base leading-6 text-zinc-600 dark:text-zinc-300">{message}</Text>
      </View>
    </View>
  );
}
