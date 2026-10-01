import { Pressable, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeOut, LinearTransition } from 'react-native-reanimated';

import type { Note } from '@/types/note';

type NoteCardProps = {
  note: Note;
  index: number;
  onPress: (note: Note) => void;
  onDelete: (note: Note) => void;
};

function formatNoteDate(date: Date | null) {
  if (!date) {
    return 'Just now';
  }

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

export function NoteCard({ note, index, onPress, onDelete }: NoteCardProps) {
  const preview = note.body.trim() || 'No details yet';

  return (
    <Animated.View
      entering={FadeInDown.delay(Math.min(index, 8) * 40).duration(360)}
      exiting={FadeOut.duration(180)}
      layout={LinearTransition.springify().damping(18)}
      className="mb-3">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Edit ${note.title}`}
        onPress={() => onPress(note)}
        className="rounded-3xl bg-white px-4 py-4 active:opacity-80 dark:bg-zinc-900">
        <View className="flex-row items-start justify-between gap-3">
          <View className="flex-1 gap-1">
            <Text className="text-base font-semibold text-zinc-950 dark:text-white" numberOfLines={1}>
              {note.title}
            </Text>
            <Text className="text-sm leading-5 text-zinc-500 dark:text-zinc-400" numberOfLines={2}>
              {preview}
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Delete ${note.title}`}
            hitSlop={8}
            onPress={() => onDelete(note)}
            className="h-11 items-center justify-center rounded-full px-3">
            <Text className="text-sm font-semibold text-red-600 dark:text-red-300">Delete</Text>
          </Pressable>
        </View>
        <Text className="mt-3 text-xs font-medium text-zinc-400 dark:text-zinc-500">
          {formatNoteDate(note.updatedAt ?? note.createdAt)}
        </Text>
      </Pressable>
    </Animated.View>
  );
}
