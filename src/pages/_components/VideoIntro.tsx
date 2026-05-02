import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";

export default function VideoIntro({ onComplete }: { onComplete: () => void }) {
  const [fadeOut, setFadeOut] = useState(false);
  const [ready, setReady] = useState(false);
  const desktopVideoRef = useRef<HTMLVideoElement | null>(null);
  const mobileVideoRef = useRef<HTMLVideoElement | null>(null);
  const completedRef = useRef(false);

  useEffect(() => {
    const finish = () => {
      if (completedRef.current) return;
      completedRef.current = true;
      setFadeOut(true);
      window.setTimeout(onComplete, 260);
    };

    const getActiveVideo = () => {
      const isMobile = window.matchMedia("(max-width: 760px), (pointer: coarse)").matches;
      return isMobile ? mobileVideoRef.current : desktopVideoRef.current;
    };

    const activeVideo = getActiveVideo();
    const markReady = () => setReady(true);

    activeVideo?.addEventListener("loadeddata", markReady);
    activeVideo?.addEventListener("canplay", markReady);
    activeVideo?.addEventListener("playing", markReady);
    activeVideo?.addEventListener("ended", finish);
    activeVideo?.load();
    void activeVideo?.play().catch(() => undefined);

    const replayOnFirstTouch = () => {
      const video = getActiveVideo();
      void video?.play().catch(() => undefined);
    };

    window.addEventListener("touchstart", replayOnFirstTouch, { once: true, passive: true });
    window.addEventListener("click", replayOnFirstTouch, { once: true });

    const maxTimer = window.setTimeout(finish, 14000);

    return () => {
      window.clearTimeout(maxTimer);
      activeVideo?.removeEventListener("loadeddata", markReady);
      activeVideo?.removeEventListener("canplay", markReady);
      activeVideo?.removeEventListener("playing", markReady);
      activeVideo?.removeEventListener("ended", finish);
      window.removeEventListener("touchstart", replayOnFirstTouch);
      window.removeEventListener("click", replayOnFirstTouch);
    };
  }, [onComplete]);

  return (
    <motion.div className="intro" animate={{ opacity: fadeOut ? 0 : 1 }} transition={{ duration: 0.24, ease: "easeOut" }}>
      <video
        ref={desktopVideoRef}
        className="intro-video intro-video-desktop"
        src="/agencedevoyage.github.io/pc1.mp4"
        autoPlay
        muted
        playsInline
        preload="auto"
      />
      <video
        ref={mobileVideoRef}
        className="intro-video intro-video-mobile"
        src="/agencedevoyage.github.io/pc2.mp4"
        autoPlay
        muted
        playsInline
        preload="auto"
      />
      <div className={`intro-shade ${ready ? "ready" : ""}`} />
      <div className="intro-brand">
        <motion.p initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>Bienvenue chez</motion.p>
        <motion.h1 initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.8, duration: 1.1 }}>Hamdi</motion.h1>
        <motion.h2 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.15 }}>Voyage</motion.h2>
        <motion.span initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 1.5, duration: 1 }} />
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.8 }}>Le monde vous attend</motion.p>
      </div>
    </motion.div>
  );
}
