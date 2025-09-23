/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react/prop-types */
import type React from "react";
import {
  createElement,
  forwardRef,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const tags = [
  "div",
  "section",
  "main",
  "button",
  "a",
  "ul",
  "li",
  "p",
  "header",
  "footer",
  "nav",
  "span",
] as const;

type MotionTag = (typeof tags)[number];

type MotionStyle = Record<string, string | number | undefined>;

type NativeElementProps = React.AllHTMLAttributes<HTMLElement> & {
  ref?: React.Ref<HTMLElement>;
};

function resolveStyleInput(value?: MotionStyle | boolean) {
  return typeof value === "boolean" ? undefined : value;
}

interface MotionTransition {
  duration?: number;
  ease?: string;
  delay?: number;
}

interface MotionBaseProps {
  initial?: MotionStyle | boolean;
  animate?: MotionStyle;
  exit?: MotionStyle;
  whileHover?: MotionStyle;
  whileTap?: MotionStyle;
  layout?: unknown;
  transition?: MotionTransition;
  viewport?: { once?: boolean };
  whileInView?: MotionStyle;
}

type MotionProps = MotionBaseProps & React.AllHTMLAttributes<HTMLElement>;

const DEFAULT_TRANSITION: MotionTransition = {
  duration: 0.18,
  ease: "ease-out",
  delay: 0,
};

function normalizeStyle(input?: MotionStyle) {
  const transforms: string[] = [];
  const resolved: MotionStyle = {};

  if (!input) {
    return resolved;
  }

  Object.entries(input).forEach(([key, value]) => {
    if (value === undefined) return;

    if (key === "x" || key === "translateX") {
      const unitValue = typeof value === "number" ? `${value}px` : String(value);
      transforms.push(`translateX(${unitValue})`);
      return;
    }

    if (key === "y" || key === "translateY") {
      const unitValue = typeof value === "number" ? `${value}px` : String(value);
      transforms.push(`translateY(${unitValue})`);
      return;
    }

    if (key === "scale") {
      transforms.push(`scale(${value})`);
      return;
    }

    if (key === "rotate") {
      const unitValue = typeof value === "number" ? `${value}deg` : String(value);
      transforms.push(`rotate(${unitValue})`);
      return;
    }

    resolved[key] = value;
  });

  if (transforms.length > 0) {
    resolved.transform = transforms.join(" ");
  }

  return resolved;
}

function mergeRefs<T>(refA?: React.Ref<T>, refB?: React.Ref<T>): React.RefCallback<T> {
  return (node) => {
    if (typeof refA === "function") {
      refA(node);
    } else if (refA != null) {
      (refA as React.MutableRefObject<T | null>).current = node;
    }

    if (typeof refB === "function") {
      refB(node);
    } else if (refB != null) {
      (refB as React.MutableRefObject<T | null>).current = node;
    }
  };
}

function createMotionComponent(tag: MotionTag) {
  return forwardRef<HTMLElement, MotionProps>(function MotionComponent(
    props,
    forwardedRef,
  ) {
    const {
      initial,
      animate,
      exit: _exit,
      whileHover,
      whileTap,
      layout: _layout,
      transition,
      viewport,
      whileInView,
      style,
      children,
      onMouseEnter,
      onMouseLeave,
      onMouseDown,
      onMouseUp,
      onTouchStart,
      onTouchEnd,
      ...rest
    } = props;

    const prefersReduced = useReducedMotion();
    const elementRef = useRef<HTMLElement | null>(null);
    const [appliedStyle, setAppliedStyle] = useState<MotionStyle>(() =>
      normalizeStyle(resolveStyleInput(initial)),
    );

    useEffect(() => {
      setAppliedStyle(normalizeStyle(resolveStyleInput(initial)));
    }, [initial]);

    useEffect(() => {
      if (!animate) return;

      if (prefersReduced || typeof window === "undefined") {
        setAppliedStyle((current) => ({
          ...current,
          ...normalizeStyle(resolveStyleInput(animate)),
        }));
        return;
      }

      const id = window.requestAnimationFrame(() => {
        setAppliedStyle((current) => ({
          ...current,
          ...normalizeStyle(resolveStyleInput(animate)),
        }));
      });

      return () => window.cancelAnimationFrame(id);
    }, [animate, prefersReduced]);

    useEffect(() => {
      if (!whileInView) return;
      const node = elementRef.current;

      if (!node || typeof IntersectionObserver === "undefined") return;

      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setAppliedStyle((current) => ({
              ...current,
              ...normalizeStyle(resolveStyleInput(animate)),
              ...normalizeStyle(whileInView),
            }));

            if (viewport?.once) {
              observer.disconnect();
            }
          }
        });
      }, { threshold: 0.25 });

      observer.observe(node);

      return () => observer.disconnect();
    }, [animate, viewport, whileInView]);

    const transitionStyle = useMemo<MotionStyle>(() => {
      if (prefersReduced) {
        return { transition: "opacity 0.001s linear" };
      }

      const merged: MotionTransition = { ...DEFAULT_TRANSITION, ...(transition ?? {}) };
      const duration = merged.duration ?? DEFAULT_TRANSITION.duration;
      const delay = merged.delay ?? DEFAULT_TRANSITION.delay;
      const ease = merged.ease ?? DEFAULT_TRANSITION.ease;

      return { transition: `all ${duration}s ${ease} ${delay}s` };
    }, [prefersReduced, transition]);

    const handleHoverStart = (event: React.MouseEvent<HTMLElement>) => {
      onMouseEnter?.(event);

      if (whileHover) {
        setAppliedStyle((current) => ({
          ...current,
          ...normalizeStyle(whileHover),
        }));
      }
    };

    const handleHoverEnd = (event: React.MouseEvent<HTMLElement>) => {
      onMouseLeave?.(event);

      if (whileHover) {
        setAppliedStyle((current) => ({
          ...current,
          ...normalizeStyle(resolveStyleInput(animate ?? initial)),
        }));
      }
    };

    const handleTapStart = (
      event: React.MouseEvent<HTMLElement> | React.TouchEvent<HTMLElement>,
    ) => {
      if (event.type === "mousedown") {
        onMouseDown?.(event as React.MouseEvent<HTMLElement>);
      }

      if (event.type === "touchstart") {
        onTouchStart?.(event as React.TouchEvent<HTMLElement>);
      }

      if (whileTap) {
        setAppliedStyle((current) => ({
          ...current,
          ...normalizeStyle(whileTap),
        }));
      }
    };

    const handleTapEnd = (
      event: React.MouseEvent<HTMLElement> | React.TouchEvent<HTMLElement>,
    ) => {
      if (event.type === "mouseup") {
        onMouseUp?.(event as React.MouseEvent<HTMLElement>);
      }

      if (event.type === "touchend") {
        onTouchEnd?.(event as React.TouchEvent<HTMLElement>);
      }

      if (whileTap) {
        setAppliedStyle((current) => ({
          ...current,
          ...normalizeStyle(resolveStyleInput(animate ?? initial)),
        }));
      }
    };

    const baseStyle = normalizeStyle(style as MotionStyle | undefined);
    const combinedStyle: MotionStyle = {
      ...baseStyle,
      ...transitionStyle,
      ...appliedStyle,
    };

    const elementProps: NativeElementProps = {
      ...(rest as React.AllHTMLAttributes<HTMLElement>),
      ref: mergeRefs(forwardedRef, elementRef),
      onMouseEnter: handleHoverStart,
      onMouseLeave: handleHoverEnd,
      onMouseDown: handleTapStart,
      onMouseUp: handleTapEnd,
      onTouchStart: handleTapStart,
      onTouchEnd: handleTapEnd,
      style: combinedStyle as React.CSSProperties,
    };

    return createElement(tag, elementProps, children);
  });
}

type MotionComponents = Record<MotionTag, ReturnType<typeof createMotionComponent>>;

const motion = tags.reduce<MotionComponents>((accumulator, tag) => {
  accumulator[tag] = createMotionComponent(tag);
  return accumulator;
}, {} as MotionComponents);

export { motion };

interface AnimatePresenceProps {
  children: React.ReactNode;
  initial?: boolean;
  mode?: "wait" | "sync" | "popLayout";
}

export function AnimatePresence({ children }: AnimatePresenceProps) {
  return <>{children}</>;
}

export function useReducedMotion() {
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setPrefersReduced(mediaQuery.matches);

    update();
    mediaQuery.addEventListener("change", update);

    return () => mediaQuery.removeEventListener("change", update);
  }, []);

  return prefersReduced;
}
