import { Platform, NativeModules } from 'react-native';
import { normalizeMultilingualInput } from './calcNoteEngine';

const { SpeechRecognitionModule } = NativeModules;

export type VoiceTranscriptionState = {
  isRecording: boolean;
  transcript: string;
  error: string | null;
};

/**
 * Mathematical Speech-to-Text Parser
 * Converts conversational mathematical speech into clean formula expressions.
 * Fully supports English, Arabic, and Bangla spoken words and digits.
 */
export const normalizeSpokenMath = (transcript: string): string => {
  let text = transcript.toLowerCase();

  // Spoken number words mapping (English)
  const numberWords: Record<string, string> = {
    zero: '0',
    one: '1',
    two: '2',
    three: '3',
    four: '4',
    five: '5',
    six: '6',
    seven: '7',
    eight: '8',
    nine: '9',
    ten: '10',
    eleven: '11',
    twelve: '12',
    twenty: '20',
    thirty: '30',
    forty: '40',
    fifty: '50',
    sixty: '60',
    seventy: '70',
    eighty: '80',
    ninety: '90',
    hundred: '100',
    thousand: '1000',
    million: '1000000',
    // Bangla spoken numbers
    শূন্য: '0',
    এক: '1',
    দুই: '2',
    তিন: '3',
    চার: '4',
    পাঁচ: '5',
    ছয়: '6',
    সাত: '7',
    আট: '8',
    নয়: '9',
    দশ: '10',
    বিশ: '20',
    পঞ্চাশ: '50',
    একশত: '100',
    হাজার: '1000',
    লাখ: '100000',
    // Arabic spoken numbers
    صفر: '0',
    واحد: '1',
    اثنان: '2',
    اثنين: '2',
    ثلاثة: '3',
    أربعة: '4',
    اربعة: '4',
    خمسة: '5',
    ستة: '6',
    سبعة: '7',
    ثمانية: '8',
    تسعة: '9',
    عشرة: '10',
    عشرين: '20',
    خمسين: '50',
    مئة: '100',
    الف: '1000',
    ألف: '1000',
    مليون: '1000000',
  };

  // Convert basic number words
  Object.keys(numberWords).forEach((word) => {
    const reg = new RegExp(`(?<![a-zA-Z0-9_\\u0980-\\u09FF\\u0600-\\u06FF])${word}(?![a-zA-Z0-9_\\u0980-\\u09FF\\u0600-\\u06FF])`, 'gu');
    text = text.replace(reg, numberWords[word]);
  });

  // Normalize multilingual numerals and basic math operators
  text = normalizeMultilingualInput(text);

  // English Spoken Operators
  text = text.replace(/\bplus\b/g, '+');
  text = text.replace(/\bminus\b/g, '-');
  text = text.replace(/\btimes\b|\bmultiplied by\b/g, '*');
  text = text.replace(/\bdivided by\b|\bover\b/g, '/');
  text = text.replace(/\bpercent\b/g, '%');
  text = text.replace(/\bequals?\b/g, '=');

  // Powers and roots
  text = text.replace(/\bsquare root of\s*(\d+)/g, 'sqrt($1)');
  text = text.replace(/\bsquared\b/g, '^2');
  text = text.replace(/\bcubed\b/g, '^3');
  text = text.replace(/\bto the power of\s*(\d+)/g, '^$1');

  // Currencies
  text = text.replace(/\bus dollars?|\bdollars?\b/g, 'USD');
  text = text.replace(/\beuros?\b/g, 'EUR');
  text = text.replace(/\bpounds?\b/g, 'GBP');
  text = text.replace(/\byen\b/g, 'JPY');
  text = text.replace(/\brupees?\b/g, 'INR');

  // Line references
  text = text.replace(/\bline\s*(\d+)/gi, 'Line $1');
  text = text.replace(/\bprevious line\b|\blast line\b/gi, 'prev');

  // Control words
  text = text.replace(/\bnew line\b|\benter\b/gi, '\n');

  return text.trim();
};

export class LiveVoiceSession {
  private recognition: any = null;
  private isListening = false;
  private onResultCallback: ((text: string) => void) | null = null;
  private onErrorCallback: ((err: string) => void) | null = null;
  private onEndCallback: (() => void) | null = null;
  private language: 'en' | 'ar' | 'bn' = 'en';

  constructor(language: 'en' | 'ar' | 'bn' = 'en') {
    this.language = language;
    if ((Platform.OS as string) === 'web' && typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.lang = language === 'ar' ? 'ar-SA' : language === 'bn' ? 'bn-BD' : 'en-US';

        this.recognition.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            currentTranscript += event.results[i][0].transcript;
          }
          const parsed = normalizeSpokenMath(currentTranscript);
          this.onResultCallback?.(parsed);
        };

        this.recognition.onerror = (event: any) => {
          this.onErrorCallback?.(event.error || 'Voice error');
        };

        this.recognition.onend = () => {
          this.isListening = false;
          this.onEndCallback?.();
        };
      }
    }
  }

  public isSupported(): boolean {
    if ((Platform.OS as string) === 'web') {
      return !!this.recognition;
    }
    return !!SpeechRecognitionModule;
  }

  public async start(
    onResult: (text: string) => void,
    onError: (err: string) => void,
    onEnd: () => void
  ): Promise<boolean> {
    this.onResultCallback = onResult;
    this.onErrorCallback = onError;
    this.onEndCallback = onEnd;

    // 1. Android Native Speech Recognizer (Google Speech Services)
    if ((Platform.OS as string) === 'android' && SpeechRecognitionModule) {
      try {
        this.isListening = true;
        const recognizedText = await SpeechRecognitionModule.startListening(this.language);
        this.isListening = false;
        if (recognizedText && recognizedText.trim().length > 0) {
          const parsed = normalizeSpokenMath(recognizedText);
          this.onResultCallback?.(parsed);
        }
        this.onEndCallback?.();
        return true;
      } catch (err: any) {
        this.isListening = false;
        onError(err?.message || 'Speech recognition cancelled or not available');
        this.onEndCallback?.();
        return false;
      }
    }

    // 2. Web Speech API (Chrome / Edge / Safari)
    if (this.recognition) {
      try {
        this.recognition.start();
        this.isListening = true;
        return true;
      } catch (e: any) {
        onError(e.message || 'Could not start microphone');
        return false;
      }
    }

    // 3. Fallback
    this.isListening = false;
    onError('Speech recognition not directly available on this environment.');
    onEnd();
    return false;
  }

  public stop() {
    this.isListening = false;
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {
        console.warn(e);
      }
    }
    this.onEndCallback?.();
  }

  public getActive(): boolean {
    return this.isListening;
  }
}
