package com.bookingappnative

import android.content.Context
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import java.io.File
import java.io.FileOutputStream
import java.io.InputStream

class AssetFileModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "AssetFileModule"
    }

    @ReactMethod
    fun copyAssetToFiles(assetName: String, promise: Promise) {
        try {
            val context: Context = reactApplicationContext
            val destDir = File(context.filesDir, "assets")
            if (!destDir.exists()) {
                destDir.mkdirs()
            }
            
            val destFile = File(destDir, assetName)
            
            // Always overwrite the file to ensure we have the latest version from assets
            // Delete existing file if it exists
            if (destFile.exists()) {
                destFile.delete()
            }
            
            // Copy from assets
            val inputStream: InputStream = context.assets.open(assetName)
            val outputStream = FileOutputStream(destFile)
            
            inputStream.use { input ->
                outputStream.use { output ->
                    input.copyTo(output)
                }
            }
            
            promise.resolve(destFile.absolutePath)
        } catch (e: Exception) {
            promise.reject("ASSET_COPY_ERROR", "Failed to copy asset file: ${e.message}", e)
        }
    }
}

