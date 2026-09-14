package com.zaynmiraj.calmaster

import android.app.Activity
import android.content.Intent
import android.os.Handler
import android.os.Looper
import android.speech.RecognizerIntent
import com.facebook.react.bridge.ActivityEventListener
import com.facebook.react.bridge.BaseActivityEventListener
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class SpeechRecognitionModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    private val SPEECH_REQUEST_CODE = 4129
    private var pendingPromise: Promise? = null

    private val activityEventListener: ActivityEventListener = object : BaseActivityEventListener() {
        override fun onActivityResult(
            activity: Activity?,
            requestCode: Int,
            resultCode: Int,
            data: Intent?
        ) {
            if (requestCode == SPEECH_REQUEST_CODE) {
                if (resultCode == Activity.RESULT_OK && data != null) {
                    val results = data.getStringArrayListExtra(RecognizerIntent.EXTRA_RESULTS)
                    if (!results.isNullOrEmpty()) {
                        pendingPromise?.resolve(results[0])
                    } else {
                        pendingPromise?.resolve("")
                    }
                } else {
                    pendingPromise?.resolve("")
                }
                pendingPromise = null
            }
        }
    }

    init {
        reactContext.addActivityEventListener(activityEventListener)
    }

    override fun getName(): String = "SpeechRecognitionModule"

    @ReactMethod
    fun isAvailable(promise: Promise) {
        val pm = reactApplicationContext.packageManager
        val activities = pm.queryIntentActivities(Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH), 0)
        promise.resolve(activities.isNotEmpty())
    }

    @ReactMethod
    fun startListening(langCode: String, promise: Promise) {
        val currentActivity = currentActivity
        if (currentActivity == null) {
            promise.reject("ACTIVITY_NOT_FOUND", "Current activity is null")
            return
        }

        Handler(Looper.getMainLooper()).post {
            try {
                pendingPromise = promise
                val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
                    putExtra(
                        RecognizerIntent.EXTRA_LANGUAGE_MODEL,
                        RecognizerIntent.LANGUAGE_MODEL_FREE_FORM
                    )
                    val locale = when (langCode.lowercase()) {
                        "ar" -> "ar-SA"
                        "bn" -> "bn-BD"
                        else -> "en-US"
                    }
                    putExtra(RecognizerIntent.EXTRA_LANGUAGE, locale)
                    putExtra(RecognizerIntent.EXTRA_LANGUAGE_PREFERENCE, locale)
                    putExtra(RecognizerIntent.EXTRA_ONLY_RETURN_LANGUAGE_PREFERENCE, locale)
                    putExtra(RecognizerIntent.EXTRA_PROMPT, "Speak calculations...")
                }
                currentActivity.startActivityForResult(intent, SPEECH_REQUEST_CODE)
            } catch (e: Exception) {
                pendingPromise = null
                promise.reject("SPEECH_ERROR", e.message, e)
            }
        }
    }
}
