import React, { useState } from 'react';
import {
  X,
  Bell,
  Volume2,
  VolumeX,
  Shield,
  Trash2,
  Info,
  ChevronRight,
  FileText,
  UserX,
  Users,
  Check
} from 'lucide-react';
import { soundFX } from '../../utils/soundEffects';

interface AppSettingsModalProps {
  onClose: () => void;
  onClearCache?: () => void;
  onSignOut?: () => void;
}

export const AppSettingsModal: React.FC<AppSettingsModalProps> = ({
  onClose,
  onClearCache,
  onSignOut,
}) => {
  const [subPage, setSubPage] = useState<
    'main' | 'account' | 'notifications' | 'privacy' | 'about' | 'blocked'
  >('main');

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [gameInvites, setGameInvites] = useState(true);
  const [dmNotifications, setDmNotifications] = useState(true);
  const [hideOnlineStatus, setHideOnlineStatus] = useState(false);
  const [incognitoVisit, setIncognitoVisit] = useState(false);
  const [cacheSize, setCacheSize] = useState('24.8 MB');

  const handleClearCache = () => {
    soundFX.playSuccess();
    setCacheSize('0.0 KB');
    if (onClearCache) onClearCache();
    alert('Uygulama önbelleği başarıyla temizlendi.');
  };

  return (
    <div className="fixed inset-0 z-50 bg-white text-gray-800 flex flex-col overflow-y-auto no-scrollbar select-none animate-in slide-in-from-right duration-200">
      {/* ═══ HEADER ═══ */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100 bg-white sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          {subPage !== 'main' ? (
            <button
              onClick={() => setSubPage('main')}
              className="p-1 text-gray-600 hover:text-gray-900 active:scale-95"
            >
              <ChevronRight className="w-6 h-6 rotate-180" />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="p-1 text-gray-600 hover:text-gray-900 active:scale-95"
            >
              <X className="w-6 h-6" />
            </button>
          )}
          <h2 className="text-base font-black text-gray-900">
            {subPage === 'main' && 'Ayarlar'}
            {subPage === 'account' && 'Hesap & Güvenlik'}
            {subPage === 'notifications' && 'Bildirim Ayarları'}
            {subPage === 'privacy' && 'Gizlilik & Görünürlük'}
            {subPage === 'about' && 'Hakkında'}
            {subPage === 'blocked' && 'Engellenen Kullanıcılar'}
          </h2>
        </div>
      </div>

      {/* ═══ SUB PAGE: MAIN MENU ═══ */}
      {subPage === 'main' && (
        <div className="flex-1 bg-[#f6f7fb] pb-12">
          {/* Grup 1: Hesap & Gizlilik */}
          <div className="mt-3 bg-white border-y border-gray-100">
            <div
              onClick={() => { soundFX.playPop(); setSubPage('account'); }}
              className="flex items-center justify-between px-4 py-3.5 border-b border-gray-50 cursor-pointer active:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-indigo-500" />
                <span className="text-sm font-medium text-gray-800">Hesap & Güvenlik</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>

            <div
              onClick={() => { soundFX.playPop(); setSubPage('notifications'); }}
              className="flex items-center justify-between px-4 py-3.5 border-b border-gray-50 cursor-pointer active:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-amber-500" />
                <span className="text-sm font-medium text-gray-800">Bildirim Ayarları</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>

            <div
              onClick={() => { soundFX.playPop(); setSubPage('privacy'); }}
              className="flex items-center justify-between px-4 py-3.5 border-b border-gray-50 cursor-pointer active:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-cyan-500" />
                <span className="text-sm font-medium text-gray-800">Gizlilik & Görünürlük</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>

            <div
              onClick={() => { soundFX.playPop(); setSubPage('blocked'); }}
              className="flex items-center justify-between px-4 py-3.5 cursor-pointer active:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                <UserX className="w-5 h-5 text-rose-500" />
                <span className="text-sm font-medium text-gray-800">Engellenenler Listesi</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>
          </div>

          {/* Grup 2: Ses & Titreşim Hızlı Toggles */}
          <div className="mt-3 bg-white border-y border-gray-100">
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-50">
              <div className="flex items-center gap-3">
                {soundEnabled ? <Volume2 className="w-5 h-5 text-emerald-500" /> : <VolumeX className="w-5 h-5 text-gray-400" />}
                <span className="text-sm font-medium text-gray-800">Ses Efektleri</span>
              </div>
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                  soundEnabled ? 'bg-cyan-500' : 'bg-gray-200'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    soundEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between px-4 py-3.5">
              <span className="text-sm font-medium text-gray-800 pl-8">Dokunma Titreşimi</span>
              <button
                onClick={() => setVibrationEnabled(!vibrationEnabled)}
                className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                  vibrationEnabled ? 'bg-cyan-500' : 'bg-gray-200'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    vibrationEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Grup 3: Önbellek & Hakkında */}
          <div className="mt-3 bg-white border-y border-gray-100">
            <div
              onClick={handleClearCache}
              className="flex items-center justify-between px-4 py-3.5 border-b border-gray-50 cursor-pointer active:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                <Trash2 className="w-5 h-5 text-gray-500" />
                <span className="text-sm font-medium text-gray-800">Önbelleği Temizle</span>
              </div>
              <span className="text-xs text-gray-400 font-mono">{cacheSize}</span>
            </div>

            <div
              onClick={() => { soundFX.playPop(); setSubPage('about'); }}
              className="flex items-center justify-between px-4 py-3.5 cursor-pointer active:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                <Info className="w-5 h-5 text-gray-500" />
                <span className="text-sm font-medium text-gray-800">Luvia Party Hakkında</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <span>v2.4.0</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Çıkış Yap Butonu */}
          {onSignOut && (
            <div className="mt-6 px-4">
              <button
                onClick={() => {
                  soundFX.playPop();
                  if (confirm('Hesabınızdan çıkış yapmak istediğinize emin misiniz?')) {
                    onSignOut();
                  }
                }}
                className="w-full py-3.5 rounded-2xl bg-white border border-red-200 text-red-500 hover:bg-red-50 font-bold text-sm shadow-sm active:scale-98 transition"
              >
                Hesaptan Çıkış Yap
              </button>
            </div>
          )}
        </div>
      )}

      {/* ═══ SUB PAGE: ACCOUNT & SECURITY ═══ */}
      {subPage === 'account' && (
        <div className="flex-1 bg-[#f6f7fb] p-4 space-y-3">
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Bağlı Hesap:</span>
              <span className="font-bold text-gray-900">Google / Firebase</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Güvenlik Durumu:</span>
              <span className="font-bold text-emerald-600 flex items-center gap-1">
                <Check className="w-4 h-4" /> Korumalı
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ═══ SUB PAGE: NOTIFICATIONS ═══ */}
      {subPage === 'notifications' && (
        <div className="flex-1 bg-[#f6f7fb] pt-3">
          <div className="bg-white border-y border-gray-100 divide-y divide-gray-50">
            <div className="flex items-center justify-between px-4 py-3.5">
              <div>
                <span className="text-sm font-medium text-gray-800 block">Oyun Davetleri</span>
                <span className="text-xs text-gray-400">Arkadaşlardan gelen masa davetleri</span>
              </div>
              <button
                onClick={() => setGameInvites(!gameInvites)}
                className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                  gameInvites ? 'bg-cyan-500' : 'bg-gray-200'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    gameInvites ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between px-4 py-3.5">
              <div>
                <span className="text-sm font-medium text-gray-800 block">Özel Mesajlar</span>
                <span className="text-xs text-gray-400">Sohbet bildirimleri</span>
              </div>
              <button
                onClick={() => setDmNotifications(!dmNotifications)}
                className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                  dmNotifications ? 'bg-cyan-500' : 'bg-gray-200'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    dmNotifications ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ SUB PAGE: PRIVACY ═══ */}
      {subPage === 'privacy' && (
        <div className="flex-1 bg-[#f6f7fb] pt-3">
          <div className="bg-white border-y border-gray-100 divide-y divide-gray-50">
            <div className="flex items-center justify-between px-4 py-3.5">
              <div>
                <span className="text-sm font-medium text-gray-800 block">Çevrim İçi Durumunu Gizle</span>
                <span className="text-xs text-gray-400">Diğer kullanıcılar seni çevrim dışı görür</span>
              </div>
              <button
                onClick={() => setHideOnlineStatus(!hideOnlineStatus)}
                className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                  hideOnlineStatus ? 'bg-cyan-500' : 'bg-gray-200'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    hideOnlineStatus ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between px-4 py-3.5">
              <div>
                <span className="text-sm font-medium text-gray-800 block">Gizli Ziyaretçi Modu</span>
                <span className="text-xs text-gray-400">Profilini ziyaret ettiğin kişilerin listesinde görünme</span>
              </div>
              <button
                onClick={() => setIncognitoVisit(!incognitoVisit)}
                className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                  incognitoVisit ? 'bg-cyan-500' : 'bg-gray-200'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    incognitoVisit ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ SUB PAGE: BLOCKED USERS ═══ */}
      {subPage === 'blocked' && (
        <div className="flex-1 bg-[#f6f7fb] p-6 flex flex-col items-center justify-center text-center">
          <UserX className="w-12 h-12 text-gray-300 mb-2" />
          <p className="text-sm font-bold text-gray-700">Engellenen Kullanıcı Yok</p>
          <p className="text-xs text-gray-400 mt-1 max-w-xs">
            Engellediğiniz kullanıcılar odalarda veya mesajlarda sizi rahatsız edemez.
          </p>
        </div>
      )}

      {/* ═══ SUB PAGE: ABOUT ═══ */}
      {subPage === 'about' && (
        <div className="flex-1 bg-[#f6f7fb] p-6 flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-3xl overflow-hidden shadow-xl shadow-pink-200 border border-pink-400/30 mb-3">
            <img src="/luvia-logo.png" alt="Luvia Logo" className="w-full h-full object-cover" />
          </div>
          <h3 className="text-xl font-black text-gray-900 tracking-tight">Luvia</h3>
          <p className="text-xs font-extrabold text-pink-500 uppercase tracking-wider mt-0.5">
            Play. Connect. Vibe.
          </p>
          <span className="text-[11px] text-gray-400 mt-1">Sürüm 2.4.0 (Build 2026.09)</span>

          <div className="mt-8 bg-white rounded-2xl p-4 border border-gray-100 shadow-sm w-full text-left space-y-3">
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span>Geliştirici</span>
              <span className="font-bold text-gray-900">Luvia Interactive Entertainment</span>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span>Hizmet Şartları</span>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span>Gizlilik Politikası</span>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
