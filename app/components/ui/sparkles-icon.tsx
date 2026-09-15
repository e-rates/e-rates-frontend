import { forwardRef, useImperativeHandle, useCallback } from "react";
import type { AnimatedIconHandle, AnimatedIconProps } from "./types";
import { motion, useAnimate } from "motion/react";

const SparklesIcon = forwardRef<AnimatedIconHandle, AnimatedIconProps>(
  (
    { size = 24, color = "currentColor", strokeWidth = 2, className = "" },
    ref,
  ) => {
    const [scope, animate] = useAnimate();

    const start = useCallback(async () => {
      animate(".sparkle-main", { scale: [1, 1.15, 1], rotate: [0, 12, 0] }, { duration: 0.45, ease: "easeOut" });
      animate(".sparkle-small", { scale: [1, 0.6, 1], opacity: [1, 0.5, 1] }, { duration: 0.45, ease: "easeOut" });
    }, [animate]);

    const stop = useCallback(async () => {
      animate(".sparkle-main, .sparkle-small", { scale: 1, rotate: 0, opacity: 1 }, { duration: 0.2, ease: "easeInOut" });
    }, [animate]);

    useImperativeHandle(ref, () => ({
      startAnimation: start,
      stopAnimation: stop,
    }));

    return (
      <motion.svg
        ref={scope}
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`cursor-pointer ${className}`}
        onHoverStart={start}
        onHoverEnd={stop}
      >
        <motion.path
          className="sparkle-main"
          style={{ transformOrigin: "10px 10px" }}
          d="M10 3l1.9 5.1L17 10l-5.1 1.9L10 17l-1.9-5.1L3 10l5.1-1.9z"
        />
        <motion.path className="sparkle-small" style={{ transformOrigin: "18px 18px" }} d="M18 15v6M15 18h6" />
      </motion.svg>
    );
  },
);

SparklesIcon.displayName = "SparklesIcon";
export default SparklesIcon;
