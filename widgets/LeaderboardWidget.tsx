import { HStack, Image, Spacer, Text, VStack } from '@expo/ui/swift-ui';
import { containerBackground, font, foregroundStyle, padding } from '@expo/ui/swift-ui/modifiers';
import { createWidget, type WidgetEnvironment } from 'expo-widgets';

export type LeaderboardWidgetEntry = {
  rank: number;
  name: string;
  score: number;
};

type LeaderboardWidgetProps = {
  entries: LeaderboardWidgetEntry[];
};

function LeaderboardWidgetLayout(props: LeaderboardWidgetProps, environment: WidgetEnvironment) {
  'widget';

  const medalColors: Record<number, string> = { 1: '#e3b23c', 2: '#b9bec7', 3: '#c2793f' };
  const entries = props.entries ?? [];
  const isDark = environment.colorScheme !== 'light';

  const background = isDark ? '#16171f' : '#faf6ec';
  const accent = '#e3a83b';
  const textColor = isDark ? '#f2ede2' : '#242018';
  const mutedColor = isDark ? '#807d76' : '#8a8578';

  const rows = [
    <Text key="title" modifiers={[font({ textStyle: 'footnote', weight: 'bold' }), foregroundStyle(accent)]}>
      TOP BOUNTY HUNTERS
    </Text>,
    <Text key="subtitle" modifiers={[font({ textStyle: 'caption' }), foregroundStyle(mutedColor)]}>
      Unique Kills
    </Text>,
    ...entries.map((entry) => (
      <HStack key={entry.rank} spacing={8}>
        {medalColors[entry.rank] ? (
          <Image
            systemName={`${entry.rank}.circle.fill` as never}
            size={18}
            color={medalColors[entry.rank]}
          />
        ) : (
          <Text modifiers={[font({ textStyle: 'body' }), foregroundStyle(mutedColor)]}>
            {entry.rank}.
          </Text>
        )}
        <Text modifiers={[font({ textStyle: 'body', weight: 'medium' }), foregroundStyle(textColor)]}>
          {entry.name}
        </Text>
        <Spacer />
        <Text modifiers={[font({ textStyle: 'body', weight: 'bold' }), foregroundStyle(accent)]}>
          {entry.score}
        </Text>
      </HStack>
    )),
  ];

  return (
    <VStack
      alignment="leading"
      spacing={9}
      modifiers={[padding({ all: 16 }), containerBackground(background, 'widget')]}>
      {rows}
    </VStack>
  );
}

const LeaderboardWidget = createWidget<LeaderboardWidgetProps>(
  'LeaderboardWidget',
  LeaderboardWidgetLayout
);

export default LeaderboardWidget;
