// src/lib/auth/guard.ts
// Route protection utilities for SchoolCBT
import { browser } from '$app/environment';
import { authStore, type UserRole } from '$lib/stores';
import { get } from 'svelte/store';

export function isAuthenticated(): boolean {
  return get(authStore) !== null;
}

export function hasRole(role: UserRole): boolean {
  const user = get(authStore);
  return user?.role === role;
}

export function requireAuth(redirectTo = '/') {
  if (!browser) return false;
  if (!isAuthenticated()) {
    window.location.href = redirectTo;
    return false;
  }
  return true;
}

export function requireRole(role: UserRole, redirectTo = '/') {
  if (!browser) return false;
  if (!isAuthenticated()) {
    window.location.href = redirectTo;
    return false;
  }
  if (!hasRole(role)) {
    window.location.href = '/dashboard'; // redirect to appropriate dashboard
    return false;
  }
  return true;
}
