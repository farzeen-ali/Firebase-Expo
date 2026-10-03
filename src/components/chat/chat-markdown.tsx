import { Text, View } from 'react-native';

import { Fonts } from '@/constants/theme';

type Block =
  | { type: 'heading'; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'code'; language: string; code: string };

function parseBlocks(source: string): Block[] {
  const blocks: Block[] = [];
  const lines = source.replace(/\r\n/g, '\n').split('\n');
  let index = 0;

  while (index < lines.length) {
    const line = lines[index] ?? '';
    if (line.trim().startsWith('```')) {
      const language = line.trim().slice(3).trim();
      const code: string[] = [];
      index += 1;
      while (index < lines.length && !(lines[index] ?? '').trim().startsWith('```')) {
        code.push(lines[index] ?? '');
        index += 1;
      }
      index += 1;
      blocks.push({ type: 'code', language, code: code.join('\n') });
      continue;
    }

    if (!line.trim()) {
      index += 1;
      continue;
    }

    if (/^#{1,3}\s+/.test(line)) {
      blocks.push({ type: 'heading', text: line.replace(/^#{1,3}\s+/, '') });
      index += 1;
      continue;
    }

    if (/^\s*([-*]|\d+\.)\s+/.test(line)) {
      const items: string[] = [];
      while (index < lines.length && /^\s*([-*]|\d+\.)\s+/.test(lines[index] ?? '')) {
        items.push((lines[index] ?? '').replace(/^\s*([-*]|\d+\.)\s+/, ''));
        index += 1;
      }
      blocks.push({ type: 'list', items });
      continue;
    }

    const paragraph: string[] = [];
    while (
      index < lines.length &&
      (lines[index] ?? '').trim() &&
      !(lines[index] ?? '').trim().startsWith('```') &&
      !/^#{1,3}\s+/.test(lines[index] ?? '') &&
      !/^\s*([-*]|\d+\.)\s+/.test(lines[index] ?? '')
    ) {
      paragraph.push((lines[index] ?? '').trim());
      index += 1;
    }
    blocks.push({ type: 'paragraph', text: paragraph.join(' ') });
  }

  return blocks;
}

function InlineText({ text, inverted }: { text: string; inverted: boolean }) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g).filter(Boolean);
  return (
    <Text className={inverted ? 'text-[15px] leading-6 text-white' : 'text-[15px] leading-6 text-zinc-900 dark:text-zinc-100'}>
      {parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <Text key={`${part}-${index}`} className="font-semibold">
              {part.slice(2, -2)}
            </Text>
          );
        }
        if (part.startsWith('*') && part.endsWith('*')) {
          return (
            <Text key={`${part}-${index}`} className="italic">
              {part.slice(1, -1)}
            </Text>
          );
        }
        if (part.startsWith('`') && part.endsWith('`')) {
          return (
            <Text
              key={`${part}-${index}`}
              style={{ fontFamily: Fonts.mono }}
              className={inverted ? 'text-[13px] text-sky-100' : 'text-[13px] text-sky-800 dark:text-sky-200'}>
              {part.slice(1, -1)}
            </Text>
          );
        }
        return <Text key={`${part}-${index}`}>{part}</Text>;
      })}
    </Text>
  );
}

export function ChatMarkdown({ text, inverted = false }: { text: string; inverted?: boolean }) {
  const blocks = parseBlocks(text);
  if (blocks.length === 0) {
    return null;
  }

  return (
    <View className="gap-2">
      {blocks.map((block, index) => {
        if (block.type === 'code') {
          return (
            <View key={`code-${index}`} className="overflow-hidden rounded-2xl bg-zinc-950">
              {block.language ? (
                <Text className="px-3 pt-2 text-[11px] font-semibold uppercase tracking-widest text-zinc-400">
                  {block.language}
                </Text>
              ) : null}
              <Text selectable style={{ fontFamily: Fonts.mono }} className="px-3 py-3 text-[13px] leading-5 text-zinc-100">
                {block.code}
              </Text>
            </View>
          );
        }
        if (block.type === 'heading') {
          return (
            <Text
              key={`heading-${index}`}
              className={inverted ? 'text-base font-semibold text-white' : 'text-base font-semibold text-zinc-950 dark:text-white'}>
              {block.text}
            </Text>
          );
        }
        if (block.type === 'list') {
          return (
            <View key={`list-${index}`} className="gap-1">
              {block.items.map((item, itemIndex) => (
                <View key={`${item}-${itemIndex}`} className="flex-row gap-2">
                  <Text className={inverted ? 'text-white' : 'text-zinc-500 dark:text-zinc-400'}>•</Text>
                  <View className="flex-1">
                    <InlineText text={item} inverted={inverted} />
                  </View>
                </View>
              ))}
            </View>
          );
        }
        return <InlineText key={`paragraph-${index}`} text={block.text} inverted={inverted} />;
      })}
    </View>
  );
}
