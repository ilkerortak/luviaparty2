import React, { useState, useEffect } from 'react';
import { doc, updateDoc, arrayUnion, arrayRemove, collection, addDoc, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/config';
import type { User, MomentPost } from '../../types';
import { AvatarRenderer } from '../avatar/AvatarRenderer';
import { soundFX } from '../../utils/soundEffects';
import {
  subscribeToMoments,
  publishOnlineMoment,
} from '../../services/onlineService';
import { Heart, MessageSquare, Plus, Send, X, ChevronRight, Compass } from 'lucide-react';
import confetti from 'canvas-confetti';

interface MomentsFeedProps {
  currentUser: User;
  onOpenCP?: () => void;
  onOpenFamily?: () => void;
}

const INITIAL_POSTS: MomentPost[] = [
  {
    id: 'post-1',
    author: {
      id: 'bot-1',
      username: 'Melisa_06',
      level: 14,
      exp: 420,
      maxExp: 1000,
      coins: 3400,
      diamonds: 45,
      vipLevel: 2,
      avatarConfig: { skinColor: '#FEE3D4', hairStyle: 'ponytail', hairColor: '#d97706', eyeStyle: 'cute', mouthStyle: 'smile', outfit: 'party_dress', outfitColor: '#ec4899', accessory: 'cat_ears', frame: 'sakura' },
      statusMessage: '',
      followersCount: 120,
      followingCount: 89,
      gamesPlayed: 140,
      gamesWon: 85,
    },
    timeAgo: '15 dk önce',
    content: 'Luvia Party sesli odasındaki müzik ziyafeti efsaneydi! Katılan ve gül gönderen herkese teşekkürler 🌹🎶',
    tag: 'Sesli Oda 🎙️',
    likes: 38,
    hasLiked: false,
    comments: [
      {
        id: 'c1',
        userName: 'Ege_Gamer',
        userAvatar: { skinColor: '#FFDCB1', hairStyle: 'anime', hairColor: '#06b6d4', eyeStyle: 'cool', mouthStyle: 'smirk', outfit: 'cyberpunk', outfitColor: '#3b82f6', accessory: 'gaming_headset', frame: 'cyber_glow' },
        text: 'Sesin gerçekten çok güzeldi tebrikler!',
        timeAgo: '10 dk',
      }
    ]
  },
  {
    id: 'post-2',
    author: {
      id: 'bot-2',
      username: 'Ege_Gamer',
      level: 22,
      exp: 890,
      maxExp: 1500,
      coins: 12000,
      diamonds: 180,
      vipLevel: 4,
      avatarConfig: { skinColor: '#FFDCB1', hairStyle: 'anime', hairColor: '#06b6d4', eyeStyle: 'cool', mouthStyle: 'smirk', outfit: 'cyberpunk', outfitColor: '#3b82f6', accessory: 'gaming_headset', frame: 'cyber_glow' },
      statusMessage: '',
      followersCount: 340,
      followingCount: 110,
      gamesPlayed: 320,
      gamesWon: 195,
    },
    timeAgo: '1 saat önce',
    content: 'Uzay Köylü modunda tek başıma 3 haini buldum haha! Mürettebat kazandı 🐺🚀',
    tag: 'Oyun Zaferi 🏆',
    likes: 74,
    hasLiked: false,
    comments: []
  }
];

export const MomentsFeed: React.FC<MomentsFeedProps> = ({ currentUser, onOpenCP, onOpenFamily }) => {
  const [posts, setPosts] = useState<MomentPost[]>(INITIAL_POSTS);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [newTag, setNewTag] = useState('Günlük 💬');
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const unsub = subscribeToMoments((remotePosts) => {
      if (remotePosts && remotePosts.length > 0) {
        setPosts(remotePosts);
      }
    });
    return () => unsub();
  }, []);

  const toggleLike = async (postId: string) => {
    soundFX.playPop();
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    const nextHasLiked = !post.hasLiked;
    const diff = nextHasLiked ? 1 : -1;

    setPosts(prev =>
      prev.map(p => {
        if (p.id === postId) {
          return {
            ...p,
            hasLiked: nextHasLiked,
            likes: p.likes + diff,
          };
        }
        return p;
      })
    );

    try {
      const postRef = doc(db, 'moments', postId);
      await updateDoc(postRef, {
        likes: post.likes + diff,
        likedBy: nextHasLiked ? arrayUnion(currentUser.id) : arrayRemove(currentUser.id)
      });
    } catch (err) {
      console.warn('Failed to update moment like in Firestore:', err);
    }
  };

  const toggleComments = async (postId: string) => {
    soundFX.playPop();
    const isExpanded = expandedComments[postId];
    setExpandedComments(prev => ({ ...prev, [postId]: !isExpanded }));

    if (!isExpanded) {
      try {
        const commentsCol = collection(db, 'moments', postId, 'comments');
        const q = query(commentsCol, orderBy('timestamp', 'asc'));
        const snap = await getDocs(q);
        const loadedComments: any[] = [];
        snap.forEach(docSnap => {
          loadedComments.push({ id: docSnap.id, ...docSnap.data() });
        });
        
        setPosts(prev => prev.map(p => {
          if (p.id === postId) {
            return { ...p, comments: loadedComments };
          }
          return p;
        }));
      } catch (err) {
        console.warn('Failed to load comments:', err);
      }
    }
  };

  const handleAddComment = async (postId: string) => {
    const text = commentInputs[postId]?.trim();
    if (!text) return;
    soundFX.playPop();

    const newComment = {
      userName: currentUser.username,
      userAvatar: currentUser.avatarConfig,
      text,
      timeAgo: 'Az önce',
      timestamp: Date.now()
    };

    setPosts(prev =>
      prev.map(p => {
        if (p.id === postId) {
          return {
            ...p,
            comments: [...(p.comments || []), { id: Date.now().toString(), ...newComment }]
          };
        }
        return p;
      })
    );
    setCommentInputs(prev => ({ ...prev, [postId]: '' }));

    try {
      const commentsCol = collection(db, 'moments', postId, 'comments');
      await addDoc(commentsCol, newComment);
    } catch (err) {
      console.warn('Failed to add comment to Firestore:', err);
    }
  };

  const handleCreatePost = () => {
    if (!newContent.trim()) return;
    soundFX.playSuccess();
    confetti({ particleCount: 50, spread: 60 });

    const newPost: MomentPost = {
      id: Date.now().toString(),
      author: currentUser,
      timeAgo: 'Az önce',
      content: newContent.trim(),
      tag: newTag,
      likes: 1,
      hasLiked: true,
      comments: [],
    };

    setPosts([newPost, ...posts]);
    publishOnlineMoment(newPost);
    setNewContent('');
    setShowCreateModal(false);
  };

  return (
    <div className="flex flex-col h-full bg-[#f6f7fb] text-gray-800 select-none overflow-y-auto no-scrollbar pb-20">
      {/* ═══ WEPLAY KEŞFET BAŞLIĞI ═══ */}
      <div className="px-5 pt-4 pb-2 bg-white border-b border-gray-100 flex items-center justify-between">
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Keşfet</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-cyan-500 text-white text-xs font-bold active:scale-95 transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Paylaşım Yap</span>
        </button>
      </div>

      {/* ═══ ANLARIM KARTI (WePlay Screenshot Style) ═══ */}
      <div className="p-4 bg-white mb-2">
        <div
          onClick={() => setShowCreateModal(true)}
          className="p-3.5 rounded-2xl border border-gray-200 hover:border-gray-300 flex items-center justify-between shadow-sm cursor-pointer active:bg-gray-50 transition"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-rose-400 via-amber-400 to-indigo-500 p-0.5 flex items-center justify-center">
              <div className="w-full h-full bg-white rounded-full flex items-center justify-center text-lg">
                💫
              </div>
            </div>
            <span className="text-sm font-bold text-gray-900">Anlarım</span>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </div>

        {/* ═══ 2 BÜYÜK KUTU: Nikah Dairesi & Aile ═══ */}
        <div className="grid grid-cols-2 gap-3 mt-3">
          {/* Nikah Dairesi / CP */}
          <div
            onClick={() => {
              soundFX.playPop();
              if (onOpenCP) onOpenCP();
            }}
            className="p-4 rounded-2xl border border-gray-200 flex flex-col items-center justify-center gap-2 cursor-pointer active:scale-95 transition hover:shadow-sm bg-white min-h-[105px]"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-b from-pink-100 to-pink-50 border border-pink-200 flex items-center justify-center text-2xl shadow-sm">
              💒
            </div>
            <span className="text-xs font-bold text-gray-800">Nikah Dairesi</span>
          </div>

          {/* Aile / Klan */}
          <div
            onClick={() => {
              soundFX.playPop();
              if (onOpenFamily) onOpenFamily();
            }}
            className="p-4 rounded-2xl border border-gray-200 flex flex-col items-center justify-center gap-2 cursor-pointer active:scale-95 transition hover:shadow-sm bg-white min-h-[105px]"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-b from-amber-100 to-amber-50 border border-amber-200 flex items-center justify-center text-2xl shadow-sm">
              🛡️
            </div>
            <span className="text-xs font-bold text-gray-800">Aile</span>
          </div>
        </div>
      </div>

      {/* ═══ TOPLULUK AKIŞI ═══ */}
      <div className="px-4 py-2 space-y-3">
        <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider px-1">
          Topluluk Paylaşımları
        </h3>

        {posts.map(post => (
          <div
            key={post.id}
            className="p-4 rounded-2xl bg-white border border-gray-100 shadow-sm space-y-3"
          >
            {/* Post Author Info */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <AvatarRenderer config={post.author.avatarConfig} size="sm" />
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="text-xs font-bold text-gray-900">{post.author.username}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-50 text-cyan-600 font-bold border border-cyan-100">
                      Lv.{post.author.level}
                    </span>
                  </div>
                  <span className="text-[10px] text-gray-400">{post.timeAgo}</span>
                </div>
              </div>

              <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-[10px] font-bold">
                {post.tag}
              </span>
            </div>

            {/* Post Content */}
            <p className="text-xs text-gray-700 leading-relaxed font-normal">
              {post.content}
            </p>

            {/* Actions: Like & Comment Counts */}
            <div className="flex items-center space-x-4 pt-2 border-t border-gray-50 text-xs text-gray-500">
              <button
                onClick={() => toggleLike(post.id)}
                className={`flex items-center space-x-1.5 transition ${
                  post.hasLiked ? 'text-pink-500 font-bold scale-105' : 'hover:text-gray-700'
                }`}
              >
                <Heart className={`w-4 h-4 ${post.hasLiked ? 'fill-pink-500 text-pink-500' : ''}`} />
                <span>{post.likes}</span>
              </button>

              <div 
                onClick={() => toggleComments(post.id)}
                className="flex items-center space-x-1.5 cursor-pointer hover:text-gray-700 transition"
              >
                <MessageSquare className="w-4 h-4" />
                <span>{(post as any).comments?.length || 0} Yorum</span>
              </div>
            </div>

            {/* Comments List */}
            {expandedComments[post.id] && (post.comments?.length > 0) && (
              <div className="pt-2 space-y-2 border-t border-gray-100">
                {post.comments.map(c => (
                  <div key={c.id} className="flex items-start space-x-2 text-xs bg-gray-50 p-2 rounded-xl">
                    <AvatarRenderer config={c.userAvatar} size="xs" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-gray-900 text-[11px]">{c.userName}</span>
                        <span className="text-[9px] text-gray-400">{c.timeAgo}</span>
                      </div>
                      <span className="text-gray-600 text-[11px] mt-0.5 block">{c.text}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Comment Input */}
            <div className="flex items-center space-x-2 pt-1">
              <input
                type="text"
                value={commentInputs[post.id] || ''}
                onChange={e => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                onKeyDown={e => e.key === 'Enter' && handleAddComment(post.id)}
                placeholder="Yorum yaz..."
                className="flex-1 bg-gray-50 rounded-full px-3 py-1.5 text-xs text-gray-800 placeholder-gray-400 border border-gray-200 outline-none"
              />
              <button
                onClick={() => handleAddComment(post.id)}
                className="p-1.5 text-cyan-600 hover:text-cyan-500"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ═══ PAYLAŞIM YAP MODAL ═══ */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 w-full max-w-sm space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <span className="font-bold text-sm text-gray-900">Yeni An Paylaş</span>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <span className="text-[11px] font-bold text-gray-500 block mb-1">Etiket Seç:</span>
              <div className="flex space-x-1.5 overflow-x-auto no-scrollbar">
                {['Günlük 💬', 'Oyun Zaferi 🏆', 'Sesli Oda 🎙️', 'Dostluk / CP 💍'].map(t => (
                  <button
                    key={t}
                    onClick={() => setNewTag(t)}
                    className={`px-2.5 py-1 rounded-full text-xs font-bold transition whitespace-nowrap ${
                      newTag === t ? 'bg-cyan-500 text-white' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              value={newContent}
              onChange={e => setNewContent(e.target.value)}
              placeholder="Bugün neler oldu? Oyun zaferini veya hislerini arkadaşlarınla paylaş..."
              rows={4}
              className="w-full bg-gray-50 rounded-2xl p-3 text-xs text-gray-800 placeholder-gray-400 outline-none border border-gray-200 focus:border-cyan-400 resize-none"
            />

            <button
              onClick={handleCreatePost}
              disabled={!newContent.trim()}
              className="w-full py-2.5 rounded-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-xs font-bold text-white shadow-md shadow-cyan-200"
            >
              Paylaşımı Yayınla
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
