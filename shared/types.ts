export type DeviceStatus = 'online' | 'offline' | 'error';
export interface Device {
  id: string;
  name: string;
  status: DeviceStatus;
  lastSeen: string;
  os: 'webOS' | 'Tizen' | 'Android TV' | 'ChromeOS';
  ip: string;
  memoryUsage: number; // Percentage
  uptime: string;
}
export interface LogEvent {
  id: string;
  deviceId: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  timestamp: string;
  meta?: Record<string, any>;
}
export interface NetworkEvent {
  id: string;
  deviceId: string;
  method: string;
  url: string;
  status: number;
  duration: number;
  timestamp: string;
}
export interface Command {
  id: string;
  deviceId: string;
  action: 'reload' | 'clear_cache' | 'screenshot' | 'reboot';
  status: 'pending' | 'sent' | 'executed' | 'failed';
  timestamp: string;
}
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}