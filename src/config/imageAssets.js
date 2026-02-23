// Hosted image catalog for AI generation
// Base URL — update if domain changes
const BASE = 'https://expritor.com/assets/images';
const e = (name) => `${BASE}/${encodeURIComponent(name)}`;

const IMAGE_CATALOG = [
  // --- Furniture ---
  { url: e('modern-chair-with-no-background 1.png'), tags: ['furniture', 'chair', 'modern', 'product'], category: 'furniture' },
  { url: e('beautiful-shot-modern-black-grey-chair-isolated-white 1.png'), tags: ['furniture', 'chair', 'black', 'grey', 'modern', 'product'], category: 'furniture' },
  { url: e('elegant-wooden-rocking-chair 1.png'), tags: ['furniture', 'chair', 'wooden', 'rocking', 'classic', 'product'], category: 'furniture' },
  { url: e('furniture-modern-studio-lifestyle-green 1.png'), tags: ['furniture', 'chair', 'green', 'modern', 'lifestyle', 'product'], category: 'furniture' },
  { url: e('grey-comfortable-armchair-isolated-white-background 1.png'), tags: ['furniture', 'armchair', 'grey', 'comfortable', 'product'], category: 'furniture' },
  { url: e('sofa-chair-isolate-white-surface 1.png'), tags: ['furniture', 'sofa', 'chair', 'product'], category: 'furniture' },
  { url: e('vertical-shot-back-gray-chair 1.png'), tags: ['furniture', 'chair', 'gray', 'product'], category: 'furniture' },
  { url: e('modern-lifestyle-furniture-chair-white-background 1.png'), tags: ['furniture', 'chair', 'modern', 'lifestyle', 'product'], category: 'furniture' },

  // --- Home Decor ---
  { url: e('narrow-neck-vase 1.png'), tags: ['decor', 'vase', 'home', 'product'], category: 'decor' },
  { url: e('vase-with-tulip-desk 1.png'), tags: ['decor', 'vase', 'tulip', 'flowers', 'home', 'product'], category: 'decor' },
  { url: e('vase-with-tulips-roses 1.png'), tags: ['decor', 'vase', 'tulips', 'roses', 'flowers', 'home', 'product'], category: 'decor' },

  // --- Food ---
  { url: e('beef-vegetables-sesame-seeds-white-plate-isolated-white-background 1.png'), tags: ['food', 'beef', 'vegetables', 'plate', 'restaurant', 'meal'], category: 'food' },
  { url: e('delicious-loco-moco-burger-beef-isolated-white-background 1.png'), tags: ['food', 'burger', 'beef', 'restaurant', 'fast-food'], category: 'food' },
  { url: e('pasta-salad-bowl 1.png'), tags: ['food', 'pasta', 'salad', 'bowl', 'restaurant', 'healthy'], category: 'food' },
  { url: e('tasty-pork-belly-buns-isolated-white-background 1.png'), tags: ['food', 'pork', 'buns', 'restaurant', 'asian'], category: 'food' },

  // --- People / Fashion (Male) ---
  { url: e('blond-man-brown-shirt 1.png'), tags: ['person', 'man', 'fashion', 'casual', 'model'], category: 'people' },
  { url: e('male-natural-fresh-cool-casual 1.png'), tags: ['person', 'man', 'fashion', 'casual', 'cool', 'model'], category: 'people' },
  { url: e('man-black-jacket-studio-shot-dark-background 1.png'), tags: ['person', 'man', 'fashion', 'jacket', 'dark', 'model'], category: 'people' },
  { url: e('man-wearing-leather-jacket 1.png'), tags: ['person', 'man', 'fashion', 'leather', 'jacket', 'model'], category: 'people' },
  { url: e('man-wearing-leather-jacket-thinking 1.png'), tags: ['person', 'man', 'fashion', 'leather', 'thinking', 'model'], category: 'people' },
  { url: e('man-with-leather-jacket-doing-tiny-sign 1.png'), tags: ['person', 'man', 'fashion', 'leather', 'gesture', 'model'], category: 'people' },
  { url: e('man-with-leather-jacket-showing-something 1.png'), tags: ['person', 'man', 'fashion', 'leather', 'showing', 'model'], category: 'people' },
  { url: e('studio-stupid-nervous-hispanic-man 1.png'), tags: ['person', 'man', 'hispanic', 'expression', 'model'], category: 'people' },
  { url: e('you-hispanic-smile-slim-man 1.png'), tags: ['person', 'man', 'hispanic', 'smile', 'model'], category: 'people' },
  { url: e('young-handsome-man-isolated-dark-background 1.png'), tags: ['person', 'man', 'handsome', 'dark-background', 'model'], category: 'people' },
  { url: e('pimp-man-doing-bad-signal 1.png'), tags: ['person', 'man', 'gesture', 'model'], category: 'people' },
  { url: e('pimp-man-doing-bad-signal (1) 1.png'), tags: ['person', 'man', 'gesture', 'model'], category: 'people' },

  // --- People / Fashion (Female) ---
  { url: e('beautiful-model-wear-flannel-shirt-isolated-white-background 1.png'), tags: ['person', 'woman', 'fashion', 'flannel', 'model'], category: 'people' },
  { url: e('portrait-young-stylish-girl-model-casual-summer-clothes-brown-hat-with-natural-makeup-glasses-isolated 1.png'), tags: ['person', 'woman', 'fashion', 'summer', 'hat', 'glasses', 'model'], category: 'people' },
  { url: e('portrait-young-stylish-girl-model-casual-summer-clothes-brown-hat-with-natural-makeup-glasses-isolated 2.png'), tags: ['person', 'woman', 'fashion', 'summer', 'hat', 'glasses', 'model'], category: 'people' },
  { url: e('portrait-young-stylish-girl-model-casual-summer-clothes-brown-hat-with-natural-makeup-glasses-isolated (1) 1.png'), tags: ['person', 'woman', 'fashion', 'summer', 'hat', 'glasses', 'model'], category: 'people' },
  { url: e('portrait-young-stylish-girl-model-casual-summer-clothes-brown-hat-with-natural-makeup-glasses-isolated (1) 2.png'), tags: ['person', 'woman', 'fashion', 'summer', 'hat', 'glasses', 'model'], category: 'people' },
  { url: e('portrait-young-stylish-girl-model-casual-summer-clothes-brown-hat-with-natural-makeup-isolated 1.png'), tags: ['person', 'woman', 'fashion', 'summer', 'hat', 'model'], category: 'people' },
  { url: e('portrait-young-stylish-model-casual-summer-clothes-brown-hat-with-natural-makeup-glasses-white 1.png'), tags: ['person', 'woman', 'fashion', 'summer', 'hat', 'glasses', 'model'], category: 'people' },
  { url: e('portrait-young-stylish-model-casual-summer-clothes-brown-hat-with-natural-makeup-glasses-white (1) 1.png'), tags: ['person', 'woman', 'fashion', 'summer', 'hat', 'glasses', 'model'], category: 'people' },
  { url: e('portrait-young-stylish-model-casual-summer-clothes-brown-hat-with-natural-makeup-glasses-white (2) 1.png'), tags: ['person', 'woman', 'fashion', 'summer', 'hat', 'glasses', 'model'], category: 'people' },

  // --- Animals ---
  { url: e('cat-isolated-white-background-no-drop-shadow 1.png'), tags: ['animal', 'cat', 'pet'], category: 'animals' },
  { url: e('cat-isolated-white-background-no-drop-shadow (1) 1.png'), tags: ['animal', 'cat', 'pet'], category: 'animals' },
  { url: e('cat-isolated-white-background-no-drop-shadow (2) 1.png'), tags: ['animal', 'cat', 'pet'], category: 'animals' },
  { url: e('cat-isolated-white-background-no-drop-shadow (3) 1.png'), tags: ['animal', 'cat', 'pet'], category: 'animals' },
  { url: e('cat-sat-still-no-other-image-white-background-fast-v-61-job-id-2f8942209c5b4aad852f3d892ae634 1.png'), tags: ['animal', 'cat', 'pet', 'sitting'], category: 'animals' },
  { url: e('cat-sat-still-no-other-image-white-background-fast-v-61-job-id-2f8942209c5b4aad852f3d892ae634 (1) 1.png'), tags: ['animal', 'cat', 'pet', 'sitting'], category: 'animals' },
  { url: e('isolated-shot-rhodesian-ridgeback-puppy-sitting-front-white-wall 1.png'), tags: ['animal', 'dog', 'puppy', 'pet'], category: 'animals' },
  { url: e('tricolor-australian-shepherd-panting-looking-camera-isolated-white 1.png'), tags: ['animal', 'dog', 'shepherd', 'pet'], category: 'animals' },
];

