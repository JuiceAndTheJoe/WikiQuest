import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./SplitText.css";

gsap.registerPlugin(ScrollTrigger);

const SplitText = ({
  text = "",
  tag = "div",
  className = "",
  delay = 100,
  duration = 0.6,
  ease = "power3.out",
  splitType = "chars",
  from = { opacity: 0, y: 40 },
  to = { opacity: 1, y: 0 },
  textAlign = "center",
  repeat = 0,
  repeatDelay = 0.5,
  onLetterAnimationComplete,
}) => {
  const containerRef = useRef(null);
  const splitCharsRef = useRef([]);

  useEffect(() => {
    if (!text || !containerRef.current) return;

    // Split text into characters or words
    const chars =
      splitType === "words"
        ? text.split(" ").map((word) => word + " ")
        : text.split("");

    // Clear previous elements
    containerRef.current.innerHTML = "";
    splitCharsRef.current = [];

    // Create span elements for each character/word
    chars.forEach((char) => {
      const span = document.createElement("span");
      span.textContent = char;
      span.className = "split-text-char";
      containerRef.current.appendChild(span);
      splitCharsRef.current.push(span);
    });

    // Set initial state (from values)
    gsap.set(splitCharsRef.current, from);

    // Immediately animate without waiting for scroll trigger
    gsap.to(splitCharsRef.current, {
      ...to,
      duration: duration,
      ease: ease,
      stagger: {
        amount: (delay * (splitCharsRef.current.length - 1)) / 1000,
        from: "start",
      },
      repeat: repeat,
      repeatDelay: repeatDelay,
      yoyo: repeat > 0,
      onComplete: onLetterAnimationComplete,
    });

    return () => {
      gsap.killTweensOf(splitCharsRef.current);
    };
  }, [
    text,
    splitType,
    delay,
    duration,
    ease,
    from,
    to,
    repeat,
    repeatDelay,
    onLetterAnimationComplete,
  ]);

  const Tag = tag;

  return (
    <Tag
      ref={containerRef}
      className={`split-text-container ${className}`}
      style={{
        textAlign,
        display: "inline-block",
      }}
    />
  );
};

export default SplitText;
