# Templates Directory

This directory contains template images for the Pickabook personalization system.

## Template Requirements

Templates should be:
- **Format**: PNG with transparent background (recommended) or solid background
- **Size**: 1024x1024 pixels or similar square dimensions
- **Design**: Children's book illustration style with a designated area for the face

## Creating Templates

1. Design a children's book scene or background in your favorite image editor (Figma, Photoshop, Canva, etc.)
2. Leave a rectangular space where the child's face will be placed
3. Export as PNG at 1024x1024 pixels
4. Save as `template1.png`, `template2.png`, etc.

## Template Configuration

The face position for each template is defined in `lib/image-compositor.ts`:

```typescript
const TEMPLATES: Record<string, TemplateConfig> = {
  template1: {
    name: 'template1',
    facePosition: {
      x: 300,      // pixels from left
      y: 150,      // pixels from top
      width: 400,  // width of face area
      height: 400, // height of face area
    },
  },
};
```

When you add a new template, update this configuration to match your design.

## Example Template Ideas

1. **Adventure Scene**: Child as explorer in a jungle or mountain scene
2. **Space Explorer**: Child in an astronaut suit floating in space
3. **Magical Garden**: Child in a colorful garden with flowers and butterflies
4. **Under the Sea**: Child as a diver exploring underwater
5. **Storybook Hero**: Child as a knight, princess, or superhero

## Quick Start (for prototype)

For quick testing, you can:
1. Use Canva's free templates for children's book illustrations
2. Remove the character's face and leave that area for the AI-generated face
3. Export and save here as `template1.png`

Alternatively, the system will work without templates - it will simply return the AI-generated cartoon face directly.
