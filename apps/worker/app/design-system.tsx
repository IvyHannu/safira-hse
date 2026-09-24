import { useState } from 'react';
import { Redirect } from 'expo-router';
import House from 'phosphor-react-native/src/icons/House';
import ListChecks from 'phosphor-react-native/src/icons/ListChecks';
import UserCircle from 'phosphor-react-native/src/icons/UserCircle';
import { colors, spacing } from '@safira/design-tokens';
import { StyleSheet, Text, View } from 'react-native';
import {
  AppCard,
  BottomNavigationShell,
  Button,
  EmptyState,
  InlineAlert,
  ScreenContainer,
  SectionHeader,
  SelectableCard,
  StatusBadge,
  TextInput,
} from '@/components/ui';

export default function DesignSystemRoute() {
  if (!__DEV__) return <Redirect href="/" />;
  return <DesignSystemShowcase />;
}

function DesignSystemShowcase() {
  const [selected, setSelected] = useState('one');
  const [navigation, setNavigation] = useState('home');
  const [text, setText] = useState('');
  return (
    <ScreenContainer
      bottomNavigation={
        <BottomNavigationShell
          items={[
            {
              key: 'home',
              label: 'Home',
              icon: <House size={24} color={colors.graphite} />,
            },
            {
              key: 'tasks',
              label: 'Tasks',
              icon: <ListChecks size={24} color={colors.graphite} />,
            },
            {
              key: 'profile',
              label: 'Profile',
              icon: <UserCircle size={24} color={colors.graphite} />,
            },
          ]}
          selectedKey={navigation}
          onSelect={setNavigation}
        />
      }
    >
      <SectionHeader
        title="Worker design system"
        description="Development showcase. No product data or actions."
      />

      <View style={styles.section}>
        <SectionHeader
          title="Buttons"
          description="Large touch targets with clear actions."
        />
        <Button label="Primary action" onPress={() => {}} />
        <Button
          label="Secondary action"
          variant="secondary"
          onPress={() => {}}
        />
        <Button label="Tertiary action" variant="tertiary" onPress={() => {}} />
        <Button
          label="Destructive action"
          variant="destructive"
          onPress={() => {}}
        />
        <Button label="Working" loading onPress={() => {}} />
        <Button label="Unavailable" disabled onPress={() => {}} />
      </View>

      <View style={styles.section}>
        <SectionHeader title="Text input" />
        <TextInput
          label="Short answer"
          helperText="Use plain language."
          value={text}
          onChangeText={setText}
          placeholder="Type here"
        />
        <TextInput
          label="Needs attention"
          error="This field is required."
          value=""
          onChangeText={() => {}}
        />
        <TextInput label="Disabled input" disabled value="Unavailable" />
      </View>

      <View style={styles.section}>
        <SectionHeader title="Selectable cards" />
        <SelectableCard
          title="Option one"
          description="A concise explanation."
          selected={selected === 'one'}
          onPress={() => setSelected('one')}
        />
        <SelectableCard
          title="Option two"
          description="Another clear choice."
          selected={selected === 'two'}
          onPress={() => setSelected('two')}
        />
        <SelectableCard
          title="Disabled option"
          selected={false}
          disabled
          onPress={() => {}}
        />
      </View>

      <View style={styles.section}>
        <SectionHeader title="Status and feedback" />
        <View style={styles.badges}>
          <StatusBadge tone="success" label="Complete" />
          <StatusBadge tone="warning" label="Needs attention" />
          <StatusBadge tone="critical" label="Critical" />
          <StatusBadge tone="information" label="In progress" />
        </View>
        <InlineAlert
          tone="success"
          title="Success"
          message="The action completed."
        />
        <InlineAlert
          tone="warning"
          title="Warning"
          message="Review this information."
        />
        <InlineAlert
          tone="critical"
          title="Critical"
          message="Action is needed."
        />
        <InlineAlert
          tone="information"
          title="Information"
          message="An update is available."
        />
      </View>

      <View style={styles.section}>
        <SectionHeader title="Containers" />
        <AppCard title="App card">
          <Text style={styles.body}>A flexible content container.</Text>
        </AppCard>
        <EmptyState
          title="Nothing here yet"
          description="This state explains what to expect next."
          action={
            <Button
              label="Example action"
              variant="secondary"
              onPress={() => {}}
            />
          }
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  section: { gap: spacing[2] },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[1] },
  body: { color: colors.graphite },
});
