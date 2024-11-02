import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, addDoc, getDocs, updateDoc, deleteDoc, Timestamp, doc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, Edit2, Trash2 } from 'lucide-react';

interface Comment {
  id: string;
  text: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  createdAt: Timestamp;
}

interface CommentsProps {
  recipeId: string;
  recipeOwnerId: string;
}

const formatDate = (timestamp: Timestamp | null) => {
  if (!timestamp) return '';
  
  try {
    const date = timestamp.toDate();
    return new Intl.DateTimeFormat('he-IL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

const Comments: React.FC<CommentsProps> = ({ recipeId, recipeOwnerId }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editedText, setEditedText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const commentsRef = collection(doc(db, 'recipes', recipeId), 'comments');
        const q = query(commentsRef, orderBy('createdAt', 'desc'));
        
        const querySnapshot = await getDocs(q);
        const commentsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Comment[];
        
        setComments(commentsData);
      } catch (error) {
        console.error('Error fetching comments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [recipeId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;

    setSubmitting(true);
    try {
      const commentsRef = collection(doc(db, 'recipes', recipeId), 'comments');
      const commentData = {
        text: newComment.trim(),
        userId: user.uid,
        userName: user.displayName || 'משתמש אנונימי',
        userPhoto: user.photoURL || '',
        createdAt: Timestamp.now()
      };

      const docRef = await addDoc(commentsRef, commentData);
      setComments([{ id: docRef.id, ...commentData }, ...comments]);
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (commentId: string, text: string) => {
    setEditingComment(commentId);
    setEditedText(text);
  };

  const handleCancelEdit = () => {
    setEditingComment(null);
    setEditedText('');
  };

  const handleSaveEdit = async (commentId: string) => {
    if (!editedText.trim()) return;

    try {
      const commentRef = doc(db, 'recipes', recipeId, 'comments', commentId);
      await updateDoc(commentRef, { text: editedText.trim() });

      setComments(comments.map(comment => 
        comment.id === commentId ? { ...comment, text: editedText.trim() } : comment
      ));
      setEditingComment(null);
      setEditedText('');
    } catch (error) {
      console.error('Error updating comment:', error);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!window.confirm('האם אתה בטוח שברצונך למחוק תגובה זו?')) return;

    try {
      await deleteDoc(doc(db, 'recipes', recipeId, 'comments', commentId));
      setComments(comments.filter(comment => comment.id !== commentId));
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl md:text-2xl font-bold">תגובות</h2>
      
      {user ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="הוסף תגובה..."
            className="input w-full h-24 resize-none"
            maxLength={1000}
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!newComment.trim() || submitting}
              className="btn btn-primary"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'שלח תגובה'
              )}
            </button>
          </div>
        </form>
      ) : (
        <p className="text-gray-600 text-center py-4">
          התחבר כדי להוסיף תגובה
        </p>
      )}

      <div className="space-y-4">
        {comments.map(comment => (
          <div key={comment.id} className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                {comment.userPhoto && (
                  <img
                    src={comment.userPhoto}
                    alt={comment.userName}
                    className="w-8 h-8 rounded-full"
                  />
                )}
                <div>
                  <div className="font-medium">{comment.userName}</div>
                  <div className="text-sm text-gray-500">
                    {formatDate(comment.createdAt)}
                  </div>
                </div>
              </div>
              {(user?.uid === comment.userId || user?.uid === recipeOwnerId) && (
                <div className="flex gap-2">
                  {user?.uid === comment.userId && (
                    <button
                      onClick={() => handleEdit(comment.id, comment.text)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(comment.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
            {editingComment === comment.id ? (
              <div className="mt-2">
                <textarea
                  value={editedText}
                  onChange={(e) => setEditedText(e.target.value)}
                  className="input w-full h-24 resize-none"
                  maxLength={1000}
                />
                <div className="flex justify-end gap-2 mt-2">
                  <button
                    onClick={handleCancelEdit}
                    className="btn btn-secondary btn-sm"
                  >
                    ביטול
                  </button>
                  <button
                    onClick={() => handleSaveEdit(comment.id)}
                    className="btn btn-primary btn-sm"
                  >
                    שמור
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-gray-700 whitespace-pre-line">{comment.text}</p>
            )}
          </div>
        ))}
        
        {comments.length === 0 && (
          <p className="text-center text-gray-500 py-4">
            אין תגובות עדיין. היה הראשון להגיב!
          </p>
        )}
      </div>
    </div>
  );
};

export default Comments;
