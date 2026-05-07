import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import { withAppBase } from "../../lib/app-base";

function getIntroVideoSrc() {
  if (typeof window === "undefined") return withAppBase("/pc1.mp4");

  const isPhone =
    window.innerWidth <= 900 ||
    window.matchMedia("(pointer: coarse)").matches ||
    window.matchMedia("(hover: none)").matches;

  return isPhone
    ? `${withAppBase("/pc2-mobile.mp4")}?v=2`
    : withAppBase("/pc1.mp4");
}

export default function VideoIntro({ onComplete }: { onComplete: () => void }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const completedRef = useRef(false);
  const [fadeOut, setFadeOut] = useState(false);
  const videoSrc = useMemo(getIntroVideoSrc, []);

  useEffect(() => {
    const finish = () => {
      if (completedRef.current) return;
      completedRef.current = true;
      setFadeOut(true);
      window.setTimeout(onComplete, 220);
    };

    const video = videoRef.current;
    video?.load();
    void video?.play().catch(() => undefined);

    video?.addEventListener("ended", finish);

    const retryPlay = () => {
      void video?.play().catch(() => undefined);
    };

    window.addEventListener("touchstart", retryPlay, { once: true, passive: true });
    window.addEventListener("click", retryPlay, { once: true });

    const timer = window.setTimeout(finish, 11000);

    return () => {
      window.clearTimeout(timer);
      video?.removeEventListener("ended", finish);
      window.removeEventListener("touchstart", retryPlay);
      window.removeEventListener("click", retryPlay);
    };
  }, [onComplete]);

  return (
    <motion.div
      className="intro"
      animate={{ opacity: fadeOut ? 0 : 1 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
    >
      <video
        ref={videoRef}
        className="intro-video"
        src={videoSrc}
        autoPlay
        muted
        playsInline
        preload="auto"
      />
      <div className="intro-shade" />
      <div className="intro-brand">
        <motion.p initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          مرحبا بكم في
        </motion.p>
        <motion.h1 initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.8, duration: 1.1 }}>
          Hamdi
        </motion.h1>
        <motion.h2 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.15 }}>
          Voyage
        </motion.h2>
        <motion.span initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 1.5, duration: 1 }} />
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.8 }}>
          رحلتكم إلى مكة تبدأ هنا
        </motion.p>
      </div>
    </motion.div>
  );
}
