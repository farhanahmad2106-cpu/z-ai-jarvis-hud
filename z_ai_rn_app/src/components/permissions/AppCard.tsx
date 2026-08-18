// ─────────────────────────────────────────────────────────────
// AppCard — Permission app card with glass panel + toggle
// Used in a grid on PermissionDashboardScreen
// ─────────────────────────────────────────────────────────────
import React                      from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons }               from '@expo/vector-icons';
import GlassPanel                 from '../common/GlassPanel';
import LabelCaps                  from '../common/LabelCaps';
import HolographicToggle          from './HolographicToggle';
import { AppPermission }          from '../../types/permissions';
import { Colors }                 from '../../constants/colors';
import { Typography }             from '../../constants/typography';
import { Spacing }                from '../../constants/spacing';

interface AppCardProps {
  permission: AppPermission;
  onToggle:   (appId: string) => void;
}

const AppCard: React.FC<AppCardProps> = ({ permission, onToggle }) => {
  const isAuthorized = permission.status === 'authorized';
  const accentColor  = isAuthorized ? Colors.surfaceTint : Colors.outline;

  return (
    <GlassPanel
      variant={isAuthorized ? 'accent' : 'default'}
      style={[
        styles.card,
        !isAuthorized && styles.cardRestricted,
      ]}
    >
      {/* Header row: icon + UID */}
      <View style={styles.header}>
        <View style={[styles.iconBox, {
          borderColor: accentColor + '4D',
        }]}>
          <Ionicons
            name={(permission.icon as any)}
            size={22}
            color={accentColor}
          />
        </View>
        <Text style={[styles.uid, { color: accentColor + '99' }]}>
          {permission.uid}
        </Text>
      </View>

      {/* App name + description */}
      <Text style={styles.name}>{permission.name}</Text>
      <Text style={styles.description}>{permission.description}</Text>

      {/* Footer: status label + toggle */}
      <View style={styles.footer}>
        <LabelCaps color={accentColor}>
          {isAuthorized ? 'AUTHORIZED' : 'RESTRICTED'}
        </LabelCaps>
        <HolographicToggle
          value={isAuthorized}
          onToggle={() => onToggle(permission.appId)}
        />
      </View>
    </GlassPanel>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: Spacing.containerPadding,
    flex:    1,
    minWidth: 160,
  },
  cardRestricted: {
    opacity: 0.8,
  },
  header: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'flex-start',
    marginBottom:   Spacing.gutter,
  },
  iconBox: {
    width:           40,
    height:          40,
    borderRadius:    4,
    borderWidth:     1,
    backgroundColor: Colors.surfaceVariant,
    alignItems:      'center',
    justifyContent:  'center',
  },
  uid: {
    ...Typography.dataMonoXs,
  },
  name: {
    ...Typography.headlineMdMobile,
    color:        Colors.onSurface,
    marginBottom: Spacing.xs,
  },
  description: {
    ...Typography.bodySm,
    color:        Colors.onSurfaceVariant,
    marginBottom: Spacing.gutter,
    flexShrink:   1,
  },
  footer: {
    flexDirection:   'row',
    justifyContent:  'space-between',
    alignItems:      'center',
    borderTopWidth:  1,
    borderTopColor:  Colors.outlineVariant,
    paddingTop:      Spacing.gutter,
    marginTop:       'auto',
  },
});

export default AppCard;
