import { useState } from 'react';
import { Modal, Pressable, Text, TextInput, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AuthButton } from '@/components/auth/auth-button';
import { FormMessage } from '@/components/auth/form-message';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { hasNoteErrors, validateNote } from '@/lib/note-validation';
import { NOTE_BODY_MAX, NOTE_TITLE_MAX, type Note, type NoteInput } from '@/types/note';

type NoteFormModalProps = {
  visible: boolean;
  note: Note | null;
  saving: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (input: NoteInput) => void;
  onDelete: () => void;
};

export function NoteFormModal({
  visible,
  note,
  saving,
  error,
  onClose,
  onSubmit,
  onDelete,
}: NoteFormModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      {visible ? (
        <NoteForm
          key={note?.id ?? 'create'}
          note={note}
          saving={saving}
          error={error}
          onClose={onClose}
          onSubmit={onSubmit}
          onDelete={onDelete}
        />
      ) : null}
    </Modal>
  );
}

function NoteForm({
  note,
  saving,
  error,
  onClose,
  onSubmit,
  onDelete,
}: Omit<NoteFormModalProps, 'visible'>) {
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const [title, setTitle] = useState(note?.title ?? '');
  const [body, setBody] = useState(note?.body ?? '');
  const [titleError, setTitleError] = useState<string>();
  const [bodyError, setBodyError] = useState<string>();
  const isEditing = note != null;

  function handleSubmit() {
    const errors = validateNote({ title, body });
    setTitleError(errors.title);
    setBodyError(errors.body);
    if (hasNoteErrors(errors)) {
      return;
    }
    onSubmit({ title: title.trim(), body: body.trim() });
  }

  return (
    <View className="flex-1 bg-black/45">
      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        bottomOffset={28}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'flex-end',
          paddingHorizontal: 12,
          paddingTop: insets.top + 24,
          paddingBottom: insets.bottom + 12,
        }}>
        <Pressable accessibilityLabel="Close note editor" className="min-h-16 flex-1" onPress={onClose} />
        <Animated.View
          entering={FadeInDown.duration(320).springify().damping(18)}
          className="gap-4 rounded-3xl bg-white p-5 dark:bg-zinc-900">
          <View className="gap-1">
            <Text className="text-xs font-semibold uppercase tracking-widest text-brand">
              {isEditing ? 'Edit note' : 'New note'}
            </Text>
            <Text className="text-2xl font-semibold text-zinc-950 dark:text-white">
              {isEditing ? 'Update this note' : 'Write something down'}
            </Text>
          </View>

          <FormMessage message={error} tone="error" />

          <View className="gap-2">
            <Text className="text-sm font-medium text-zinc-700 dark:text-zinc-200">Title</Text>
            <TextInput
              value={title}
              onChangeText={(value) => {
                setTitle(value);
                setTitleError(undefined);
              }}
              editable={!saving}
              maxLength={NOTE_TITLE_MAX}
              placeholder="Title"
              placeholderTextColor={isDark ? '#8B93A7' : '#8A93A6'}
              autoCapitalize="sentences"
              returnKeyType="next"
              accessibilityLabel="Title"
              className={`h-14 rounded-2xl border bg-white px-4 text-base text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50 ${
                titleError ? 'border-red-400' : 'border-zinc-200 dark:border-zinc-700'
              }`}
            />
            {titleError ? (
              <Text className="text-sm text-red-600 dark:text-red-300">{titleError}</Text>
            ) : (
              <Text className="text-xs text-zinc-400">
                {title.trim().length}/{NOTE_TITLE_MAX}
              </Text>
            )}
          </View>

          <View className="gap-2">
            <Text className="text-sm font-medium text-zinc-700 dark:text-zinc-200">Details</Text>
            <TextInput
              value={body}
              onChangeText={(value) => {
                setBody(value);
                setBodyError(undefined);
              }}
              editable={!saving}
              multiline
              maxLength={NOTE_BODY_MAX}
              textAlignVertical="top"
              placeholder="Details"
              placeholderTextColor={isDark ? '#8B93A7' : '#8A93A6'}
              accessibilityLabel="Details"
              className={`min-h-32 rounded-2xl border bg-white px-4 py-3 text-base text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50 ${
                bodyError ? 'border-red-400' : 'border-zinc-200 dark:border-zinc-700'
              }`}
            />
            {bodyError ? (
              <Text className="text-sm text-red-600 dark:text-red-300">{bodyError}</Text>
            ) : (
              <Text className="text-xs text-zinc-400">
                {body.trim().length}/{NOTE_BODY_MAX}
              </Text>
            )}
          </View>

          <AuthButton
            label={isEditing ? 'Save changes' : 'Add note'}
            loading={saving}
            onPress={handleSubmit}
          />

          <View className="flex-row items-center justify-between">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Cancel"
              disabled={saving}
              onPress={onClose}
              className="h-11 justify-center px-1">
              <Text className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">Cancel</Text>
            </Pressable>
            {isEditing ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Delete note"
                disabled={saving}
                onPress={onDelete}
                className="h-11 justify-center px-1">
                <Text className="text-sm font-semibold text-red-600 dark:text-red-300">Delete</Text>
              </Pressable>
            ) : null}
          </View>
        </Animated.View>
      </KeyboardAwareScrollView>
    </View>
  );
}
