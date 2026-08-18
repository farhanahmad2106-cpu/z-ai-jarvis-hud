// ─────────────────────────────────────────────────────────────
// Z-AI — Permission Type Definitions
// ─────────────────────────────────────────────────────────────

export type PermissionStatus = 'authorized' | 'restricted';

export interface AppPermission {
  appId:       string;         // unique identifier, e.g. 'whatsapp'
  name:        string;         // display name, e.g. 'WhatsApp'
  description: string;         // what access this app has
  icon:        string;         // Ionicons icon name (used in AppCard)
  uid:         string;         // short UID label, e.g. 'WS_APP_01'
  status:      PermissionStatus;
  tier:        1 | 2;          // tier 2 = can execute shell scripts
}

// ── API shapes ───────────────────────────────────────────────

export interface PermissionUpdatePayload {
  appId:  string;
  status: PermissionStatus;
}

export interface PermissionListResponse {
  permissions: AppPermission[];
}

// ── Default app list (shown before API resolves) ─────────────
export const DEFAULT_PERMISSIONS: AppPermission[] = [
  {
    appId:       'whatsapp',
    name:        'WhatsApp',
    description: 'Full access to encrypted communications and media streams.',
    icon:        'chatbubble-ellipses-outline',
    uid:         'WS_APP_01',
    status:      'authorized',
    tier:        1,
  },
  {
    appId:       'vscode',
    name:        'VS Code',
    description: 'Binary execution, file system hooks, and extension engine control.',
    icon:        'terminal-outline',
    uid:         'VSC_X_02',
    status:      'authorized',
    tier:        2,
  },
  {
    appId:       'browser',
    name:        'Web Browser',
    description: 'External network request capability and cookies store access.',
    icon:        'globe-outline',
    uid:         'NET_BR_03',
    status:      'restricted',
    tier:        1,
  },
];
