"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

interface AnimatedTextProps {
  text: string;
  className?: string;
  fontSize?: string;
  delay?: number;
  once?: boolean;
  color?: string;
  type?: "words" | "chars" | "full";
  duration?: number;
}

const AnimatedText = ({
  text,
  className = "",
  delay = 0,
  once = true,
  type = "words",
  duration = 0.05,
}: AnimatedTextProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, margin: "-50px 0px" });

  const getAnimationVariants = () => {
    // Simple full text reveal
    if (type === "full") {
      return {
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.5,
            delay,
            ease: [0.22, 1, 0.36, 1],
          },
        },
      };
    }

    // For words or characters
    return {
      hidden: { opacity: 0, y: 10 },
      visible: {
        opacity: 1,
        y: 0,
        transition: {
          duration: 0.2,
        },
      },
    };
  };

  const getStaggerContainer = () => {
    return {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: duration,
          delayChildren: delay,
        },
      },
    };
  };

  const renderText = () => {
    if (type === "full") {
      return (
        <motion.span variants={getAnimationVariants()}>{text}</motion.span>
      );
    }

    if (type === "words") {
      return text.split(" ").map((word, i) => (
        <motion.span
          key={`word-${i}`}
          className="inline-block"
          variants={getAnimationVariants()}
        >
          {word}
          {i !== text.split(" ").length - 1 && "\u00A0"}
        </motion.span>
      ));
    }

    if (type === "chars") {
      return text.split("").map((char, i) => (
        <motion.span
          key={`char-${i}`}
          className="inline-block"
          variants={getAnimationVariants()}
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ));
    }

    return null;
  };

  return (
    <motion.div
      ref={ref}
      className={`${className}`}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={getStaggerContainer()}
    >
      {renderText()}
    </motion.div>
  );
};

export default AnimatedText;
