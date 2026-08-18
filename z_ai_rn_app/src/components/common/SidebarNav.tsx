// ─────────────────────────────────────────────────────────────
// SidebarNav — Left drawer navigation panel
// Moved to common/ — used by PermissionDashboardScreen + OfflineHudScreen
// (Code review fix R-03)
//
// Props:
//   activeItem  — which item is highlighted
//   errorMode   — true on offline screen (red left-border accent)
//   statusLabel — bottom status line (e.g. "MOD_082_CONNECTED")
// ─────────────────────────────────────────────────────────────
import React                from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ImageSourcePropType,
}                           from 'react-native';
import { Ionicons }         from '@expo/vector-icons';
import GlassPanel           from './GlassPanel';
import LabelCaps            from './LabelCaps';
import { Colors }           from '../../constants/colors';
import { Typography }       from '../../constants/typography';
import { Spacing, Radius }  from '../../constants/spacing';

export type NavItemId =
  | 'system_logs'
  | 'access_control'
  | 'network_topology'
  | 'core_diagnostics';

interface NavItem {
  id:    NavItemId;
  label: string;
  icon:  string; // Ionicons name
}

const NAV_ITEMS: NavItem[] = [
  { id: 'system_logs',      label: 'System Logs',      icon: 'document-text-outline' },
  { id: 'access_control',   label: 'Access Control',   icon: 'shield-outline' },
  { id: 'network_topology', label: 'Network Topology', icon: 'git-network-outline' },
  { id: 'core_diagnostics', label: 'Core Diagnostics', icon: 'hardware-chip-outline' },
];

interface SidebarNavProps {
  activeItem?:    NavItemId;
  errorMode?:     boolean;
  statusLabel?:   string;    // e.g. 'MOD_082_CONNECTED' or 'MOD_082_OFFLINE'
  onItemPress?:   (id: NavItemId) => void;
  avatarSource?:  ImageSourcePropType;
}

const SidebarNav: React.FC<SidebarNavProps> = ({
  activeItem   = 'access_control',
  errorMode    = false,
  statusLabel  = 'MOD_082_CONNECTED',
  onItemPress,
  avatarSource,
}) => {
  const accentColor = errorMode ? Colors.offlineError : Colors.surfaceTint;
  const statusColor = errorMode ? Colors.error         : Colors.onSurfaceVariant;

  return (
    <GlassPanel
      variant={errorMode ? 'error' : 'default'}
      style={styles.container}
    >
      {/* Profile header */}
      <View style={styles.profile}>
        <View style={[styles.avatarRing, { borderColor: accentColor }]}>
          {avatarSource ? (
            <Image source={avatarSource} style={styles.avatar} />
          ) : (
            <View style={[styles.avatarPlaceholder, { backgroundColor: accentColor + '33' }]}>
              <Ionicons name="person-outline" size={20} color={accentColor} />
            </View>
          )}
        </View>
        <View>
          <LabelCaps color={accentColor}>SYSTEM_ADMIN</LabelCaps>
          <Text style={[styles.statusText, { color: statusColor }]}>
            {statusLabel}
          </Text>
        </View>
      </View>

      {/* Nav items */}
      <View style={styles.navList}>
        {NAV_ITEMS.map((item) => {
          const isActive = item.id === activeItem;
          const itemColor = isActive ? accentColor : Colors.onSurfaceVariant;

          return (
            <TouchableOpacity
              key={item.id}
              onPress={() => onItemPress?.(item.id)}
              activeOpacity={0.7}
              style={[
                styles.navItem,
                isActive && {
                  backgroundColor: Colors.surfaceVariant + '66',
                  borderLeftWidth: 4,
                  borderLeftColor: accentColor,
                },
              ]}
            >
              <Ionicons
                name={(item.icon as any)}
                size={18}
                color={itemColor}
              />
              <Text style={[styles.navLabel, { color: itemColor,
                opacity: isActive ? 1 : 0.7 }]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </GlassPanel>
  );
};

const styles = StyleSheet.create({
  container: {
    width:   240,
    padding: 0,
    overflow: 'hidden',
  },
  profile: {
    flexDirection:  'row',
    alignItems:     'center',
    gap:            Spacing.md,
    padding:        Spacing.containerPadding,
    borderBottomWidth: 1,
    borderBottomColor: Colors.outlineVariant + '50',
  },
  avatarRing: {
    width:        44,
    height:       44,
    borderRadius: 22,
    borderWidth:  1,
    overflow:     'hidden',
    alignItems:   'center',
    justifyContent: 'center',
  },
  avatar: {
    width:        '100%',
    height:       '100%',
    borderRadius: 22,
  },
  avatarPlaceholder: {
    width:          '100%',
    height:         '100%',
    alignItems:     'center',
    justifyContent: 'center',
  },
  statusText: {
    ...Typography.dataMonoXs,
    marginTop: 2,
  },
  navList: {
    paddingVertical: Spacing.sm,
  },
  navItem: {
    flexDirection:  'row',
    alignItems:     'center',
    gap:            Spacing.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.gutter,
    borderLeftWidth: 0, // reset — active sets this
  },
  navLabel: {
    ...Typography.dataMono,
  },
});

export default SidebarNav;
