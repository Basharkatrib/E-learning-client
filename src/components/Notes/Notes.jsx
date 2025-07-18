import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { selectTheme } from '../../redux/features/themeSlice';
import { selectTranslate } from '../../redux/features/translateSlice';
import { selectToken } from '../../redux/features/authSlice';
import { useTranslation } from 'react-i18next';
import {
  useGetNotesQuery,
  useCreateNoteMutation,
  useUpdateNoteMutation,
  useDeleteNoteMutation,
} from '../../redux/features/apiSlice';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

const Notes = ({ courseId }) => {
  const theme = useSelector(selectTheme);
  const lang = useSelector(selectTranslate);
  const token = useSelector(selectToken);
  const isDark = theme === 'dark';

  const [newNote, setNewNote] = useState('');
  const [editingNote, setEditingNote] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: notes, isLoading } = useGetNotesQuery({ token, courseId });
  const [createNote] = useCreateNoteMutation();
  const [updateNote] = useUpdateNoteMutation();
  const [deleteNote] = useDeleteNoteMutation();

  const handleCreateNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    try {
      await createNote({
        token,
        data: {
          course_id: courseId,
          content: newNote,
        },
      });
      setNewNote('');
      setIsModalOpen(false);
      toast.success(lang === 'ar' ? 'تمت إضافة الملاحظة بنجاح' : 'Note added successfully');
    } catch (error) {
      toast.error(lang === 'ar' ? 'فشل في إضافة الملاحظة' : 'Failed to add note');
    }
  };

  const handleUpdateNote = async (noteId) => {
    if (!editContent.trim()) return;

    try {
      await updateNote({
        token,
        noteId,
        data: {
          content: editContent,
        },
      });
      setEditingNote(null);
      setEditContent('');
      toast.success(lang === 'ar' ? 'تم تحديث الملاحظة بنجاح' : 'Note updated successfully');
    } catch (error) {
      toast.error(lang === 'ar' ? 'فشل في تحديث الملاحظة' : 'Failed to update note');
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      await deleteNote({ token, noteId });
      toast.success(lang === 'ar' ? 'تم حذف الملاحظة بنجاح' : 'Note deleted successfully');
    } catch (error) {
      toast.error(lang === 'ar' ? 'فشل في حذف الملاحظة' : 'Failed to delete note');
    }
  };

  const startEditing = (note) => {
    setEditingNote(note.id);
    setEditContent(note.content);
  };

  return (
    <div dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
            </svg>
            <h3 className="text-2xl font-bold text-primary">
              {lang === 'ar' ? 'ملاحظات الدورة' : 'Course Notes'}
            </h3>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all transform hover:scale-105"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/>
            </svg>
            {lang === 'ar' ? 'إضافة ملاحظة' : 'Add Note'}
          </button>
        </div>

        {/* Notes List */}
        <div className="space-y-4">
          <AnimatePresence>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : notes?.data?.length > 0 ? (
              notes.data.map((note) => (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`group relative p-4 rounded-xl transition-all ${
                    isDark
                      ? 'bg-gray-800/50 hover:bg-gray-800'
                      : 'bg-gray-50 hover:bg-gray-100'
                  } border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
                >
                  {editingNote === note.id ? (
                    <div className="space-y-3">
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className={`w-full p-3 rounded-lg border ${
                          isDark
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-black'
                        } focus:ring-2 focus:ring-primary/50 outline-none`}
                        rows="4"
                        placeholder={lang === 'ar' ? 'اكتب ملاحظتك هنا...' : 'Write your note here...'}
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setEditingNote(null)}
                          className={`px-4 py-2 rounded-lg ${
                            isDark
                              ? 'bg-gray-700 hover:bg-gray-600'
                              : 'bg-gray-200 hover:bg-gray-300'
                          } transition-colors`}
                        >
                          {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                        </button>
                        <button
                          onClick={() => handleUpdateNote(note.id)}
                          className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors"
                        >
                          {lang === 'ar' ? 'حفظ' : 'Save'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className={`text-base leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {note.content}
                      </p>
                      <div className={`absolute top-3 ${lang === 'ar' ? 'left-3' : 'right-3'} flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity`}>
                        <button
                          onClick={() => startEditing(note)}
                          className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-200'} transition-colors`}
                          title={lang === 'ar' ? 'تعديل' : 'Edit'}
                        >
                          <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteNote(note.id)}
                          className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-200'} transition-colors`}
                          title={lang === 'ar' ? 'حذف' : 'Delete'}
                        >
                          <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                          </svg>
                        </button>
                      </div>
                    </>
                  )}
                </motion.div>
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`text-center py-12 rounded-xl ${
                  isDark ? 'bg-gray-800/50' : 'bg-gray-50'
                }`}
              >
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
                <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {lang === 'ar' ? 'لا توجد ملاحظات بعد' : 'No notes yet'}
                </p>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="mt-4 text-primary hover:text-primary/90 font-medium"
                >
                  {lang === 'ar' ? 'إضافة أول ملاحظة' : 'Add your first note'}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Add/Edit Note Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsModalOpen(false);
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`w-full max-w-lg rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-2xl overflow-hidden`}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-xl font-bold text-primary">
                    {lang === 'ar' ? 'إضافة ملاحظة جديدة' : 'Add New Note'}
                  </h4>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </button>
                </div>
                
                <form onSubmit={handleCreateNote} className="space-y-4">
                  <textarea
                     value={newNote}
                     onChange={(e) => setNewNote(e.target.value)}
                     placeholder={lang === 'ar' ? 'اكتب ملاحظتك هنا...' : 'Write your note here...'}
                     className={`w-full p-4 rounded-xl border ${
                     isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-black'  // هنا تعديل اللون إلى أسود في الوضع الفاتح
                      } focus:ring-2 focus:ring-primary/50 outline-none`}
                       rows="6"
                      />

                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className={`px-6 py-2 rounded-lg ${
                        isDark
                          ? 'bg-gray-700 hover:bg-gray-600'
                          : 'bg-gray-200 hover:bg-gray-300'
                      } transition-colors`}
                    >
                      {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                    </button>
                    <button
                      type="submit"
                      disabled={!newNote.trim()}
                      className={`px-6 py-2 rounded-lg transition-all transform hover:scale-105 ${
                        newNote.trim()
                          ? 'bg-primary text-white hover:bg-primary/90'
                          : `${isDark ? 'bg-gray-700' : 'bg-gray-200'} cursor-not-allowed`
                      }`}
                    >
                      {lang === 'ar' ? 'حفظ' : 'Save'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Notes; 