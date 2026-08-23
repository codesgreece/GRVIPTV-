"use client";

import { motion, useReducedMotion } from "framer-motion";
import { MiniTV } from "@/components/hero/MiniTV";
import {
  heroMiniScreens,
  mobileHiddenMiniScreenIds,
} from "@/data/hero-mini-screens";
import { cn } from "@/lib/cn";

const hideBelowClass: Record<
  NonNullable<(typeof heroMiniScreens)[number]["hideBelow"]>,
  string
> = {
  sm: "hidden sm:block",
  md: "hidden md:block",
  lg: "hidden lg:block",
  xl: "hidden xl:block",
};

export function MiniScreenWall() {
  const reduce = useReducedMotion();

  return (
    <>
      {heroMiniScreens.map((screen) => (
        <motion.div
          key={screen.id}
          className={cn(
            "absolute",
            screen.hideBelow ? hideBelowClass[screen.hideBelow] : undefined,
            mobileHiddenMiniScreenIds.has(screen.id) && "max-sm:hidden",
          )}
          style={{
            top: screen.position.top,
            left: screen.position.left,
            zIndex: screen.zIndex,
            rotate: `${screen.rotation}deg`,
            opacity: screen.opacity,
            filter: screen.blur ? `blur(${screen.blur}px)` : undefined,
            scale: screen.scale,
          }}
          initial={reduce ? false : { opacity: 0, y: 14, scale: screen.scale * 0.92 }}
          animate={{
            opacity: screen.opacity,
            y: 0,
            scale: screen.scale,
          }}
          transition={{
            duration: 0.55,
            delay: screen.animationDelay,
            ease: [0.22, 1, 0.36, 1],
          }}
          aria-hidden
        >
          <motion.div
            animate={
              reduce
                ? undefined
                : { y: [0, -(screen.floatY ?? 4), 0] }
            }
            transition={
              reduce
                ? undefined
                : {
                    duration: screen.floatDuration ?? 7,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: screen.animationDelay,
                  }
            }
          >
            <MiniTV
              image={screen.image}
              alt={screen.alt}
              width={screen.width}
            />
          </motion.div>
        </motion.div>
      ))}
    </>
  );
}
