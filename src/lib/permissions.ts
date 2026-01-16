import { browser } from '$app/environment';
import { isTauri } from './platform';

export type PermissionState = 'granted' | 'denied' | 'prompt';

export interface PermissionResult {
	camera: PermissionState;
	permanentlyDenied?: boolean;
}

export async function checkCameraPermission(): Promise<PermissionResult> {
	if (!browser) {
		return { camera: 'prompt' };
	}

	if (isTauri()) {
		try {
			const { invoke } = await import('@tauri-apps/api/core');
			return await invoke<PermissionResult>('plugin:permissions|checkPermissions');
		} catch (e) {
			console.warn('Permission check failed, assuming prompt state:', e);
			return { camera: 'prompt' };
		}
	}

	try {
		const result = await navigator.permissions.query({ name: 'camera' as PermissionName });
		return { camera: result.state as PermissionState };
	} catch {
		return { camera: 'prompt' };
	}
}

export async function requestCameraPermission(): Promise<PermissionResult> {
	if (!browser) {
		return { camera: 'denied' };
	}

	if (isTauri()) {
		try {
			const { invoke } = await import('@tauri-apps/api/core');
			return await invoke<PermissionResult>('plugin:permissions|requestPermissions');
		} catch (e) {
			console.error('Permission request failed:', e);
			return { camera: 'denied', permanentlyDenied: false };
		}
	}

	try {
		const stream = await navigator.mediaDevices.getUserMedia({ video: true });
		stream.getTracks().forEach((track) => track.stop());
		return { camera: 'granted' };
	} catch (e) {
		const error = e as Error;
		if (error.name === 'NotAllowedError') {
			return { camera: 'denied' };
		}
		return { camera: 'denied' };
	}
}

export async function openAppSettings(): Promise<PermissionResult> {
	if (!isTauri()) {
		console.warn('openAppSettings is only available in Tauri/Android');
		return { camera: 'denied' };
	}

	try {
		const { invoke } = await import('@tauri-apps/api/core');
		return await invoke<PermissionResult>('plugin:permissions|openAppSettings');
	} catch (e) {
		console.error('Failed to open app settings:', e);
		return { camera: 'denied' };
	}
}

export async function isAndroid(): Promise<boolean> {
	if (!browser || !isTauri()) return false;
	return /android/i.test(navigator.userAgent);
}

export async function ensureCameraPermission(): Promise<{
	granted: boolean;
	permanentlyDenied: boolean;
}> {
	const isOnAndroid = await isAndroid();

	if (!isOnAndroid) {
		return { granted: true, permanentlyDenied: false };
	}

	let result = await checkCameraPermission();

	if (result.camera === 'granted') {
		return { granted: true, permanentlyDenied: false };
	}

	result = await requestCameraPermission();

	return {
		granted: result.camera === 'granted',
		permanentlyDenied: result.permanentlyDenied ?? false
	};
}
