package dev.skeen

import android.Manifest
import android.app.Activity
import android.content.Intent
import android.net.Uri
import android.provider.Settings
import androidx.activity.result.ActivityResult
import app.tauri.PermissionState
import app.tauri.annotation.ActivityCallback
import app.tauri.annotation.Command
import app.tauri.annotation.Permission
import app.tauri.annotation.PermissionCallback
import app.tauri.annotation.TauriPlugin
import app.tauri.plugin.Invoke
import app.tauri.plugin.JSObject
import app.tauri.plugin.Plugin

@TauriPlugin(
    permissions = [
        Permission(strings = [Manifest.permission.CAMERA], alias = "camera")
    ]
)
class PermissionPlugin(private val activity: Activity) : Plugin(activity) {

    @Command
    override fun checkPermissions(invoke: Invoke) {
        val result = JSObject()
        result.put("camera", getPermissionState("camera").toString().lowercase())
        invoke.resolve(result)
    }

    @Command
    override fun requestPermissions(invoke: Invoke) {
        if (getPermissionState("camera") == PermissionState.GRANTED) {
            val result = JSObject()
            result.put("camera", "granted")
            result.put("permanentlyDenied", false)
            invoke.resolve(result)
        } else {
            requestPermissionForAlias("camera", invoke, "cameraPermissionCallback")
        }
    }

    @PermissionCallback
    private fun cameraPermissionCallback(invoke: Invoke) {
        val result = JSObject()
        val state = getPermissionState("camera")
        result.put("camera", state.toString().lowercase())
        
        val permanentlyDenied = state == PermissionState.DENIED && 
            !activity.shouldShowRequestPermissionRationale(Manifest.permission.CAMERA)
        result.put("permanentlyDenied", permanentlyDenied)
        
        invoke.resolve(result)
    }

    @Command
    fun openAppSettings(invoke: Invoke) {
        val intent = Intent(
            Settings.ACTION_APPLICATION_DETAILS_SETTINGS,
            Uri.fromParts("package", activity.packageName, null)
        )
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        startActivityForResult(invoke, intent, "openSettingsCallback")
    }

    @ActivityCallback
    private fun openSettingsCallback(invoke: Invoke, result: ActivityResult) {
        val permResult = JSObject()
        permResult.put("camera", getPermissionState("camera").toString().lowercase())
        invoke.resolve(permResult)
    }
}
