import React, { useState } from 'react';
import type { User } from '../../types';
import { getNumericId } from '../../types';
import { AvatarRenderer } from '../avatar/AvatarRenderer';
import { soundFX } from '../../utils/soundEffects';
import {
  Trophy,
  Crown,
  Edit3,
  ChevronRight,
  LogOut,
  Shield,
  Copy,
  Check,
  Gift,
  Users,
  X,
  MessageSquare,
  Sparkles,
  Home,
  ShoppingBag,
  Gem,
  Award,
  Globe,
  Settings,
  HelpCircle,
  Eye,
  UserPlus,
  Share2,
  Camera,
  Image as ImageIcon,
  RefreshCw,
} from 'lucide-react';
import { AppSettingsModal } from './AppSettingsModal';
import { CharmAndLevelModal } from './CharmAndLevelModal';
import { GiftWallModal } from './GiftWallModal';
import { VisitorBookModal } from './VisitorBookModal';
import { CharmBadge, getCharmInfo } from '../../utils/charmLevel';

interface UserProfileProps {
  currentUser: User;
  onUpdateUser?: (user: User) => void;
  onOpenAvatarStudio: () => void;
  onOpenShop: () => void;
  onOpenCP?: () => void;
  onOpenFamily?: () => void;
  onOpenLeaderboard?: () => void;
  onSignOut?: () => void;
  onNavigateToTab?: (tab: 'lobby' | 'voice_lobby' | 'moments' | 'messages' | 'profile') => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({
  currentUser,
  onUpdateUser,
  onOpenAvatarStudio,
  onOpenShop,
  onOpenCP,
  onOpenFamily,
  onOpenLeaderboard,
  onSignOut,
  onNavigateToTab,
}) => {
  const [viewMode, setViewMode] = useState<'menu' | 'fullProfile'>('menu');
  const [copied, setCopied] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showCharmModal, setShowCharmModal] = useState(false);
  const [showGiftWallModal, setShowGiftWallModal] = useState(false);
  const [showVisitorBookModal, setShowVisitorBookModal] = useState(false);
  const [charmModalInitialTab, setCharmModalInitialTab] = useState<'charm' | 'activity'>('charm');
  const [activeInfoModal, setActiveInfoModal] = useState<{
    title: string;
    description: string;
    icon?: string;
  } | null>(null);

  const charmInfo = getCharmInfo(currentUser.charm ?? 7668);

  const [editUsername, setEditUsername] = useState(currentUser.username);
  const [editStatus, setEditStatus] = useState(currentUser.statusMessage || '');
  const [editGender, setEditGender] = useState('Erkek');
  const [editBirthday, setEditBirthday] = useState('2002/01/10');
  const [editRegion, setEditRegion] = useState('Türkiye');
  const [editPhotoUrl, setEditPhotoUrl] = useState<string>(
    currentUser.customAvatarUrl || currentUser.avatarConfig?.customPhotoUrl || '/luvia-avatar.png'
  );

  const userNumericId = getNumericId(currentUser);

  const handleCopyId = () => {
    soundFX.playPop();
    navigator.clipboard?.writeText(userNumericId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCustomPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Fotoğraf boyutu en fazla 5MB olabilir.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setEditPhotoUrl(result);
      soundFX.playSuccess();
    };
    reader.readAsDataURL(file);
  };

  const handleSetDefaultLogo = () => {
    soundFX.playPop();
    setEditPhotoUrl('/luvia-avatar.png');
  };

  const handleSaveProfile = () => {
    soundFX.playSuccess();
    if (onUpdateUser) {
      const updatedAvatarConfig = {
        ...currentUser.avatarConfig,
        customPhotoUrl: editPhotoUrl,
      };
      onUpdateUser({
        ...currentUser,
        username: editUsername.trim() || currentUser.username,
        statusMessage: editStatus.trim() || currentUser.statusMessage,
        customAvatarUrl: editPhotoUrl,
        avatarConfig: updatedAvatarConfig,
      });
    }
    setIsEditingProfile(false);
  };

