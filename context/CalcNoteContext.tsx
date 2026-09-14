import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { evaluateDocument, DocumentEvaluationResult } from '@/utils/calcNoteEngine';
import { initCurrencyRates, syncExchangeRatesIfStale } from '@/utils/currency';

export type CalcNoteDocument = {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
};

export const SAMPLE_BUDGET_CONTENT = `// CalcNote Evolution • Smart Notepad
Salary: $5,500
Bonus: 1000
Total Gross: Line 2 + Line 3

// Deductions
Tax: 18% of Line 4
Net Income: Line 4 - Line 7

// Fixed Expenses
Rent: 1,450
Utilities: 180 + internet 70
Groceries: 125 * 4
Total Expenses: Line 11 + Line 12 + Line 13

// International Trip
Flight tickets: 420 EUR to USD
Remaining Savings: Line 8 - Line 14 - Line 17`;

const DEFAULT_STARTER_NOTE: CalcNoteDocument = {
  id: 'starter-note-001',
  title: 'My Calculation Note',
  content: '',
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

type CalcNoteContextType = {
  documents: CalcNoteDocument[];
  activeDoc: CalcNoteDocument;
  evaluation: DocumentEvaluationResult;
  updateContent: (content: string) => void;
  clearCurrentDocument: () => void;
  loadSampleNote: () => void;
  createDocument: (title?: string, content?: string) => string;
  deleteDocument: (id: string) => void;
  selectDocument: (id: string) => void;
  renameDocument: (id: string, newTitle: string) => void;
  duplicateDocument: (id: string) => void;
  refreshCurrencyRates: () => Promise<void>;
};

const CalcNoteContext = createContext<CalcNoteContextType>({
  documents: [DEFAULT_STARTER_NOTE],
  activeDoc: DEFAULT_STARTER_NOTE,
  evaluation: evaluateDocument(DEFAULT_STARTER_NOTE.content),
  updateContent: () => {},
  clearCurrentDocument: () => {},
  loadSampleNote: () => {},
  createDocument: () => '',
  deleteDocument: () => {},
  selectDocument: () => {},
  renameDocument: () => {},
  duplicateDocument: () => {},
  refreshCurrencyRates: async () => {},
});

const DOCS_STORAGE_KEY = '@calcnote_saved_documents';
const ACTIVE_DOC_STORAGE_KEY = '@calcnote_active_doc_id';

export const CalcNoteProvider = ({ children }: { children: React.ReactNode }) => {
  const [documents, setDocuments] = useState<CalcNoteDocument[]>([DEFAULT_STARTER_NOTE]);
  const [activeDocId, setActiveDocId] = useState<string>(DEFAULT_STARTER_NOTE.id);

  // Initialize currency rates and load documents from storage
  useEffect(() => {
    const initStorage = async () => {
      try {
        await initCurrencyRates();
        syncExchangeRatesIfStale(false).catch(console.warn);

        const savedDocsJson = await AsyncStorage.getItem(DOCS_STORAGE_KEY);
        const savedActiveId = await AsyncStorage.getItem(ACTIVE_DOC_STORAGE_KEY);

        if (savedDocsJson) {
          const parsed = JSON.parse(savedDocsJson);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setDocuments(parsed);
            if (savedActiveId && parsed.some((d: CalcNoteDocument) => d.id === savedActiveId)) {
              setActiveDocId(savedActiveId);
            } else {
              setActiveDocId(parsed[0].id);
            }
          }
        }
      } catch (err) {
        console.error('Error loading CalcNote storage:', err);
      }
    };

    initStorage();
  }, []);

  // Save documents on change
  useEffect(() => {
    AsyncStorage.setItem(DOCS_STORAGE_KEY, JSON.stringify(documents)).catch(console.error);
    AsyncStorage.setItem(ACTIVE_DOC_STORAGE_KEY, activeDocId).catch(console.error);
  }, [documents, activeDocId]);

  const activeDoc = useMemo(() => {
    return documents.find((d) => d.id === activeDocId) || documents[0] || DEFAULT_STARTER_NOTE;
  }, [documents, activeDocId]);

  // Reactive DAG calculation
  const evaluation = useMemo(() => {
    return evaluateDocument(activeDoc.content);
  }, [activeDoc.content]);

  const updateContent = useCallback((newContent: string) => {
    setDocuments((prev) =>
      prev.map((doc) =>
        doc.id === activeDocId
          ? {
              ...doc,
              content: newContent,
              updatedAt: Date.now(),
            }
          : doc
      )
    );
  }, [activeDocId]);

  const clearCurrentDocument = useCallback(() => {
    updateContent('');
  }, [updateContent]);

  const loadSampleNote = useCallback(() => {
    updateContent(SAMPLE_BUDGET_CONTENT);
  }, [updateContent]);

  const createDocument = useCallback((title?: string, content?: string): string => {
    const newDoc: CalcNoteDocument = {
      id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: title || `Untitled Note ${documents.length + 1}`,
      content: content || '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    setDocuments((prev) => [newDoc, ...prev]);
    setActiveDocId(newDoc.id);
    return newDoc.id;
  }, [documents.length]);

  const deleteDocument = useCallback((id: string) => {
    setDocuments((prev) => {
      const filtered = prev.filter((d) => d.id !== id);
      if (filtered.length === 0) {
        const fallback = {
          ...DEFAULT_STARTER_NOTE,
          id: `doc-${Date.now()}`,
          title: 'My Calculation Note',
          content: '',
        };
        setActiveDocId(fallback.id);
        return [fallback];
      }
      if (id === activeDocId) {
        setActiveDocId(filtered[0].id);
      }
      return filtered;
    });
  }, [activeDocId]);

  const selectDocument = useCallback((id: string) => {
    if (documents.some((d) => d.id === id)) {
      setActiveDocId(id);
    }
  }, [documents]);

  const renameDocument = useCallback((id: string, newTitle: string) => {
    setDocuments((prev) =>
      prev.map((d) => (d.id === id ? { ...d, title: newTitle.trim() || 'Untitled Note', updatedAt: Date.now() } : d))
    );
  }, []);

  const duplicateDocument = useCallback((id: string) => {
    const source = documents.find((d) => d.id === id);
    if (!source) return;

    const copy: CalcNoteDocument = {
      id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: `${source.title} (Copy)`,
      content: source.content,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    setDocuments((prev) => [copy, ...prev]);
    setActiveDocId(copy.id);
  }, [documents]);

  const refreshCurrencyRates = useCallback(async () => {
    await syncExchangeRatesIfStale(true);
    // Trigger re-render of evaluation by touching updatedAt
    setDocuments((prev) =>
      prev.map((d) => (d.id === activeDocId ? { ...d, updatedAt: Date.now() } : d))
    );
  }, [activeDocId]);

  return (
    <CalcNoteContext.Provider
      value={{
        documents,
        activeDoc,
        evaluation,
        updateContent,
        clearCurrentDocument,
        loadSampleNote,
        createDocument,
        deleteDocument,
        selectDocument,
        renameDocument,
        duplicateDocument,
        refreshCurrencyRates,
      }}
    >
      {children}
    </CalcNoteContext.Provider>
  );
};

export const useCalcNote = () => useContext(CalcNoteContext);
