// ─────────────────────────────────────────────────────────────
// PermissionDashboardScreen
// Layout: SidebarNav (tablet) | App card grid | ScriptConsole
// Smart layer: reads permissions from store, passes to AppCard
// ─────────────────────────────────────────────────────────────
import React                      from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
}                                 from 'react-native';
import { useSafeAreaInsets }      from 'react-native-safe-area-context';

import HudBackground              from '../components/common/HudBackground';
import ScanlineOverlay            from '../components/common/ScanlineOverlay';
import HudTopBar                  from '../components/common/HudTopBar';
import LabelCaps                  from '../components/common/LabelCaps';
import SidebarNav                 from '../components/common/SidebarNav';
import AppCard                    from '../components/permissions/AppCard';
import ScriptConsole              from '../components/permissions/ScriptConsole';
import SystemHealthWidget         from '../components/permissions/SystemHealthWidget';

import {
  useAppStore,
  selectPermissions,
  selectIsOnline,
}                                 from '../store/appStore';
import { Colors }                 from '../constants/colors';
import { Typography }             from '../constants/typography';
import { Spacing }                from '../constants/spacing';

const PermissionDashboardScreen: React.FC = () => {
  const insets      = useSafeAreaInsets();
  const { width }   = useWindowDimensions();
  const isTablet    = width >= 768;

  const permissions    = useAppStore(selectPermissions);
  const isOnline       = useAppStore(selectIsOnline);
  const togglePermission = useAppStore((s) => s.togglePermission);
  const appendLog      = useAppStore((s) => s.appendLog);

  const handleRevokeAll = () => {
    permissions.forEach((p) => {
      if (p.status === 'authorized') togglePermission(p.appId);
    });
    appendLog('> PERM: All authorizations revoked.');
  };

  return (
    <View style={styles.root}>
      <HudBackground />
      <ScanlineOverlay />
      <HudTopBar statusLabel="[ZAYD_SECURITY_CONTROL_CENTER]" />

      <View style={[styles.layout, {
        paddingTop:    insets.top + 56,
        paddingBottom: insets.bottom + 64,
      }]}>

        {/* Sidebar — tablet only */}
        {isTablet && (
          <View style={styles.sidebar}>
            <SidebarNav activeItem="access_control" />
            <SystemHealthWidget />
          </View>
        )}

        {/* Main content */}
        <ScrollView
          style={styles.main}
          contentContainerStyle={styles.mainContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Dashboard header */}
          <View style={styles.dashHeader}>
            <View>
              <LabelCaps color={Colors.surfaceTint}>
                [ZAYD_PERMISSIONS_MODULE_002]
              </LabelCaps>
              <Text style={styles.dashTitle}>Authorized{'\n'}Applications</Text>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity
                onPress={handleRevokeAll}
                style={styles.btnOutline}
                activeOpacity={0.75}
              >
                <LabelCaps color={Colors.surfaceTint}>REVOKE_ALL</LabelCaps>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.btnFilled}
                activeOpacity={0.75}
                onPress={() => appendLog('> SCAN: Scanning for new modules...')}
              >
                <LabelCaps color={Colors.background}>SCAN_NEW_MOD</LabelCaps>
              </TouchableOpacity>
            </View>
          </View>

          {/* Empty state */}
          {permissions.length === 0 && (
            <View style={styles.emptyState}>
              <LabelCaps color={Colors.onSurfaceVariant}>
                No apps currently managed. Tap SCAN_NEW_MOD to add.
              </LabelCaps>
            </View>
          )}

          {/* App card grid */}
          <View style={styles.grid}>
            {permissions.map((perm) => (
              <View key={perm.appId} style={styles.gridItem}>
                <AppCard
                  permission={perm}
                  onToggle={togglePermission}
                />
              </View>
            ))}
          </View>

          {/* Script console */}
          <ScriptConsole />
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex:            1,
    backgroundColor: Colors.background,
  },
  layout: {
    flex:          1,
    flexDirection: 'row',
    paddingHorizontal: Spacing.containerPadding,
  },
  sidebar: {
    width:        240,
    marginRight:  Spacing.gutter,
    gap:          Spacing.gutter,
    paddingTop:   Spacing.gutter,
  },
  main: {
    flex: 1,
  },
  mainContent: {
    paddingTop:    Spacing.gutter,
    paddingBottom: Spacing.xxxl,
    gap:           Spacing.gutter,
  },
  dashHeader: {
    flexDirection:   'row',
    justifyContent:  'space-between',
    alignItems:      'flex-end',
    paddingBottom:   Spacing.gutter,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceTint + '33',
    flexWrap:        'wrap',
    gap:             Spacing.gutter,
  },
  dashTitle: {
    ...Typography.displayLg,
    color:       Colors.primary,
    fontSize:    32,
    lineHeight:  38,
    marginTop:   Spacing.xs,
    textTransform: 'uppercase',
  },
  headerActions: {
    flexDirection: 'row',
    gap:           Spacing.gutter,
    flexWrap:      'wrap',
  },
  btnOutline: {
    paddingHorizontal: Spacing.containerPadding,
    paddingVertical:   Spacing.sm,
    borderWidth:       1,
    borderColor:       Colors.surfaceTint,
  },
  btnFilled: {
    paddingHorizontal: Spacing.containerPadding,
    paddingVertical:   Spacing.sm,
    backgroundColor:   Colors.surfaceTint,
    shadowColor:       Colors.surfaceTint,
    shadowOffset:      { width: 0, height: 0 },
    shadowOpacity:     0.5,
    shadowRadius:      15,
    elevation:         6,
  },
  emptyState: {
    paddingVertical: Spacing.xxxl,
    alignItems:      'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap:      'wrap',
    gap:           Spacing.gutter,
  },
  gridItem: {
    flex:     1,
    minWidth: 280,
  },
});

export default PermissionDashboardScreen;
