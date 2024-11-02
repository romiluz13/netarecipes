import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, addDoc, getDocs, Timestamp, doc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

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

const Comments: React.FC<CommentsProps> = ({ recipeId }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
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
            <div className="flex items-center gap-3 mb-2">
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
            <p className="text-gray-700 whitespace-pre-line">{comment.text}</p>
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
