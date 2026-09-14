import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { I18nManager } from 'react-native';

export type SupportedLanguage = 'en' | 'ar' | 'bn';

export type LanguageConfig = {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag: string;
  isRTL: boolean;
};

export const SUPPORTED_LANGUAGES: Record<SupportedLanguage, LanguageConfig> = {
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English (US)',
    flag: '🇺🇸',
    isRTL: false,
  },
  ar: {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    flag: '🇸🇦',
    isRTL: true,
  },
  bn: {
    code: 'bn',
    name: 'Bangla',
    nativeName: 'বাংলা',
    flag: '🇧🇩',
    isRTL: false,
  },
};

export type Translations = {
  // Navigation
  navCalcNote: string;
  navLedger: string;
  navSettings: string;

  // Header & Modes
  calcNoteTitle: string;
  keypadTitle: string;
  smartNotepad: string;
  keypadCalc: string;
  modeScientific: string;
  modeStandard: string;

  // CalcNote
  grandTotal: string;
  solved: string;
  lines: string;
  export: string;
  aiInsights: string;
  newDocument: string;
  newNote: string;
  untitledDoc: string;
  deleteDocument: string;
  documentsSheet: string;
  voiceMath: string;
  searchDocs: string;
  editorPlaceholder: string;
  addLine: string;
  copyTotal: string;
  clearNote: string;
  clearNoteConfirm: string;
  loadSample: string;
  quickGuideTitle: string;
  guideMathText: string;
  guideLineRef: string;
  guideCurrency: string;
  guideAiVoice: string;

  // Actions
  copy: string;
  copied: string;
  paste: string;
  pasted: string;
  moreOptions: string;
  noteActions: string;
  newCalculationNote: string;
  share: string;
  cancel: string;
  close: string;
  back: string;
  done: string;
  clear: string;
  delete: string;
  save: string;
  edit: string;
  all: string;
  today: string;
  yesterday: string;
  totalCalculations: string;
  ledgerEmptyTitle: string;
  ledgerEmptyDesc: string;
  searchHistoryPlaceholder: string;
  loadDemoCalculations: string;
  startCalculating: string;
  zeroMatches: string;
  clearFilter: string;

  // Export
  exportModalTitle: string;
  printPdf: string;
  printPdfDesc: string;
  visualReceipt: string;
  visualReceiptDesc: string;
  plainText: string;
  plainTextDesc: string;
  downloadPng: string;
  printPdfButton: string;
  digitalReceiptTitle: string;
  documentSheetTitle: string;

  // Settings
  preferencesTitle: string;
  preferencesSubtitle: string;
  languageSection: string;
  languageLabel: string;
  languageDesc: string;
  aiSection: string;
  aiStatusTitle: string;
  aiStatusDesc: string;
  aiSummariesLabel: string;
  aiSummariesDesc: string;
  aiPrivacyNotice: string;
  themeSection: string;
  darkModeLabel: string;
  darkModeDesc: string;
  themePaletteLabel: string;
  calculationSection: string;
  precisionLabel: string;
  angleUnitLabel: string;
  currencyLabel: string;
  sensorySection: string;
  hapticsLabel: string;
  hapticsDesc: string;
  ledgerSection: string;
  retentionLabel: string;
  purgeHistoryLabel: string;
  purgeConfirmTitle: string;
  purgeConfirmMsg: string;
  purgeButton: string;
  backupSection: string;
  exportBackupLabel: string;
  aboutSection: string;
  versionLabel: string;
  privacyBadge: string;
};