  return (
    <div className="flex flex-col h-full bg-[#f6f7fb] text-gray-800 select-none overflow-y-auto no-scrollbar pb-20 relative">
      {/* ═══ WEPLAY BİLGİLERİ DÜZENLE EKRANI (media_1790117121742) ═══ */}
      {isEditingProfile && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col">
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-100 bg-white">
            <button
              onClick={() => setIsEditingProfile(false)}
              className="p-1 text-gray-600 hover:text-gray-900 active:scale-95"
            >
              <ChevronRight className="w-6 h-6 rotate-180" />
            </button>
            <h2 className="text-base font-bold text-gray-900">Bilgileri düzenle</h2>
          </div>

          {/* Form Listesi */}
          <div className="flex-1 overflow-y-auto no-scrollbar bg-white">
            {/* Grup 1 */}
            <div>
              {/* Profil Resmi / Fotoğraf & Avatar Seçimi */}
              <div className="p-4 border-b border-gray-50 bg-slate-50/60">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-sm font-bold text-gray-900 block">Profil Resmi</span>
                    <span className="text-[11px] text-gray-500">Logo veya kendi fotoğrafını yükle</span>
                  </div>
                  <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-pink-400 shadow-md bg-slate-900 relative flex items-center justify-center flex-shrink-0">
                    <AvatarRenderer 
                      config={{ ...currentUser.avatarConfig, customPhotoUrl: editPhotoUrl }} 
                      className="w-full h-full"
                    />
                  </div>
                </div>

                {/* Butonlar: Fotoğraf Yükle & Varsayılan Logo Yap & Avatar Tasarla */}
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <label className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-pink-500 hover:bg-pink-600 active:scale-95 text-white text-xs font-bold cursor-pointer transition shadow-sm">
                    <Camera className="w-3.5 h-3.5" />
                    <span>Resim Yükle</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCustomPhotoUpload}
                      className="hidden"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={handleSetDefaultLogo}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white hover:bg-gray-100 border border-gray-200 active:scale-95 text-gray-700 text-xs font-bold transition shadow-sm"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-pink-500" />
                    <span>Luvia Logosu</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => { setIsEditingProfile(false); onOpenAvatarStudio(); }}
                  className="w-full mt-2 py-2 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                  <span>3D Avatar Stüdyosunu Aç</span>
                </button>
              </div>

              {/* Ad */}
              <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-50">
                <span className="text-sm text-gray-800">Ad</span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                    className="text-sm text-gray-500 text-right bg-transparent outline-none max-w-[150px] font-medium"
                  />
                  <ChevronRight className="w-4 h-4 text-gray-300" />
                </div>
              </div>

              {/* Kullanıcı Kimliği */}
              <div
                onClick={handleCopyId}
                className="flex items-center justify-between px-4 py-3.5 border-b border-gray-50 cursor-pointer active:bg-gray-50"
              >
                <span className="text-sm text-gray-800">Kullanıcı Kimliği</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500 font-mono">{userNumericId}</span>
                  <ChevronRight className="w-4 h-4 text-gray-300" />
                </div>
              </div>

              {/* QR Kodlu Kartvizit */}
              <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-50 cursor-pointer active:bg-gray-50">
                <span className="text-sm text-gray-800">QR Kodlu Kartvizit</span>
                <div className="flex items-center gap-2">
                  <span className="text-base">📱</span>
                  <ChevronRight className="w-4 h-4 text-gray-300" />
                </div>
              </div>
            </div>

            <div className="h-2.5 bg-gray-50" />

            {/* Grup 2 */}
            <div>
              {/* Cinsiyet */}
              <div
                onClick={() => setEditGender(editGender === 'Erkek' ? 'Kadın' : 'Erkek')}
                className="flex items-center justify-between px-4 py-3.5 border-b border-gray-50 cursor-pointer active:bg-gray-50"
              >
                <span className="text-sm text-gray-800">Cinsiyet</span>
                <div className="flex items-center gap-1">
                  <span className="text-sm text-gray-500">{editGender}</span>
                  <ChevronRight className="w-4 h-4 text-gray-300" />
                </div>
              </div>

              {/* Doğum Günü */}
              <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-50">
                <span className="text-sm text-gray-800">Doğum Günü</span>
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={editBirthday}
                    onChange={(e) => setEditBirthday(e.target.value)}
                    className="text-sm text-gray-500 text-right bg-transparent outline-none max-w-[120px]"
                  />
                  <ChevronRight className="w-4 h-4 text-gray-300" />
                </div>
              </div>

              {/* Bölge */}
              <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-50">
                <span className="text-sm text-gray-800">Bölge</span>
                <div className="flex items-center gap-1.5">
                  <span>🇹🇷</span>
                  <span className="text-sm text-gray-500">{editRegion}</span>
                  <ChevronRight className="w-4 h-4 text-gray-300" />
                </div>
              </div>

