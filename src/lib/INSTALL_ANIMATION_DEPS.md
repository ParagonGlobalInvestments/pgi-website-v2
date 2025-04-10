# Animation Dependencies

To use the animation components provided in this project, you need to ensure you have the following dependencies installed:

```bash
npm install framer-motion@latest
```

The animations in this project use Framer Motion, a popular animation library for React that provides a simple declarative syntax for creating complex animations.

## Components Added:

1. **PageTransition** - Handles page load and transition animations
2. **AnimatedSection** - Animates content sections as they enter the viewport
3. **AnimatedText** - Creates text animations with different effects (words, characters, full text)
4. **AnimationContext** - Provides global animation state management

## How to Use:

1. First, wrap your application with the AnimationProvider in your layout.tsx file.
2. Use the PageTransition component to wrap your main content.
3. Use AnimatedSection and AnimatedText components to animate specific elements on the page.

Example:

```tsx
// In your page component
import AnimatedSection from "@/components/ui/AnimatedSection";
import AnimatedText from "@/components/ui/AnimatedText";

export default function MyPage() {
  return (
    <div>
      <AnimatedText
        text="Welcome to Paragon Global Investments"
        type="words"
        className="text-3xl font-bold"
      />

      <AnimatedSection delay={0.2}>
        <p>This content will animate into view</p>
      </AnimatedSection>
    </div>
  );
}
```