const TRANSLATIONS: Record<SupportedLanguage, Translations> = {
  en: {
    navCalcNote: 'CalcNote',
    navLedger: 'Ledger',
    navSettings: 'Settings',

    calcNoteTitle: 'CalcNote',
    keypadTitle: 'Keypad',
    smartNotepad: 'Smart Notepad',
    keypadCalc: 'Keypad Calc',
    modeScientific: 'Scientific',
    modeStandard: 'Standard',

    grandTotal: 'GRAND TOTAL',
    solved: 'SOLVED',
    lines: 'lines',
    export: 'Export',
    aiInsights: 'AI Insights',
    newDocument: 'New Document',
    newNote: 'New Note',
    untitledDoc: 'Untitled Calculation',
    deleteDocument: 'Delete Document',
    documentsSheet: 'Saved Calculation Sheets',
    voiceMath: 'Voice Math',
    searchDocs: 'Search documents...',
    editorPlaceholder: "Type notes & calculations, e.g. Salary: $5,000",
    addLine: 'Add Line',
    copyTotal: 'Copy Total',
    clearNote: 'Clear Note',
    clearNoteConfirm: 'Are you sure you want to clear all calculations in this note?',
    loadSample: 'Load Sample Calculation',
    quickGuideTitle: 'Smart Calculation Guide',
    guideMathText: 'Mix text & math: Coffee 4 * 3.50',
    guideLineRef: 'Link lines: Line 1 + 15%',
    guideCurrency: 'Currencies: 100 USD to EUR',
    guideAiVoice: 'Voice & AI: Tap mic to speak or convert',

    copy: 'Copy',
    copied: 'Copied!',
    paste: 'Paste',
    pasted: 'Pasted!',
    moreOptions: 'More Options',
    noteActions: 'Note Actions',
    newCalculationNote: 'New Calculation Note',
    share: 'Share',
    cancel: 'Cancel',
    close: 'Close',
    back: 'Back',
    done: 'Done',
    clear: 'Clear',
    delete: 'Delete',
    save: 'Save',
    edit: 'Edit',
    all: 'All',
    today: 'Today',
    yesterday: 'Yesterday',
    totalCalculations: 'Total Calculations',
    ledgerEmptyTitle: 'Tape Ledger Empty',
    ledgerEmptyDesc: 'Your evaluated equations and mathematical operations will be logged here.',
    searchHistoryPlaceholder: 'Search equations, notes or results...',
    loadDemoCalculations: 'Load Demo Calculations',
    startCalculating: 'Start Calculating',
    zeroMatches: 'Zero Matches',
    clearFilter: 'Clear Filter',

    exportModalTitle: 'Export Document',
    printPdf: 'Printable PDF Document',
    printPdfDesc: 'High-fidelity formatted sheet with calculation table & grand total',
    visualReceipt: 'Visual PNG Receipt',
    visualReceiptDesc: 'High-resolution digital receipt card ready to preview, save or share',
    plainText: 'Plain Text / Markdown',
    plainTextDesc: 'Clean text equations with formatted results for messages or notes',
    downloadPng: 'Download PNG',
    printPdfButton: 'Print / Save PDF',
    digitalReceiptTitle: 'Digital Receipt',
    documentSheetTitle: 'Document Sheet',

    preferencesTitle: 'Preferences',
    preferencesSubtitle: 'CUSTOMIZATION & INTELLIGENCE',
    languageSection: 'Language & Region',
    languageLabel: 'Display Language',
    languageDesc: 'Choose your interface language',
    aiSection: 'AI & Smart Features',
    aiStatusTitle: 'Financial Intelligence Engine',
    aiStatusDesc: 'Built-in automated analysis, summaries & voice math',
    aiSummariesLabel: 'Document Financial Insights',
    aiSummariesDesc: 'Auto-extract cost drivers, balance trends & executive insights',
    aiPrivacyNotice: 'Zero setup required. Your calculations remain 100% private and secure.',
    themeSection: 'Appearance & Theme',
    darkModeLabel: 'OLED Dark Mode',
    darkModeDesc: 'Pure black backgrounds for maximum contrast & battery saving',
    themePaletteLabel: 'Color Accent Theme',
    calculationSection: 'Calculation Engine',
    precisionLabel: 'Decimal Precision',
    angleUnitLabel: 'Angle Unit',
    currencyLabel: 'Default Currency',
    sensorySection: 'Sensory & Haptics',
    hapticsLabel: 'Haptic Feedback',
    hapticsDesc: 'Tactile vibration feedback on button presses',
    ledgerSection: 'Equation Ledger',
    retentionLabel: 'History Retention Period',
    purgeHistoryLabel: 'Purge Equation Ledger',
    purgeConfirmTitle: 'Purge Ledger',
    purgeConfirmMsg: 'Permanently delete all calculation entries? This cannot be undone.',
    purgeButton: 'Purge All',
    backupSection: 'Data & Cloud Backup',
    exportBackupLabel: 'Export JSON Backup',
    aboutSection: 'About NoteCalc Pro',
    versionLabel: 'Version',
    privacyBadge: '100% Offline-First & Private',
  },

  ar: {
    navCalcNote: 'كالك نوت',
    navLedger: 'السجل',
    navSettings: 'الإعدادات',

    calcNoteTitle: 'كالك نوت',
    keypadTitle: 'لوحة المفاتيح',
    smartNotepad: 'الملاحظات الذكية',
    keypadCalc: 'آلة حاسبة',
    modeScientific: 'علمي',
    modeStandard: 'قياسي',

    grandTotal: 'المجموع الإجمالي',
    solved: 'تم الحل',
    lines: 'أسطر',
    export: 'تصدير',
    aiInsights: 'تحليل ذكي',
    newDocument: 'مستند جديد',
    newNote: 'ملاحظة جديدة',
    untitledDoc: 'مستند حسابات جديد',
    deleteDocument: 'حذف المستند',
    documentsSheet: 'المستندات المحفوظة',
    voiceMath: 'إملاء رياضي',
    searchDocs: 'بحث في المستندات...',
    editorPlaceholder: 'اكتب الحسابات، مثال: الراتب ٥٠٠٠',
    addLine: 'إضافة سطر',
    copyTotal: 'نسخ الإجمالي',
    clearNote: 'مسح الملاحظة',
    clearNoteConfirm: 'هل أنت متأكد أنك تريد مسح جميع الحسابات في هذه الملاحظة؟',
    loadSample: 'تحميل نموذج الحسابات',
    quickGuideTitle: 'دليل الحسابات الذكي',
    guideMathText: 'اخلط النصوص بالأرقام: قهوة ٤ * ٣.٥٠',
    guideLineRef: 'اربط الأسطر: سطر ١ + ١٥٪',
    guideCurrency: 'تحويل العملات: ١٠٠ دولار إلى يورو',
    guideAiVoice: 'الصوت والذكاء: اضغط المايك للتحدث أو التحويل',

    copy: 'نسخ',
    copied: 'تم النسخ!',
    paste: 'لصق',
    pasted: 'تم اللصق!',
    moreOptions: 'المزيد من الخيارات',
    noteActions: 'إجراءات الملاحظة',
    newCalculationNote: 'ملاحظة حسابية جديدة',
    share: 'مشاركة',
    cancel: 'إلغاء',
    close: 'إغلاق',
    back: 'رجوع',
    done: 'تم',
    clear: 'مسح',
    delete: 'حذف',
    save: 'حفظ',
    edit: 'تعديل',
    all: 'الكل',
    today: 'اليوم',
    yesterday: 'أمس',
    totalCalculations: 'إجمالي العمليات',
    ledgerEmptyTitle: 'شريط العمليات فارغ',
    ledgerEmptyDesc: 'سيتم تسجيل العمليات والمعادلات المحسوبة هنا تلقائياً.',
    searchHistoryPlaceholder: 'ابحث في المعادلات والملاحظات والنتائج...',
    loadDemoCalculations: 'تحميل عمليات حسابية تجريبية',
    startCalculating: 'ابدأ الحساب',
    zeroMatches: 'لا توجد نتائج',
    clearFilter: 'مسح الفلتر',

    exportModalTitle: 'تصدير المستند',
    printPdf: 'مستند PDF قابل للطباعة',
    printPdfDesc: 'ورقة حسابات رسمية عالية الدقة مع جدول العمليات والمجموع',
    visualReceipt: 'إيصال PNG مرئي',
    visualReceiptDesc: 'بطاقة إيصال رقمية بدقة عالية للمعاينة والحفظ والمشاركة',
    plainText: 'نص عادي / ماركداون',
    plainTextDesc: 'معادلات نصية نظيفة مع النتائج للرسائل والملاحظات',
    downloadPng: 'تحميل PNG',
    printPdfButton: 'طباعة / حفظ PDF',
    digitalReceiptTitle: 'إيصال رقمي',
    documentSheetTitle: 'ورقة المستند',

    preferencesTitle: 'التفضيلات',
    preferencesSubtitle: 'التخصيص ومحرك الذكاء الاصطناعي',
    languageSection: 'اللغة والمنطقة',
    languageLabel: 'لغة التطبيق',
    languageDesc: 'اختر لغة الواجهة المفضلة',
    aiSection: 'الذكاء الاصطناعي والميزات الذكية',
    aiStatusTitle: 'المحرك المالي الذكي',
    aiStatusDesc: 'تحليل تلقائي وملخصات مالية وإملاء صوتي مدمج',
    aiSummariesLabel: 'الرؤى المالية للمستندات',
    aiSummariesDesc: 'استخراج تلقائي لتوزيع التكاليف والأرصدة والتوصيات',
    aiPrivacyNotice: 'جاهز للاستخدام بدون أي إعدادات. جميع حساباتك مشفرة وخاصة بالكامل.',
    themeSection: 'المظهر والسمة',
    darkModeLabel: 'الوضع الداكن OLED',
    darkModeDesc: 'خلفيات سوداء نقية لتوفير البطارية وأقصى درجات الراحة البصرية',
    themePaletteLabel: 'لوحة الألوان الأساسية',
    calculationSection: 'محرك الحساب والرياضيات',
    precisionLabel: 'الدقة العشرية',
    angleUnitLabel: 'وحدة الزاوية',
    currencyLabel: 'العملة الافتراضية',
    sensorySection: 'الاستجابة واللمس',
    hapticsLabel: 'الاستجابة اللمسية',
    hapticsDesc: 'اهتزاز لطيف عند الضغط على الأزرار',
    ledgerSection: 'سجل المعادلات',
    retentionLabel: 'فترة الاحتفاظ بالسجل',
    purgeHistoryLabel: 'مسح كافة السجلات',
    purgeConfirmTitle: 'مسح السجل',
    purgeConfirmMsg: 'هل أنت متأكد من حذف كافة الحسابات السابقة نهائياً؟',
    purgeButton: 'مسح الكل',
    backupSection: 'النسخ الاحتياطي والبيانات',
    exportBackupLabel: 'تصدير نسخة JSON احتياطية',
    aboutSection: 'حول NoteCalc Pro',
    versionLabel: 'الإصدار',
    privacyBadge: 'خصوصية كاملة وتصميم بدون إنترنت',
  },

  bn: {
    navCalcNote: 'ক্যালকনোট',
    navLedger: 'লেজার',
    navSettings: 'সেটিংস',

    calcNoteTitle: 'ক্যালকনোট',
    keypadTitle: 'কীপ্যাড',
    smartNotepad: 'স্মার্ট নোটপ্যাড',
    keypadCalc: 'কীপ্যাড ক্যালক',
    modeScientific: 'সাইন্টিফিক',
    modeStandard: 'সাধারণ',

    grandTotal: 'সর্বমোট ব্যালেন্স',
    solved: 'সমাধানকৃত',
    lines: 'টি লাইন',
    export: 'এক্সপোর্ট',
    aiInsights: 'এআই বিশ্লেষণ',
    newDocument: 'নতুন নথি',
    newNote: 'নতুন নোট',
    untitledDoc: 'নতুন হিসাব নথি',
    deleteDocument: 'নথি মুছুন',
    documentsSheet: 'সংরক্ষিত হিসাবসমূহ',
    voiceMath: 'ভয়েস ম্যাথ',
    searchDocs: 'নথি খুঁজুন...',
    editorPlaceholder: 'হিসাব ও নোট লিখুন, যেমন: বেতন ৳৫,০০০',
    addLine: 'নতুন লাইন',
    copyTotal: 'টোটাল কপি',
    clearNote: 'নোট খালি করুন',
    clearNoteConfirm: 'আপনি কি এই নোটের সব হিসাব মুছে ফেলতে চান?',
    loadSample: 'নমুনা হিসাব লোড করুন',
    quickGuideTitle: 'স্মার্ট হিসাব গাইড',
    guideMathText: 'লেখা ও অঙ্ক একসাথে: কফি ৪ * ৫০',
    guideLineRef: 'অন্য লাইন যোগ: Line 1 + 15%',
    guideCurrency: 'মুদ্রা রূপান্তর: 100 USD to BDT',
    guideAiVoice: 'ভয়েস ও এআই: কথা বলে বা লিখে রূপান্তর',

    copy: 'কপি',
    copied: 'কপি সম্পন্ন!',
    paste: 'পেস্ট',
    pasted: 'পেস্ট সম্পন্ন!',
    moreOptions: 'আরও বিকল্প',
    noteActions: 'নোট অ্যাকশন',
    newCalculationNote: 'নতুন হিসাবের নোট',
    share: 'শেয়ার',
    cancel: 'বাতিল',
    close: 'বন্ধ করুন',
    back: 'পেছনে',
    done: 'সম্পন্ন',
    clear: 'মুছুন',
    delete: 'ডিলিট',
    save: 'সংরক্ষণ',
    edit: 'সম্পাদনা',
    all: 'সব',
    today: 'আজ',
    yesterday: 'গতকাল',
    totalCalculations: 'মোট হিসাব',
    ledgerEmptyTitle: 'হিসাব লেজার খালি',
    ledgerEmptyDesc: 'আপনার সমাধানকৃত সমীকরণ ও হিসাবসমূহ এখানে সংরক্ষিত হবে।',
    searchHistoryPlaceholder: 'সমীকরণ, নোট বা ফলাফল খুঁজুন...',
    loadDemoCalculations: 'ডেমো হিসাব লোড করুন',
    startCalculating: 'হিসাব শুরু করুন',
    zeroMatches: 'কোন মিল পাওয়া যায়নি',
    clearFilter: 'ফিল্টার মুছুন',

    exportModalTitle: 'নথি এক্সপোর্ট',
    printPdf: 'প্রিন্টযোগ্য PDF নথি',
    printPdfDesc: 'হিসাবের তালিকা ও সর্বমোট ফলাফল সহ ফরম্যাটেড শিট',
    visualReceipt: 'ভিজ্যুয়াল PNG রসিদ',
    visualReceiptDesc: 'শেয়ার ও ডাউনলোডের জন্য প্রস্তুত ডিজিটাল ক্যাশ রসিদ',
    plainText: 'প্লেইন টেক্সট / মার্কডাউন',
    plainTextDesc: 'মেসেজ বা নোটের জন্য স্পষ্ট টেক্সট সমীকরণ',
    downloadPng: 'PNG ডাউনলোড',
    printPdfButton: 'PDF প্রিন্ট / সংরক্ষণ',
    digitalReceiptTitle: 'ডিজিটাল রসিদ',
    documentSheetTitle: 'নথি শিট',

    preferencesTitle: 'পছন্দসমূহ',
    preferencesSubtitle: 'কাস্টমাইজেশন ও এআই ইঞ্জিন',
    languageSection: 'ভাষা ও অঞ্চল',
    languageLabel: 'অ্যাপের ভাষা',
    languageDesc: 'ইন্টারফেসের জন্য ভাষা নির্বাচন করুন',
    aiSection: 'এআই ও স্মার্ট ফিচারসমূহ',
    aiStatusTitle: 'স্মার্ট ফিন্যান্সিয়াল ইঞ্জিন',
    aiStatusDesc: 'স্বয়ংক্রিয় আর্থিক বিশ্লেষণ, নোট সারসংক্ষেপ ও ভয়েস গণিত',
    aiSummariesLabel: 'নথির আর্থিক বিশ্লেষণ',
    aiSummariesDesc: 'ব্যয় বণ্টন, ব্যালেন্সের ধারা ও গুরুত্বপূর্ণ সাশ্রয় অন্তর্দৃষ্টি',
    aiPrivacyNotice: 'কোনো সেটআপের প্রয়োজন নেই। আপনার সকল হিসাব শতভাগ সুরক্ষিত ও ব্যক্তিগত।',
    themeSection: 'থিম ও রূপরেখা',
    darkModeLabel: 'OLED ডার্ক মোড',
    darkModeDesc: 'ব্যাটারি সাশ্রয় ও আরামদায়ক দর্শনের জন্য পিওর ব্ল্যাক',
    themePaletteLabel: 'কালার অ্যাকসেন্ট থিম',
    calculationSection: 'গণনা ইঞ্জিন',
    precisionLabel: 'দশমিকের স্থান',
    angleUnitLabel: 'কোণের পরিমাপ',
    currencyLabel: 'ডিফল্ট মুদ্রা',
    sensorySection: 'হ্যাপটিক টাচ',
    hapticsLabel: 'হ্যাপটিক ভাইব্রেশন',
    hapticsDesc: 'বোতাম চাপার সময় সূক্ষ্ম কম্পন প্রতিক্রিয়া',
    ledgerSection: 'হিসাবের লেজার হিস্ট্রি',
    retentionLabel: 'হিস্ট্রি সংরক্ষণের মেয়াদ',
    purgeHistoryLabel: 'সকল হিস্ট্রি মুছে ফেলুন',
    purgeConfirmTitle: 'হিস্ট্রি মুছুন',
    purgeConfirmMsg: 'আপনি কি নিশ্চিত যে সকল হিসাব স্থায়ীভাবে মুছে ফেলতে চান?',
    purgeButton: 'সব মুছুন',
    backupSection: 'ব্যাকআপ ও এক্সপোর্ট',
    exportBackupLabel: 'JSON ব্যাকআপ ডাউনলোড',
    aboutSection: 'নোটক্যালক প্রো সম্পর্কে',
    versionLabel: 'সংস্করণ',
    privacyBadge: '১০০% নিরাপদ ও অফলাইন-ফার্স্ট',
  },
};

const LANGUAGE_STORAGE_KEY = 'calcmaster_app_language';

type LanguageContextType = {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => Promise<void>;
  t: Translations;
  isRTL: boolean;
};

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<SupportedLanguage>('en');

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
        if (saved && (saved === 'en' || saved === 'ar' || saved === 'bn')) {
          setLanguageState(saved);
        }
      } catch (e) {
        console.warn('Failed to load language', e);
      }
    })();
  }, []);

  const setLanguage = async (newLang: SupportedLanguage) => {
    setLanguageState(newLang);
    try {
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, newLang);
    } catch (e) {
      console.warn('Failed to save language', e);
    }
  };

  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const isRTL = language === 'ar';

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        isRTL,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return ctx;
}
