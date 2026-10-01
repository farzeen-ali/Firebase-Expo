import { useState } from 'react';
import { ActivityIndicator, Alert, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FormMessage } from '@/components/auth/form-message';
import { NoteCard } from '@/components/notes/note-card';
import { NoteFormModal } from '@/components/notes/note-form-modal';
import { BottomTabInset } from '@/constants/theme';
import { useNotes } from '@/hooks/use-notes';
import { getFirestoreErrorMessage } from '@/lib/firestore-errors';
import type { Note, NoteInput } from '@/types/note';

export default function NotesScreen() {
  const insets = useSafeAreaInsets();
  const { notes, isLoading, error, create, update, remove } = useNotes();
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<Note | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  function openCreate() {
    setEditing(null);
    setFormError(null);
    setEditorOpen(true);
  }

  function openEdit(note: Note) {
    setEditing(note);
    setFormError(null);
    setEditorOpen(true);
  }

  function closeEditor() {
    if (saving) {
      return;
    }
    setEditorOpen(false);
    setFormError(null);
  }

  async function handleSubmit(input: NoteInput) {
    setSaving(true);
    setFormError(null);
    try {
      if (editing) {
        await update(editing.id, input);
      } else {
        await create(input);
      }
      setEditorOpen(false);
    } catch (nextError) {
      setFormError(getFirestoreErrorMessage(nextError));
    } finally {
      setSaving(false);
    }
  }

  function confirmDelete(note: Note) {
    Alert.alert('Delete note', `Delete "${note.title}"? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          void deleteExisting(note);
        },
      },
    ]);
  }

  async function deleteExisting(note: Note) {
    setSaving(true);
    setFormError(null);
    try {
      await remove(note.id);
      setEditorOpen(false);
    } catch (nextError) {
      setFormError(getFirestoreErrorMessage(nextError));
      if (!editorOpen) {
        Alert.alert('Delete failed', getFirestoreErrorMessage(nextError));
      }
    } finally {
      setSaving(false);
    }
  }

  const topInset = Platform.OS === 'web' ? 88 : insets.top;

  return (
    <View className="flex-1 bg-[#F4F7FB] dark:bg-[#070B14]">
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: topInset + 20,
          paddingBottom: insets.bottom + BottomTabInset + 96,
          paddingHorizontal: 20,
        }}>
        <Animated.View entering={FadeInDown.duration(420)} className="mx-auto w-full max-w-[720px] flex-1">
          <View className="mb-6 gap-2">
            <Text className="text-xs font-semibold uppercase tracking-widest text-brand">Your notes</Text>
            <Text className="text-4xl font-semibold tracking-tight text-zinc-950 dark:text-white">Notes</Text>
            <Text className="text-base leading-6 text-zinc-500 dark:text-zinc-400">
              Only the notes saved to this account appear here.
            </Text>
          </View>

          {error ? (
            <View className="mb-4">
              <FormMessage message={error} tone="error" />
            </View>
          ) : null}

          {isLoading ? (
            <View className="flex-1 items-center justify-center py-16">
              <ActivityIndicator color="#208AEF" />
            </View>
          ) : notes.length === 0 ? (
            <View className="mt-4 items-center rounded-3xl bg-white px-6 py-10 dark:bg-zinc-900">
              <Text className="text-lg font-semibold text-zinc-950 dark:text-white">No notes yet</Text>
              <Text className="mt-2 text-center text-sm leading-5 text-zinc-500 dark:text-zinc-400">
                Add a note and it will stay synced to this signed-in account.
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Add your first note"
                onPress={openCreate}
                className="mt-5 h-12 items-center justify-center rounded-2xl bg-brand px-5">
                <Text className="text-sm font-semibold text-white">Add a note</Text>
              </Pressable>
            </View>
          ) : (
            <View className="mt-4">
              {notes.map((note, index) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  index={index}
                  onPress={openEdit}
                  onDelete={confirmDelete}
                />
              ))}
            </View>
          )}
        </Animated.View>
      </ScrollView>

      {notes.length > 0 ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="New note"
          onPress={openCreate}
          className="absolute right-5 h-14 items-center justify-center rounded-full bg-brand px-5 shadow-sm"
          style={{ bottom: insets.bottom + BottomTabInset + 16 }}>
          <Text className="text-base font-semibold text-white">New note</Text>
        </Pressable>
      ) : null}

      <NoteFormModal
        visible={editorOpen}
        note={editing}
        saving={saving}
        error={formError}
        onClose={closeEditor}
        onSubmit={(input) => {
          void handleSubmit(input);
        }}
        onDelete={() => {
          if (editing) {
            confirmDelete(editing);
          }
        }}
      />
    </View>
  );
}
