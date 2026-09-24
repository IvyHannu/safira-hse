export type SemanticStatus = 'success' | 'warning' | 'critical' | 'information';
export type Json =
  string | number | boolean | null | Json[] | { [key: string]: Json };
export type * from './database';
export * from './auth';