// Build the instruction text for Gemini
export const getImageCatalogInstruction = () => {
  const categories = {};
  IMAGE_CATALOG.forEach(img => {
    if (!categories[img.category]) categories[img.category] = [];
    categories[img.category].push(img);
  });

  let text = '\n\n██ HOSTED IMAGE CATALOG (USE THESE FOR PNG/TRANSPARENT IMAGES) ██\n';
  text += 'CRITICAL: When you need transparent PNG images (product shots, people cutouts, food items, animals, furniture, decor), you MUST use ONLY the URLs from this catalog. Pick the most contextually relevant image. NEVER use fake or made-up PNG URLs. NEVER use placehold.co. For regular background photography, continue using picsum.photos or Unsplash.\n\n';

  for (const [cat, images] of Object.entries(categories)) {
    text += `[${cat.toUpperCase()}]\n`;
    images.forEach(img => {
      text += `  Tags: ${img.tags.join(', ')} → ${img.url}\n`;
    });
    text += '\n';
  }

  text += 'USAGE RULES:\n';
  text += '- Match images by tags to the design context (e.g., food site → use food category, fashion store → use people/fashion)\n';
  text += '- Use different images across sections — do NOT repeat the same image\n';
  text += '- These are transparent PNGs — perfect for hero sections, product cards, feature sections\n';
  text += '- If no hosted image fits the context, use picsum.photos with a descriptive seed as fallback\n';
  text += '- URL encode spaces as %20 in the URLs when using them in HTML src attributes\n';

  return text;
};

export default IMAGE_CATALOG;