              {/* Şahsi İmza */}
              <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-50">
                <span className="text-sm text-gray-800">Şahsi İmza</span>
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    placeholder="Bir şeyler yaz..."
                    maxLength={60}
                    className="text-sm text-gray-500 text-right bg-transparent outline-none max-w-[170px]"
                  />
                  <ChevronRight className="w-4 h-4 text-gray-300" />
                </div>
              </div>
            </div>

            <div className="h-2.5 bg-gray-50" />

            {/* Grup 3 */}
            <div>
              {/* Sosyal Statü */}
              <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-50">
                <span className="text-sm text-gray-800">Sosyal Statü</span>
                <div className="flex items-center gap-1">
                  <span className="text-sm text-gray-500">0 adet gül</span>
                  <ChevronRight className="w-4 h-4 text-gray-300" />
                </div>
              </div>

              {/* Unvan */}
              <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-50">
                <span className="text-sm text-gray-800">Unvan</span>
                <div className="flex items-center gap-1">
                  <span className="text-sm text-gray-500">Hiçbiri</span>
                  <ChevronRight className="w-4 h-4 text-gray-300" />
                </div>
              </div>

              {/* Rozet */}
              <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-50">
                <span className="text-sm text-gray-800">Rozet</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-base">🛡️🎙️🏅</span>
                  <ChevronRight className="w-4 h-4 text-gray-300" />
                </div>
              </div>

              {/* Level */}
              <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-50">
                <span className="text-sm text-gray-800">Level</span>
                <div className="flex items-center gap-1">
                  <span className="text-sm text-cyan-600 font-bold">Lv.{currentUser.level || 1}</span>
                  <ChevronRight className="w-4 h-4 text-gray-300" />
                </div>
              </div>
            </div>
          </div>

