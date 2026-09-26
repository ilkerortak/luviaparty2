import React, { useEffect, useState, useRef } from 'react';

interface AutoAppViewportProps {
  children: React.ReactNode;
}

/**
 * 📱 AutoAppViewport (AutoGameViewport)
 * Her telefon modeli, tablet ve ekran çözünürlüğü için akıllı otomatik ölçeklendirme motoru.
 * Unity CanvasScaler / Phaser Scale.FIT mimarisi:
 * - Cihazın anlık genişlik ve yükseklik oranını tespit eder.
 * - Tasarım taban çözünürlüğünü dinamik olarak hesaplar.
 * - Ekranı taşmayacak şekilde CSS transform scale ile %100 tam sığdırır.
 * - Klavye açıldığında visualViewport ile anında yeniden adapte olur.
 */
export const AutoGameViewport: React.FC<AutoAppViewportProps> = ({ children }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState(() => {
    const winW = typeof window !== 'undefined' ? (window.visualViewport?.width || window.innerWidth) : 390;
    const winH = typeof window !== 'undefined' ? (window.visualViewport?.height || window.innerHeight) : 844;
    const targetW = Math.min(winW, 440);
    const targetH = winH;
    const ratio = targetH / Math.max(1, targetW);
    const baseW = 390;
    const baseH = Math.min(960, Math.max(660, Math.round(baseW * ratio)));
    const s = Math.min(targetW / baseW, targetH / baseH);
    return {
      baseWidth: baseW,
      baseHeight: baseH,
      scale: s,
      scaledWidth: Math.round(baseW * s),
      scaledHeight: Math.round(baseH * s),
    };
  });

  useEffect(() => {
    const calculateScale = () => {
      const vh = window.visualViewport?.height || window.innerHeight;
      const vw = window.visualViewport?.width || window.innerWidth;

      // Geniş ekran veya tabletlerde maksimum 440px mobil genişliği
      const targetW = Math.min(vw, 440);
      const targetH = vh;
      const ratio = targetH / Math.max(1, targetW);

      // 390px standart mobil tasarım tabanı
      const baseW = 390;
      // Ekran en-boy oranına göre tasarım yüksekliğini esnet (min 660px, max 960px)
      const baseH = Math.min(960, Math.max(660, Math.round(baseW * ratio)));

      // En ve boydan ekranı aşmayan kesin ölçek
      const s = Math.min(targetW / baseW, targetH / baseH);

      setDimensions({
        baseWidth: baseW,
        baseHeight: baseH,
        scale: s,
        scaledWidth: Math.round(baseW * s),
        scaledHeight: Math.round(baseH * s),
      });
    };

    calculateScale();

    window.addEventListener('resize', calculateScale);
    window.addEventListener('orientationchange', calculateScale);
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', calculateScale);
      window.visualViewport.addEventListener('scroll', calculateScale);
    }

    return () => {
      window.removeEventListener('resize', calculateScale);
      window.removeEventListener('orientationchange', calculateScale);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', calculateScale);
        window.visualViewport.removeEventListener('scroll', calculateScale);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-[100dvh] bg-[#060812] flex items-center justify-center overflow-hidden relative select-none"
      style={{
        touchAction: 'manipulation',
      }}
    >
      {/* Cihaz ekranına tam oturan dış sınır kutusu */}
      <div
        style={{
          width: `${dimensions.scaledWidth}px`,
          height: `${dimensions.scaledHeight}px`,
          position: 'relative',
          overflow: 'hidden',
        }}
        className="shadow-2xl flex-shrink-0"
      >
        {/* Sanal taban çözünürlük sahnesi (Her telefonda tam sığar) */}
        <div
          style={{
            width: `${dimensions.baseWidth}px`,
            height: `${dimensions.baseHeight}px`,
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: `translate(-50%, -50%) scale(${dimensions.scale})`,
            transformOrigin: 'center center',
          }}
          className="flex flex-col overflow-hidden bg-[#090b16]"
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export const AutoAppViewport = AutoGameViewport;

