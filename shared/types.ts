export type DeviceStatus = 'online' | 'offline' | 'error' | 'maintenance';
export interface MetricData {
  timestamp: string;
  cpu: number;
  memory: number;
  fps: number;
  battery?: number;
}
export interface NetworkDetail {
  id: string;
  deviceId: string;
  method: string;
  url: string;
  status: number;
  duration: number;
  requestHeaders?: Record<string, string>;
  responseHeaders?: Record<string, string>;
  type: 'fetch' | 'xhr' | 'beacon' | 'websocket' | 'media';
  timestamp: string;
}
export interface SystemAlert {
  id: string;
  deviceId: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  type: 'memory_leak' | 'connection_lost' | 'script_error' | 'high_cpu' | 'security_violation';
  timestamp: string;
  resolved: boolean;
}
export interface Device {
  id: string;
  name: string;
  status: DeviceStatus;
  lastSeen: string;
  os: 'webOS' | 'Tizen' | 'Android TV' | 'ChromeOS';
  ip: string;
  memoryUsage: number;
  uptime: string;
  version: string;
  protocol: 'JSON' | 'MsgPack_Sim' | 'Encrypted';
  enrolledAt: string;
  isPublic?: boolean;
  location?: string;
}
export interface LogEvent {
  id: string;
  deviceId: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  timestamp: string;
  meta?: Record<string, any>;
  redacted?: boolean;
  transport?: string;
}
export interface Command {
  id: string;
  deviceId: string;
  action: 'reload' | 'clear_cache' | 'screenshot' | 'reboot' | 'update_config' | 'eval_sandbox';
  status: 'pending' | 'sent' | 'executed' | 'failed';
  timestamp: string;
  payload?: any;
  result?: any;
  sandboxMode?: 'MainThread' | 'DedicatedWorker';
}
export interface EnrollmentToken {
  token: string;
  expiresAt: string;
  orgId: string;
  roles: string[];
}
export interface PIIRedactionConfig {
  enabled: boolean;
  keys: string[];
  patterns: string[];
}
export interface ComplianceRequest {
  id: string;
  type: 'export' | 'delete';
  target: 'user_id' | 'device_id';
  targetValue: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  requestedAt: string;
  completedAt?: string;
  resultUrl?: string;
}
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}