          {/* Kaydet Butonu */}
          <div className="p-4 border-t border-gray-100 bg-white">
            <button
              onClick={handleSaveProfile}
              className="w-full py-3 rounded-full bg-cyan-500 hover:bg-cyan-400 text-white font-bold text-sm shadow-md shadow-cyan-200 active:scale-98 transition"
            >
              Kaydet
            </button>
          </div>
        </div>
      )}

      {/* ═══ DETAYLI PROFİL GÖRÜNÜMÜ VEYA ANA MENÜ ═══ */}
      {viewMode === 'fullProfile' ? (
        <div className="flex flex-col h-full bg-white text-gray-800 select-none overflow-y-auto no-scrollbar pb-24">
        {/* Cover Photo */}
        <div className="relative">
          <div className="h-48 bg-gradient-to-br from-slate-700 via-slate-600 to-slate-800 relative">
            {/* Top action buttons */}
            <div className="absolute top-3 left-3 z-10">
              <button
                onClick={() => { soundFX.playPop(); setViewMode('menu'); }}
                className="p-1.5 rounded-full bg-black/40 text-white active:scale-90 transition"
              >
                <ChevronRight className="w-5 h-5 rotate-180" />
              </button>
            </div>
            <div className="absolute top-3 right-3 z-10 flex gap-2">
              <button
                onClick={() => { soundFX.playPop(); setIsEditingProfile(true); }}
                className="p-1.5 rounded-full bg-black/40 text-white active:scale-90 transition"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            </div>

            {/* Avatar positioned at bottom edge */}
            <div className="absolute -bottom-10 left-4 z-10">
              <div
                onClick={() => { soundFX.playPop(); onOpenAvatarStudio(); }}
                className="w-20 h-20 rounded-full border-4 border-white overflow-hidden bg-slate-900 shadow-xl cursor-pointer flex items-center justify-center relative shrink-0"
              >
                <AvatarRenderer config={currentUser.avatarConfig} className="w-full h-full" />
              </div>
            </div>
          </div>
        </div>

        {/* Profile Info Below Cover */}
        <div className="bg-white pt-12 px-4 pb-3">
          <h2 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-1">
            <span>{currentUser.username}</span>
            <Crown className="w-4 h-4 text-amber-500 fill-amber-400" />
          </h2>

          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="text-sm font-bold text-cyan-600">♂</span>
            <button
              onClick={() => {
                soundFX.playPop();
                setCharmModalInitialTab('activity');
                setShowCharmModal(true);
              }}
              className="px-2 py-0.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[10px] font-black active:scale-95 transition shadow-sm"
            >
              LV {currentUser.level || 1}
            </button>
            <button
              onClick={() => {
                soundFX.playPop();
                setCharmModalInitialTab('charm');
                setShowCharmModal(true);
              }}
              className="flex items-center gap-1 text-xs text-purple-700 font-black bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200 active:scale-95 transition shadow-sm"
            >
              <CharmBadge level={charmInfo.level || 2} size="xs" />
              <span>{(currentUser.charm ?? 7668).toLocaleString()}</span>
            </button>
            <span className="flex items-center gap-1 text-xs text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded-full">
              🪙 {currentUser.coins.toLocaleString()}
            </span>
            <div className="ml-auto flex items-center gap-1 text-xs text-gray-500">
              <span>🇹🇷</span>
              <span>Türkiye</span>
            </div>
          </div>

          <div onClick={handleCopyId} className="flex items-center gap-1.5 mt-2 cursor-pointer">
            <span className="text-xs text-gray-400 font-mono">ID:{userNumericId}</span>
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-gray-400" />}
          </div>

          <div className="flex items-center gap-2 mt-3">
            <span className="text-xl">🛡️</span>
            <span className="text-xl">🎙️</span>
            <span className="text-xl">🏅</span>
          </div>

          <div className="flex items-center justify-between mt-4 py-2 border-t border-gray-50">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-gray-800">Keşfet</span>
              <span className="text-sm font-bold text-gray-900">{currentUser.followersCount || 17}</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300" />
          </div>
        </div>

        <div className="h-2 bg-gray-50" />

        {/* Hediye Duvarı */}
        <div 
          onClick={() => {
            soundFX.playPop();
            setShowGiftWallModal(true);
          }}
          className="bg-white px-4 py-4 cursor-pointer active:bg-gray-50 transition"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-gray-900">Hediye Duvarı</h3>
            <ChevronRight className="w-4 h-4 text-gray-300" />
          </div>

          <div className="flex items-center gap-5 p-3.5 rounded-2xl bg-gradient-to-r from-amber-50 via-orange-50 to-pink-50 border border-amber-100 hover:border-pink-300 transition">
            <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center text-3xl">
              🔥
            </div>
            <div className="flex gap-10">
              <div>
                <div className="text-2xl font-black text-gray-900">64</div>
                <div className="text-xs text-gray-500">Hediye</div>
              </div>
              <div>
                <div className="text-2xl font-black text-gray-900">79</div>
                <div className="text-xs text-gray-500">Yıldız</div>
              </div>
            </div>
          </div>
        </div>

        <div className="h-2 bg-gray-50" />

        {/* Şahsi İmza */}
        <div className="bg-white px-4 py-4">
          <h3 className="text-sm font-bold text-gray-900 mb-1">Şahsi İmza</h3>
          <p className="text-sm text-gray-500">
            {currentUser.statusMessage || 'yaşamadan bilemezsin...'}
          </p>
        </div>

        <div className="h-2 bg-gray-50" />

        {/* Yakın Arkadaş */}
        <div className="bg-white px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-gray-900">yakın arkadaş</h3>
            <ChevronRight className="w-4 h-4 text-gray-300" />
          </div>

          <div className="grid grid-cols-4 gap-2">
            {[
              { title: 'Abi kardeş', color: 'from-amber-400 to-orange-400', textColor: 'text-amber-800', bgColor: 'bg-amber-50/80 border-amber-200' },
              { title: 'Kanka', color: 'from-amber-300 to-yellow-400', textColor: 'text-amber-800', bgColor: 'bg-amber-50/80 border-amber-200' },
              { title: 'Dost', color: 'from-amber-400 to-amber-500', textColor: 'text-amber-800', bgColor: 'bg-amber-50/80 border-amber-200' },
              { title: 'Sırdaş', color: 'from-amber-300 to-orange-400', textColor: 'text-amber-800', bgColor: 'bg-amber-50/80 border-amber-200' },
            ].map(item => (
              <div
                key={item.title}
                className={`${item.bgColor} border rounded-2xl p-2.5 flex flex-col items-center gap-1.5 cursor-pointer active:scale-95 transition`}
              >
                <span className="text-xs">🍀</span>
                <span className={`text-[10px] font-bold ${item.textColor}`}>{item.title}</span>
                <div className="w-5 h-5 rounded-full bg-amber-200/60 flex items-center justify-center text-amber-800 font-bold text-xs">
                  +
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="h-2 bg-gray-50" />

        {/* Koruma */}
        <div className="bg-white px-4 py-4 flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-900">Koruma</h3>
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              <span className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-sm shadow-sm">👩</span>
              <span className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-sm shadow-sm">🦝</span>
              <span className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-sm shadow-sm">🧑</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300" />
          </div>
        </div>

        <div className="h-2 bg-gray-50" />

        {/* Savaş Başarıları */}
        {onOpenLeaderboard && (
          <div
            onClick={() => { soundFX.playPop(); onOpenLeaderboard(); }}
            className="bg-white px-4 py-4 flex items-center justify-between cursor-pointer active:bg-gray-50"
          >
            <h3 className="text-sm font-bold text-gray-900">Savaş Başarıları</h3>
            <ChevronRight className="w-4 h-4 text-gray-300" />
          </div>
        )}

        {/* Bottom Fixed Action Buttons */}
        <div className="fixed bottom-14 left-0 right-0 z-30 px-4 py-3 bg-white/95 backdrop-blur border-t border-gray-100">
          <div className="flex gap-3 max-w-lg mx-auto">
            <button
              onClick={() => { soundFX.playPop(); onOpenShop(); }}
              className="flex-1 py-3 rounded-full bg-gradient-to-r from-pink-400 to-rose-500 text-white font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition shadow-lg shadow-pink-200"
            >
              <Gift className="w-4 h-4" />
              <span>Hediye Et</span>
            </button>
            <button
              onClick={() => { soundFX.playPop(); }}
              className="flex-1 py-3 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition shadow-lg shadow-cyan-200"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Mesaj gönder</span>
            </button>
          </div>
        </div>
      </div>
      ) : (
        <div className="flex flex-col h-full bg-[#f6f7fb]">
          {/* ═══ ÜST PROFİL BİLGİ KARTI ═══ */}
          <div className="bg-white p-4 pt-5 pb-4">
        <div
          onClick={() => { soundFX.playPop(); setViewMode('fullProfile'); }}
          className="flex items-center justify-between cursor-pointer active:scale-[0.99] transition"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-slate-900 border-2 border-pink-200 shadow-sm flex-shrink-0 flex items-center justify-center">
              <AvatarRenderer config={currentUser.avatarConfig} className="w-full h-full" />
            </div>

            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h2 className="text-lg font-black text-gray-900 tracking-tight">
                  {currentUser.username}
                </h2>
                <Crown className="w-4 h-4 text-amber-500 fill-amber-400" />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    soundFX.playPop();
                    setCharmModalInitialTab('charm');
                    setShowCharmModal(true);
                  }}
                  className="inline-flex items-center hover:scale-105 active:scale-95 transition"
                  title="Cazibe Seviyeleri"
                >
                  <CharmBadge level={charmInfo.level || 2} size="sm" />
                </button>
              </div>

              {/* XP Bar (Clickable -> Aktiflik Seviyesi) */}
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  soundFX.playPop();
                  setCharmModalInitialTab('activity');
                  setShowCharmModal(true);
                }}
                className="flex items-center gap-2 mt-1.5 cursor-pointer group"
                title="Aktiflik Seviyesi"
              >
                <span className="px-1.5 py-0.5 rounded bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[10px] font-black shadow-xs">
                  LV {currentUser.level || 1}
                </span>
                <div className="w-24 h-2 rounded-full bg-gray-200 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-orange-400 to-amber-500 rounded-full"
                    style={{ width: `${Math.min(100, ((currentUser.exp || 0) / (currentUser.maxExp || 200)) * 100)}%` }}
                  />
                </div>
                <span className="text-[10px] text-gray-400 font-mono">
                  {currentUser.exp || 0}/{currentUser.maxExp || 200}
                </span>
              </div>
            </div>
          </div>

          <ChevronRight className="w-6 h-6 text-gray-400" />
        </div>

        {/* ═══ 4 RENKLİ KISAYOL İKONU (VIP, Mağaza, PLAY Show, Evim) ═══ */}
        <div className="grid grid-cols-4 gap-2 mt-6 pt-4 border-t border-gray-50">
          {/* VIP Merkezi */}
          <div
            onClick={() => { soundFX.playPop(); onOpenShop(); }}
            className="flex flex-col items-center gap-1.5 cursor-pointer active:scale-95 transition"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-500 shadow-sm">
              <Gem className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-gray-700">VIP Merkezi</span>
          </div>

          {/* Mağaza */}
          <div
            onClick={() => { soundFX.playPop(); onOpenShop(); }}
            className="flex flex-col items-center gap-1.5 cursor-pointer active:scale-95 transition"
          >
            <div className="w-12 h-12 rounded-2xl bg-pink-50 border border-pink-200 flex items-center justify-center text-pink-500 shadow-sm">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-gray-700">Mağaza</span>
          </div>

          {/* PLAY Show (Ücretsiz) */}
          <div
            onClick={() => { soundFX.playPop(); onOpenAvatarStudio(); }}
            className="relative flex flex-col items-center gap-1.5 cursor-pointer active:scale-95 transition"
          >
            <span className="absolute -top-2 px-1.5 py-[1px] rounded-full bg-pink-500 text-white text-[8px] font-black shadow-sm">
              Ücretsiz
            </span>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-500 shadow-sm">
              <Sparkles className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-gray-700">PLAY Show</span>
          </div>

          {/* Evim */}
          <div
            onClick={() => { soundFX.playPop(); if (onOpenFamily) onOpenFamily(); }}
            className="flex flex-col items-center gap-1.5 cursor-pointer active:scale-95 transition"
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-500 shadow-sm">
              <Home className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-gray-700">Evim</span>
          </div>
        </div>
      </div>

      {/* ═══ MENÜ LİSTESİ ═══ */}
      <div className="mt-2 bg-white">
        {/* Cazibe & Aktiflik Seviyeleri */}
        <div
          onClick={() => {
            soundFX.playPop();
            setCharmModalInitialTab('charm');
            setShowCharmModal(true);
          }}
          className="flex items-center justify-between px-4 py-3.5 border-b border-gray-50 cursor-pointer active:bg-gray-50"
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">⭐</span>
            <span className="text-sm font-medium text-gray-800">Cazibe & Aktiflik Seviyeleri</span>
          </div>
          <div className="flex items-center gap-2">
            <CharmBadge level={charmInfo.level || 2} size="sm" />
            <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 text-[10px] font-black">
              LV {currentUser.level || 1}
            </span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>
        </div>

        {/* Hediye Duvarı */}
        <div
          onClick={() => {
            soundFX.playPop();
            setShowGiftWallModal(true);
          }}
          className="flex items-center justify-between px-4 py-3.5 border-b border-gray-50 cursor-pointer active:bg-gray-50"
        >
          <div className="flex items-center gap-3">
            <Gift className="w-5 h-5 text-rose-500" />
            <span className="text-sm font-medium text-gray-800">Hediye Duvarı</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-rose-500 font-bold bg-rose-50 px-2 py-0.5 rounded-full">64 Hediye</span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>
        </div>

        {/* Benim Anlarım */}
        <div
          onClick={() => {
            soundFX.playPop();
            if (onNavigateToTab) onNavigateToTab('moments');
          }}
          className="flex items-center justify-between px-4 py-3.5 border-b border-gray-50 cursor-pointer active:bg-gray-50"
        >
          <div className="flex items-center gap-3">
            <span className="text-lg">📱</span>
            <span className="text-sm font-medium text-gray-800">Benim Anlarım</span>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </div>

        {/* Başarılarım */}
        <div
          onClick={() => { soundFX.playPop(); if (onOpenLeaderboard) onOpenLeaderboard(); }}
          className="flex items-center justify-between px-4 py-3.5 border-b border-gray-50 cursor-pointer active:bg-gray-50"
        >
          <div className="flex items-center gap-3">
            <Trophy className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-800">Başarılarım</span>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </div>

        {/* Beni kim ziyaret etti */}
        <div
          onClick={() => {
            soundFX.playPop();
            setShowVisitorBookModal(true);
          }}
          className="flex items-center justify-between px-4 py-3.5 border-b border-gray-50 cursor-pointer active:bg-gray-50"
        >
          <div className="flex items-center gap-3">
            <Eye className="w-5 h-5 text-cyan-600" />
            <span className="text-sm font-medium text-gray-800">Beni kim ziyaret etti</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-cyan-600 font-bold bg-cyan-50 px-2 py-0.5 rounded-full">6 Yeni</span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>
        </div>

        {/* Arkadaşları Davet Et */}
        <div
          onClick={() => {
            soundFX.playPop();
            if (navigator.share) {
              navigator.share({
                title: 'Luvia Party',
                text: `${currentUser.username} seni Luvia Party dünyasına davet ediyor! Birlikte sesli odalarda takılalım ve oyunlar oynayalım!`,
                url: window.location.href,
              }).catch(() => {});
            } else {
              handleCopyId();
              alert(`Davet kodun (ID: ${userNumericId}) panoya kopyalandı! Arkadaşlarınla paylaşabilirsin.`);
            }
          }}
          className="flex items-center justify-between px-4 py-3.5 border-b border-gray-50 cursor-pointer active:bg-gray-50"
        >
          <div className="flex items-center gap-3">
            <UserPlus className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-800">Arkadaşları Davet Et</span>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </div>

        {/* Özel ID */}
        <div
          onClick={handleCopyId}
          className="flex items-center justify-between px-4 py-3.5 border-b border-gray-50 cursor-pointer active:bg-gray-50"
        >
          <div className="flex items-center gap-3">
            <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 text-xs font-bold">ID</span>
            <span className="text-sm font-medium text-gray-800">Özel ID: {userNumericId}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-400">
            {copied ? <span className="text-emerald-500 font-bold">Kopyalandı!</span> : <span>Kopyala</span>}
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>
        </div>

        {/* Rozet */}
        <div
          onClick={() => {
            soundFX.playPop();
            setActiveInfoModal({
              title: 'Kazanılan Rozetler',
              icon: '⭐',
              description: '🌟 Parti Ustası, 🎙️ Aktif Mikrofon, 🛡️ Topluluk Koruyucusu ve 🏎️ Hız Canavarı rozetlerine sahipsin.'
            });
          }}
          className="flex items-center justify-between px-4 py-3.5 border-b border-gray-50 cursor-pointer active:bg-gray-50"
        >
          <div className="flex items-center gap-3">
            <span className="text-amber-500">⭐</span>
            <span className="text-sm font-medium text-gray-800">Rozet</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <span>4 Rozet</span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>
        </div>

        {/* Konuya Katkıda Bulunun */}
        <div
          onClick={() => {
            soundFX.playPop();
            if (onNavigateToTab) onNavigateToTab('moments');
          }}
          className="flex items-center justify-between px-4 py-3.5 border-b border-gray-50 cursor-pointer active:bg-gray-50"
        >
          <div className="flex items-center gap-3">
            <Edit3 className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-800">Konuya Katkıda Bulunun</span>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </div>

        {/* Daha fazla dil */}
        <div
          onClick={() => {
            soundFX.playPop();
            alert('Luvia Party şu anda Türkçe (Varsayılan), English ve العربية dillerini desteklemektedir. Sistem diliniz Türkçe olarak ayarlandı.');
          }}
          className="flex items-center justify-between px-4 py-3.5 border-b border-gray-50 cursor-pointer active:bg-gray-50"
        >
          <div className="flex items-center gap-3">
            <Globe className="w-5 h-5 text-cyan-600" />
            <span className="text-sm font-medium text-gray-800">Daha fazla dil</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-400">Türkçe</span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>
        </div>

        {/* Ebeveyn denetim modu */}
        <div
          onClick={() => {
            soundFX.playPop();
            setActiveInfoModal({
              title: 'Ebeveyn Denetim Modu',
              icon: '🌱',
              description: 'Ebeveyn denetim modu etkindir. Genç kullanıcılar için uygunsuz kelime filtreleri ve ses odası güvenlik kısıtlamaları otomatik devrededir.'
            });
          }}
          className="flex items-center justify-between px-4 py-3.5 border-b border-gray-50 cursor-pointer active:bg-gray-50"
        >
          <div className="flex items-center gap-3">
            <span className="text-lg">🌱</span>
            <span className="text-sm font-medium text-gray-800">Ebeveyn denetim modu</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs text-emerald-600 font-bold">Korumalı</span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>
        </div>

        {/* Yardım Merkezi */}
        <div
          onClick={() => {
            soundFX.playPop();
            setActiveInfoModal({
              title: 'Yardım Merkezi & Destek',
              icon: '❓',
              description: 'Sorun bildirmek, oyun önerisi sunmak veya hesap desteği almak için support@luviaparty.com üzerinden 7/24 bizimle iletişime geçebilirsiniz.'
            });
          }}
          className="flex items-center justify-between px-4 py-3.5 border-b border-gray-50 cursor-pointer active:bg-gray-50"
        >
          <div className="flex items-center gap-3">
            <HelpCircle className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-800">Yardım Merkezi</span>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </div>

        {/* Güvenlik Merkezi */}
        <div
          onClick={() => {
            soundFX.playPop();
            setActiveInfoModal({
              title: 'Güvenlik Merkezi',
              icon: '🛡️',
              description: 'Hesabınız 256-bit uçtan uca şifreleme ve Firebase Güvenli Kimlik Doğrulama ile korunmaktadır. Şifrenizi asla kimseyle paylaşmayın.'
            });
          }}
          className="flex items-center justify-between px-4 py-3.5 border-b border-gray-50 cursor-pointer active:bg-gray-50"
        >
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-emerald-600" />
            <span className="text-sm font-medium text-gray-800">Güvenlik Merkezi</span>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </div>

        {/* Ayarlar */}
        <div
          onClick={() => {
            soundFX.playPop();
            setShowSettingsModal(true);
          }}
          className="flex items-center justify-between px-4 py-3.5 border-b border-gray-50 cursor-pointer active:bg-gray-50"
        >
          <div className="flex items-center gap-3">
            <Settings className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-800">Ayarlar</span>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </div>

        {/* Çıkış Yap */}
        {onSignOut && (
          <div
            onClick={() => { soundFX.playPop(); onSignOut(); }}
            className="flex items-center justify-between px-4 py-3.5 cursor-pointer active:bg-red-50 text-red-500"
          >
            <div className="flex items-center gap-3">
              <LogOut className="w-5 h-5" />
              <span className="text-sm font-bold">Hesaptan Çıkış Yap</span>
            </div>
            <ChevronRight className="w-4 h-4 text-red-300" />
          </div>
        )}
      </div>

      {/* Luvia App Branding Footer */}
      <div className="py-6 flex flex-col items-center justify-center gap-1.5 opacity-80">
        <div className="w-10 h-10 rounded-2xl overflow-hidden shadow-sm border border-pink-300/40">
          <img src="/luvia-logo.png" alt="Luvia" className="w-full h-full object-cover" />
        </div>
        <span className="text-xs font-black text-gray-800 tracking-tight flex items-center gap-1">
          <span>Luvia</span>
          <span className="text-pink-500 text-xs">♥</span>
        </span>
        <span className="text-[10px] font-extrabold text-pink-500 uppercase tracking-widest">
          Play. Connect. Vibe.
        </span>
      </div>
    </div>
      )}

      {/* ═══ CAZİBE & AKTİFLİK SEVİYELERİ MODAL (WePlay Metodu) ═══ */}
      {showCharmModal && (
        <CharmAndLevelModal
          currentUser={currentUser}
          initialTab={charmModalInitialTab}
          onClose={() => setShowCharmModal(false)}
          onOpenCheckIn={() => {
            setShowCharmModal(false);
          }}
          onOpenLobby={() => {
            setShowCharmModal(false);
            if (onNavigateToTab) onNavigateToTab('lobby');
          }}
          onOpenLeaderboard={() => {
            setShowCharmModal(false);
            if (onOpenLeaderboard) onOpenLeaderboard();
          }}
        />
      )}

      {/* ═══ AYARLAR MODAL BİLEŞENİ ═══ */}
      {showSettingsModal && (
        <AppSettingsModal
          onClose={() => setShowSettingsModal(false)}
          onSignOut={onSignOut}
        />
      )}

      {/* ═══ HEDİYE DUVARI MODAL BİLEŞENİ (media_1790342350194.jpg) ═══ */}
      {showGiftWallModal && (
        <GiftWallModal
          currentUser={currentUser}
          onClose={() => setShowGiftWallModal(false)}
        />
      )}

      {/* ═══ BENİ KİM ZİYARET ETTİ & DEFTER MODAL BİLEŞENİ (media_1790342350195.jpg) ═══ */}
      {showVisitorBookModal && (
        <VisitorBookModal
          currentUser={currentUser}
          onUpdateUser={onUpdateUser || (() => {})}
          onClose={() => setShowVisitorBookModal(false)}
        />
      )}

      {/* ═══ BİLGİLENDİRME & DİYALOG MODALI ═══ */}
      {activeInfoModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-xs w-full text-center shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-200">
            <div className="text-4xl mb-2">{activeInfoModal.icon || 'ℹ️'}</div>
            <h3 className="text-base font-black text-gray-900">{activeInfoModal.title}</h3>
            <p className="text-xs text-gray-600 mt-2 leading-relaxed">
              {activeInfoModal.description}
            </p>
            <button
              onClick={() => setActiveInfoModal(null)}
              className="mt-5 w-full py-2.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-white font-bold text-xs shadow-md shadow-cyan-200 active:scale-95 transition"
            >
              Tamam
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
