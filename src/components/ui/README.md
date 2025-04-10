# UI Components

This directory contains UI components used throughout the application, with a focus on animation and interactive elements.

## Animation Components

### PageTransition

This component handles the initial loading state of the application and transitions between pages. It provides:

- Initial loading screen with the PGI logo
- Smooth fade-in animations when pages load
- Consistent animation pattern across the site

```tsx
import PageTransition from "@/components/ui/PageTransition";

// Wrap your page/component with PageTransition
<PageTransition>
  <YourContent />
</PageTransition>;
```

### AnimatedSection

A versatile component for animating sections of content as they enter the viewport. Ideal for staggered animations on page scroll.

```tsx
import AnimatedSection from "@/components/ui/AnimatedSection";

// Basic usage
<AnimatedSection>
  <p>This content animates when it enters the viewport</p>
</AnimatedSection>

// With options
<AnimatedSection
  delay={0.3}
  direction="left"
  duration={0.8}
  once={true}
  className="your-custom-classes"
>
  <div>Content with custom animation settings</div>
</AnimatedSection>
```

Properties:

- `delay`: Time in seconds to wait before starting animation (default: 0)
- `direction`: Animation direction - "up", "down", "left", "right" (default: "up")
- `duration`: Animation duration in seconds (default: 0.6)
- `once`: Whether animation should run only once (default: true)
- `className`: Custom classes to apply to the container

### AnimatedText

Special component for text animations with different effects:

```tsx
import AnimatedText from "@/components/ui/AnimatedText";

// Animate each word separately
<AnimatedText
  text="This text animates word by word"
  type="words"
  className="text-2xl"
/>

// Animate each character separately
<AnimatedText
  text="Character animation"
  type="chars"
  delay={0.2}
/>

// Animate the text as a whole
<AnimatedText
  text="Simple full text animation"
  type="full"
/>
```

Properties:

- `text`: The text content to animate
- `className`: Custom classes to apply to the container
- `delay`: Time in seconds to wait before starting animation (default: 0)
- `type`: Animation type - "words", "chars", or "full" (default: "words")
- `duration`: Stagger duration for words/chars (default: 0.05)
- `once`: Whether animation should run only once (default: true)

## Animation Context

The app uses an Animation Context provider to manage global animation state, particularly useful for initial page load animations and coordinating related animations.

```tsx
import { useAnimation } from "@/lib/context/AnimationContext";

function MyComponent() {
  const { isFirstLoad, isPageLoaded } = useAnimation();

  return (
    <div>
      {isFirstLoad ? (
        <p>This is the first load of the site</p>
      ) : (
        <p>This is a subsequent page navigation</p>
      )}
    </div>
  );
}
```
