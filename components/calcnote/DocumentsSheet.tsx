import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useCalcNote, CalcNoteDocument } from '@/context/CalcNoteContext';
import { Plus, FileText, Check, Trash2, Copy, Edit2, X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

type DocumentsSheetProps = {
  visible: boolean;
  onClose: () => void;
};

export default function DocumentsSheet({ visible, onClose }: DocumentsSheetProps) {
  const { theme, isDarkMode } = useTheme();
  const {
    documents,
    activeDoc,
    createDocument,
    selectDocument,
    deleteDocument,
    renameDocument,
    duplicateDocument,
  } = useCalcNote();

  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameText, setRenameText] = useState('');

  const handleCreateNew = () => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    createDocument();
    onClose();
  };

  const handleSelectDoc = (id: string) => {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
    selectDocument(id);
    onClose();
  };

  const handleDelete = (doc: CalcNoteDocument) => {
    Alert.alert('Delete Calculation Sheet', `Are you sure you want to delete "${doc.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteDocument(doc.id),
      },
    ]);
  };

  const startRename = (doc: CalcNoteDocument) => {
    setRenamingId(doc.id);
    setRenameText(doc.title);
  };

  const saveRename = (id: string) => {
    renameDocument(id, renameText);
    setRenamingId(null);
  };

  const renderDocItem = ({ item }: { item: CalcNoteDocument }) => {
    const isSelected = item.id === activeDoc.id;
    const isRenaming = renamingId === item.id;
    const dateStr = new Date(item.updatedAt).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });

    return (
      <TouchableOpacity
        style={[
          styles.docCard,
          {
            backgroundColor: isSelected
              ? theme.pillActiveBg
              : isDarkMode
              ? 'rgba(255, 255, 255, 0.04)'
              : theme.cardSubtle,
            borderColor: isSelected ? theme.accentColor : theme.borderColor,
          },
        ]}
        onPress={() => handleSelectDoc(item.id)}
        activeOpacity={0.7}
      >
        <FileText
          size={18}
          color={isSelected ? theme.accentColor : theme.secondaryTextColor}
          style={{ marginRight: 10 }}
        />

        <View style={styles.docInfo}>
          {isRenaming ? (
            <View style={styles.renameRow}>
              <TextInput
                style={[
                  styles.renameInput,
                  { color: theme.textColor, borderColor: theme.accentColor },
                ]}
                value={renameText}
                onChangeText={setRenameText}
                autoFocus
                onSubmitEditing={() => saveRename(item.id)}
              />
              <TouchableOpacity onPress={() => saveRename(item.id)} style={styles.saveRenameBtn}>
                <Check size={16} color={theme.accentColor} />
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <Text
                style={[
                  styles.docTitle,
                  {
                    color: isSelected ? theme.accentColor : theme.textColor,
                    fontFamily: isSelected ? 'Roboto-Bold' : 'Roboto-Medium',
                  },
                ]}
                numberOfLines={1}
              >
                {item.title}
              </Text>
              <Text style={[styles.docDate, { color: theme.mutedTextColor }]}>
                Edited {dateStr} • {item.content.split('\n').length} lines
              </Text>
            </>
          )}
        </View>

        {!isRenaming && (
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => startRename(item)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Edit2 size={14} color={theme.secondaryTextColor} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => duplicateDocument(item.id)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Copy size={14} color={theme.secondaryTextColor} />
            </TouchableOpacity>

            {documents.length > 1 && (
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => handleDelete(item)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Trash2 size={14} color={theme.dangerColor} />
              </TouchableOpacity>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View
          style={[
            styles.sheetContainer,
            { backgroundColor: theme.cardColor, borderColor: theme.glassBorder },
          ]}
        >
          {/* Sheet Header */}
          <View style={styles.sheetHeader}>
            <View>
              <Text style={[styles.sheetTitle, { color: theme.textColor }]}>
                Calculation Sheets
              </Text>
              <Text style={[styles.sheetSubtitle, { color: theme.secondaryTextColor }]}>
                {documents.length} SAVED DOCUMENTS
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.closeBtn, { backgroundColor: theme.cardSubtle }]}
              onPress={onClose}
            >
              <X size={18} color={theme.secondaryTextColor} />
            </TouchableOpacity>
          </View>

          {/* New Sheet Button */}
          <TouchableOpacity
            style={[styles.newDocBtn, { backgroundColor: theme.accentColor }]}
            onPress={handleCreateNew}
            activeOpacity={0.8}
          >
            <Plus size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.newDocText}>New Calculation Sheet</Text>
          </TouchableOpacity>

          {/* Document List */}
          <FlatList
            data={documents}
            renderItem={renderDocItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 32,
    maxHeight: '75%',
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 20,
    fontFamily: 'Roboto-Bold',
  },
  sheetSubtitle: {
    fontSize: 10,
    fontFamily: 'Roboto-Bold',
    letterSpacing: 1,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  newDocBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 16,
    marginBottom: 16,
  },
  newDocText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Roboto-Bold',
  },
  listContent: {
    gap: 8,
    paddingBottom: 20,
  },
  docCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1.2,
  },
  docInfo: {
    flex: 1,
    marginRight: 8,
  },
  docTitle: {
    fontSize: 15,
  },
  docDate: {
    fontSize: 11,
    marginTop: 3,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  actionBtn: {
    padding: 4,
  },
  renameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  renameInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Roboto-Medium',
    borderBottomWidth: 1,
    paddingVertical: 2,
  },
  saveRenameBtn: {
    marginLeft: 8,
    padding: 4,
  },
});
