// Hosted image catalog for AI generation
// Base URL — update if domain changes
const BASE = 'https://expritor.com/assets/images';
const AVATAR_BASE = 'https://expritor.com/assets/avatar';
const ILLUS_BASE = 'https://expritor.com/assets/illustrations';

const IMAGE_CATALOG = [
  // --- Furniture ---
  { url: `${BASE}/modern-chair-with-no-background-1.png`, tags: ['furniture', 'chair', 'modern', 'product'], category: 'furniture' },
  { url: `${BASE}/beautiful-shot-modern-black-grey-chair-isolated-white.png`, tags: ['furniture', 'chair', 'black', 'grey', 'modern', 'product'], category: 'furniture' },
  { url: `${BASE}/elegant-wooden-rocking-chair-1.png`, tags: ['furniture', 'chair', 'wooden', 'rocking', 'classic', 'product'], category: 'furniture' },
  { url: `${BASE}/furniture-modern-studio-lifestyle-green.png`, tags: ['furniture', 'chair', 'green', 'modern', 'lifestyle', 'product'], category: 'furniture' },
  { url: `${BASE}/grey-comfortable-armchair-isolated-white-background.png`, tags: ['furniture', 'armchair', 'grey', 'comfortable', 'product'], category: 'furniture' },
  { url: `${BASE}/sofa-chair-isolate-white-surface-1.png`, tags: ['furniture', 'sofa', 'chair', 'product'], category: 'furniture' },
  { url: `${BASE}/vertical-shot-back-gray-chair-1.png`, tags: ['furniture', 'chair', 'gray', 'product'], category: 'furniture' },
  { url: `${BASE}/modern-lifestyle-furniture-chair-white-background-1.png`, tags: ['furniture', 'chair', 'modern', 'lifestyle', 'product'], category: 'furniture' },

  // --- Home Decor ---
  { url: `${BASE}/narrow-neck-vase-1.png`, tags: ['decor', 'vase', 'home', 'product'], category: 'decor' },
  { url: `${BASE}/vase-with-tulip-desk-1.png`, tags: ['decor', 'vase', 'tulip', 'flowers', 'home', 'product'], category: 'decor' },
  { url: `${BASE}/vase-with-tulips-roses-1.png`, tags: ['decor', 'vase', 'tulips', 'roses', 'flowers', 'home', 'product'], category: 'decor' },

  // --- Food ---
  { url: `${BASE}/beef-vegetables-sesame-seeds-white-plate-isolated-white-background.png`, tags: ['food', 'beef', 'vegetables', 'plate', 'restaurant', 'meal'], category: 'food' },
  { url: `${BASE}/delicious-loco-moco-burger-beef-isolated-white-background-1.png`, tags: ['food', 'burger', 'beef', 'restaurant', 'fast-food'], category: 'food' },
  { url: `${BASE}/pasta-salad-bowl-1.png`, tags: ['food', 'pasta', 'salad', 'bowl', 'restaurant', 'healthy'], category: 'food' },
  { url: `${BASE}/tasty-pork-belly-buns-isolated-white-background-1.png`, tags: ['food', 'pork', 'buns', 'restaurant', 'asian'], category: 'food' },

  // --- People / Fashion (Male) ---
  { url: `${BASE}/blond-man-brown-shirt.png`, tags: ['person', 'man', 'fashion', 'casual', 'model'], category: 'people' },
  { url: `${BASE}/male-natural-fresh-cool-casual.png`, tags: ['person', 'man', 'fashion', 'casual', 'cool', 'model'], category: 'people' },
  { url: `${BASE}/man-black-jacket-studio-shot-dark-background.png`, tags: ['person', 'man', 'fashion', 'jacket', 'dark', 'model'], category: 'people' },
  { url: `${BASE}/man-wearing-leather-jacket.png`, tags: ['person', 'man', 'fashion', 'leather', 'jacket', 'model'], category: 'people' },
  { url: `${BASE}/man-wearing-leather-jacket-thinking.png`, tags: ['person', 'man', 'fashion', 'leather', 'thinking', 'model'], category: 'people' },
  { url: `${BASE}/man-with-leather-jacket-doing-tiny-sign-1.png`, tags: ['person', 'man', 'fashion', 'leather', 'gesture', 'model'], category: 'people' },
  { url: `${BASE}/man-with-leather-jacket-showing-something-1.png`, tags: ['person', 'man', 'fashion', 'leather', 'showing', 'model'], category: 'people' },
  { url: `${BASE}/studio-stupid-nervous-hispanic-man-1.png`, tags: ['person', 'man', 'hispanic', 'expression', 'model'], category: 'people' },
  { url: `${BASE}/you-hispanic-smile-slim-man-1.png`, tags: ['person', 'man', 'hispanic', 'smile', 'model'], category: 'people' },
  { url: `${BASE}/young-handsome-man-isolated-dark-background-1.png`, tags: ['person', 'man', 'handsome', 'dark-background', 'model'], category: 'people' },
  { url: `${BASE}/pimp-man-doing-bad-signal-1.png`, tags: ['person', 'man', 'gesture', 'model'], category: 'people' },
  { url: `${BASE}/pimp-man-doing-bad-signal-1-1.png`, tags: ['person', 'man', 'gesture', 'model'], category: 'people' },

  // --- People / Fashion (Female) ---
  { url: `${BASE}/beautiful-model-wear-flannel-shirt-isolated-white-background.png`, tags: ['person', 'woman', 'fashion', 'flannel', 'model'], category: 'people' },
  { url: `${BASE}/portrait-young-stylish-girl-model-casual-summer-clothes-brown-hat-with-natural-makeup-glasses-isolated-1.png`, tags: ['person', 'woman', 'fashion', 'summer', 'hat', 'glasses', 'model'], category: 'people' },
  { url: `${BASE}/portrait-young-stylish-girl-model-casual-summer-clothes-brown-hat-with-natural-makeup-glasses-isolated-2.png`, tags: ['person', 'woman', 'fashion', 'summer', 'hat', 'glasses', 'model'], category: 'people' },
  { url: `${BASE}/portrait-young-stylish-girl-model-casual-summer-clothes-brown-hat-with-natural-makeup-glasses-isolated-1-1.png`, tags: ['person', 'woman', 'fashion', 'summer', 'hat', 'glasses', 'model'], category: 'people' },
  { url: `${BASE}/portrait-young-stylish-girl-model-casual-summer-clothes-brown-hat-with-natural-makeup-glasses-isolated-2-2.png`, tags: ['person', 'woman', 'fashion', 'summer', 'hat', 'glasses', 'model'], category: 'people' },
  { url: `${BASE}/portrait-young-stylish-girl-model-casual-summer-clothes-brown-hat-with-natural-makeup-isolated-1.png`, tags: ['person', 'woman', 'fashion', 'summer', 'hat', 'model'], category: 'people' },
  { url: `${BASE}/portrait-young-stylish-model-casual-summer-clothes-brown-hat-with-natural-makeup-glasses-white-1.png`, tags: ['person', 'woman', 'fashion', 'summer', 'hat', 'glasses', 'model'], category: 'people' },
  { url: `${BASE}/portrait-young-stylish-model-casual-summer-clothes-brown-hat-with-natural-makeup-glasses-white-(1)-1.png`, tags: ['person', 'woman', 'fashion', 'summer', 'hat', 'glasses', 'model'], category: 'people' },
  { url: `${BASE}/portrait-young-stylish-model-casual-summer-clothes-brown-hat-with-natural-makeup-glasses-white-(2)-1.png`, tags: ['person', 'woman', 'fashion', 'summer', 'hat', 'glasses', 'model'], category: 'people' },

  // --- Animals ---
  { url: `${BASE}/cat-isolated-white-background-no-drop-shadow.png`, tags: ['animal', 'cat', 'pet'], category: 'animals' },
  { url: `${BASE}/cat-isolated-white-background-no-drop-shadow-1.png`, tags: ['animal', 'cat', 'pet'], category: 'animals' },
  { url: `${BASE}/cat-isolated-white-background-no-drop-shadow-11.png`, tags: ['animal', 'cat', 'pet'], category: 'animals' },
  { url: `${BASE}/cat-isolated-white-background-no-drop-shadow-(3)-1.png`, tags: ['animal', 'cat', 'pet'], category: 'animals' },
  { url: `${BASE}/cat-sat-still-no-other-image-white-background-fast-v-61-job-id-2f8942209c5b4aad852f3d892ae634-1.png`, tags: ['animal', 'cat', 'pet', 'sitting'], category: 'animals' },
  { url: `${BASE}/cat-sat-still-no-other-image-white-background-fast-v-61-job-id-2f8942209c5b4aad852f3d892ae634-(1)-1.png`, tags: ['animal', 'cat', 'pet', 'sitting'], category: 'animals' },
  { url: `${BASE}/isolated-shot-rhodesian-ridgeback-puppy-sitting-front-white-wall.png`, tags: ['animal', 'dog', 'puppy', 'pet'], category: 'animals' },
  { url: `${BASE}/tricolor-australian-shepherd-panting-looking-camera-isolated-white-1.png`, tags: ['animal', 'dog', 'shepherd', 'pet'], category: 'animals' },

  // --- Avatars ---
  { url: `${AVATAR_BASE}/Andi-Lane.png`, tags: ['avatar', 'person', 'face', 'male', 'team', 'testimonial'], category: 'avatars' },
  { url: `${AVATAR_BASE}/Andi-Lane-png.png`, tags: ['avatar', 'person', 'face', 'male', 'team', 'testimonial', 'transparent'], category: 'avatars' },
  { url: `${AVATAR_BASE}/Ava-Wright.png`, tags: ['avatar', 'person', 'face', 'female', 'team', 'testimonial'], category: 'avatars' },
  { url: `${AVATAR_BASE}/Ava-Wright-png.png`, tags: ['avatar', 'person', 'face', 'female', 'team', 'testimonial', 'transparent'], category: 'avatars' },
  { url: `${AVATAR_BASE}/Candice-Wu.png`, tags: ['avatar', 'person', 'face', 'female', 'team', 'testimonial'], category: 'avatars' },
  { url: `${AVATAR_BASE}/Candice-Wu-png.png`, tags: ['avatar', 'person', 'face', 'female', 'team', 'testimonial', 'transparent'], category: 'avatars' },
  { url: `${AVATAR_BASE}/Demi-Wilkinson.png`, tags: ['avatar', 'person', 'face', 'female', 'team', 'testimonial'], category: 'avatars' },
  { url: `${AVATAR_BASE}/Demi-Wilkinson-png.png`, tags: ['avatar', 'person', 'face', 'female', 'team', 'testimonial', 'transparent'], category: 'avatars' },
  { url: `${AVATAR_BASE}/Drew-Cano.png`, tags: ['avatar', 'person', 'face', 'male', 'team', 'testimonial'], category: 'avatars' },
  { url: `${AVATAR_BASE}/Drew-Cano-png.png`, tags: ['avatar', 'person', 'face', 'male', 'team', 'testimonial', 'transparent'], category: 'avatars' },
  { url: `${AVATAR_BASE}/Eve-Leroy.png`, tags: ['avatar', 'person', 'face', 'female', 'team', 'testimonial'], category: 'avatars' },
  { url: `${AVATAR_BASE}/Eve-Leroy-png.png`, tags: ['avatar', 'person', 'face', 'female', 'team', 'testimonial', 'transparent'], category: 'avatars' },
  { url: `${AVATAR_BASE}/Image.png`, tags: ['avatar', 'person', 'face', 'team', 'testimonial'], category: 'avatars' },
  { url: `${AVATAR_BASE}/Kate-Morrison.png`, tags: ['avatar', 'person', 'face', 'female', 'team', 'testimonial'], category: 'avatars' },
  { url: `${AVATAR_BASE}/Kate-Morrison-png.png`, tags: ['avatar', 'person', 'face', 'female', 'team', 'testimonial', 'transparent'], category: 'avatars' },
  { url: `${AVATAR_BASE}/Koray-Okumus.png`, tags: ['avatar', 'person', 'face', 'male', 'team', 'testimonial'], category: 'avatars' },
  { url: `${AVATAR_BASE}/Koray-Okumus-png.png`, tags: ['avatar', 'person', 'face', 'male', 'team', 'testimonial', 'transparent'], category: 'avatars' },
  { url: `${AVATAR_BASE}/Lana-Steiner.png`, tags: ['avatar', 'person', 'face', 'female', 'team', 'testimonial'], category: 'avatars' },
  { url: `${AVATAR_BASE}/Lana-Steiner-png.png`, tags: ['avatar', 'person', 'face', 'female', 'team', 'testimonial', 'transparent'], category: 'avatars' },
  { url: `${AVATAR_BASE}/Natali-Craig.png`, tags: ['avatar', 'person', 'face', 'female', 'team', 'testimonial'], category: 'avatars' },
  { url: `${AVATAR_BASE}/Natali-Craig-png.png`, tags: ['avatar', 'person', 'face', 'female', 'team', 'testimonial', 'transparent'], category: 'avatars' },
  { url: `${AVATAR_BASE}/Olivia-Rhye-png.png`, tags: ['avatar', 'person', 'face', 'female', 'team', 'testimonial', 'transparent'], category: 'avatars' },
  { url: `${AVATAR_BASE}/Orlando-Diggs.png`, tags: ['avatar', 'person', 'face', 'male', 'team', 'testimonial'], category: 'avatars' },
  { url: `${AVATAR_BASE}/Orlando-Diggs-png.png`, tags: ['avatar', 'person', 'face', 'male', 'team', 'testimonial', 'transparent'], category: 'avatars' },
  { url: `${AVATAR_BASE}/Phoenix-Baker.png`, tags: ['avatar', 'person', 'face', 'male', 'team', 'testimonial'], category: 'avatars' },
  { url: `${AVATAR_BASE}/Phoenix-Baker-png.png`, tags: ['avatar', 'person', 'face', 'male', 'team', 'testimonial', 'transparent'], category: 'avatars' },
  { url: `${AVATAR_BASE}/Zahir-Mays.png`, tags: ['avatar', 'person', 'face', 'male', 'team', 'testimonial'], category: 'avatars' },
  { url: `${AVATAR_BASE}/Zahir-Mays-png.png`, tags: ['avatar', 'person', 'face', 'male', 'team', 'testimonial', 'transparent'], category: 'avatars' },

  // --- Illustrations (Yuppies style — flat design, modern, colorful) ---
  { url: `${ILLUS_BASE}/Yuppies-Abstract-1.png`, tags: ['illustration', 'abstract', 'shapes', 'decorative', 'hero', 'background'], category: 'illustrations' },
  { url: `${ILLUS_BASE}/Yuppies-Abstract-2.png`, tags: ['illustration', 'abstract', 'shapes', 'decorative', 'hero', 'background'], category: 'illustrations' },
  { url: `${ILLUS_BASE}/Yuppies-Bust.png`, tags: ['illustration', 'person', 'bust', 'portrait', 'about', 'team'], category: 'illustrations' },
  { url: `${ILLUS_BASE}/Yuppies-Bust-1.png`, tags: ['illustration', 'person', 'bust', 'portrait', 'about', 'team'], category: 'illustrations' },
  { url: `${ILLUS_BASE}/Yuppies-Chat.png`, tags: ['illustration', 'chat', 'messaging', 'communication', 'contact', 'support', 'saas'], category: 'illustrations' },
  { url: `${ILLUS_BASE}/Yuppies-Computer.png`, tags: ['illustration', 'computer', 'laptop', 'tech', 'work', 'developer', 'saas', 'dashboard'], category: 'illustrations' },
  { url: `${ILLUS_BASE}/Yuppies-Desk.png`, tags: ['illustration', 'desk', 'workspace', 'office', 'work', 'productivity'], category: 'illustrations' },
  { url: `${ILLUS_BASE}/Yuppies-Emails.png`, tags: ['illustration', 'email', 'inbox', 'newsletter', 'marketing', 'communication'], category: 'illustrations' },
  { url: `${ILLUS_BASE}/Yuppies-Lamp.png`, tags: ['illustration', 'lamp', 'light', 'decor', 'home', 'interior'], category: 'illustrations' },
  { url: `${ILLUS_BASE}/Yuppies-Lantern.png`, tags: ['illustration', 'lantern', 'light', 'decor', 'home', 'cozy'], category: 'illustrations' },
  { url: `${ILLUS_BASE}/Yuppies-Living-Area.png`, tags: ['illustration', 'living', 'room', 'interior', 'home', 'furniture', 'lifestyle'], category: 'illustrations' },
  { url: `${ILLUS_BASE}/Yuppies-Lounge-Chair.png`, tags: ['illustration', 'chair', 'lounge', 'furniture', 'interior', 'relax'], category: 'illustrations' },
  { url: `${ILLUS_BASE}/Yuppies-Managing.png`, tags: ['illustration', 'managing', 'project', 'business', 'planning', 'management', 'saas'], category: 'illustrations' },
  { url: `${ILLUS_BASE}/Yuppies-Managing-1.png`, tags: ['illustration', 'managing', 'project', 'business', 'planning', 'management', 'saas'], category: 'illustrations' },
  { url: `${ILLUS_BASE}/Yuppies-Remote-Team.png`, tags: ['illustration', 'remote', 'team', 'collaboration', 'work', 'group', 'saas', 'about'], category: 'illustrations' },
  { url: `${ILLUS_BASE}/Yuppies-Sitting.png`, tags: ['illustration', 'person', 'sitting', 'casual', 'relaxed', 'lifestyle'], category: 'illustrations' },
  { url: `${ILLUS_BASE}/Yuppies-Sitting-1.png`, tags: ['illustration', 'person', 'sitting', 'casual', 'relaxed', 'lifestyle'], category: 'illustrations' },
  { url: `${ILLUS_BASE}/Yuppies-Sitting-On-Chair.png`, tags: ['illustration', 'person', 'sitting', 'chair', 'casual', 'about'], category: 'illustrations' },
  { url: `${ILLUS_BASE}/Yuppies-Standing.png`, tags: ['illustration', 'person', 'standing', 'professional', 'hero', 'about'], category: 'illustrations' },
  { url: `${ILLUS_BASE}/Yuppies-Standing-1.png`, tags: ['illustration', 'person', 'standing', 'professional', 'hero', 'about'], category: 'illustrations' },
  { url: `${ILLUS_BASE}/Yuppies-Standing-2.png`, tags: ['illustration', 'person', 'standing', 'professional', 'hero', 'about'], category: 'illustrations' },
  { url: `${ILLUS_BASE}/Yuppies-Standing-3.png`, tags: ['illustration', 'person', 'standing', 'professional', 'hero', 'about'], category: 'illustrations' },
  { url: `${ILLUS_BASE}/Yuppies-Standing-4.png`, tags: ['illustration', 'person', 'standing', 'professional', 'hero', 'about'], category: 'illustrations' },
  { url: `${ILLUS_BASE}/Yuppies-Super-Idea.png`, tags: ['illustration', 'idea', 'lightbulb', 'creative', 'innovation', 'startup', 'hero', 'feature'], category: 'illustrations' },
  { url: `${ILLUS_BASE}/Yuppies-Wooden-Chair.png`, tags: ['illustration', 'chair', 'wooden', 'furniture', 'interior', 'decor'], category: 'illustrations' },
  { url: `${ILLUS_BASE}/Yuppies-Work-Station.png`, tags: ['illustration', 'workstation', 'desk', 'computer', 'office', 'work', 'productivity', 'saas'], category: 'illustrations' },
];

// Search hosted images by query (matches against tags and category)
export const searchHostedImages = (query) => {
  if (!query.trim()) return IMAGE_CATALOG;
  const q = query.toLowerCase().trim();
  const terms = q.split(/\s+/);
  return IMAGE_CATALOG.filter(img =>
    terms.every(term =>
      img.tags.some(tag => tag.includes(term)) || img.category.includes(term)
    )
  );
};

// Get all unique categories
export const getCategories = () => [...new Set(IMAGE_CATALOG.map(img => img.category))];

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
  text += '- AVATARS: For testimonials, team sections, user profiles — use ONLY avatar URLs from this catalog. Use non-transparent versions (without -png) for circular crops, transparent versions (with -png) for cutouts. NEVER use pravatar.cc.\n';
  text += '- ILLUSTRATIONS: ONLY use these Yuppies-style illustrations if the user EXPLICITLY asks for illustrations. NEVER add illustrations by default. If the user does not request illustrations, use photos (picsum.photos) + icons (Lucide) instead.\n';
  text += '- If no hosted image fits the context, use picsum.photos with a descriptive seed as fallback\n';

  return text;
};

// --- UI Template Image Collections (industry-themed, for text-prompt generations) ---
const COLLECTION_BASE = 'https://expritor.com/collections';

export const IMAGE_COLLECTIONS = {
  saas: {
    label: 'SaaS / Tech Startup',
    keywords: ['saas', 'software', 'platform', 'app', 'startup', 'tool', 'analytics', 'crm', 'erp', 'api', 'cloud', 'automation', 'workflow', 'productivity', 'project management', 'ai ', 'machine learning', 'devtool', 'b2b'],
    images: {
      'hero-1': `${COLLECTION_BASE}/saas/hero/hero-1.webp`,
      'hero-2': `${COLLECTION_BASE}/saas/hero/hero-2.webp`,
      'hero-3': `${COLLECTION_BASE}/saas/hero/hero-3.webp`,
      'hero-4': `${COLLECTION_BASE}/saas/hero/hero-4.webp`,
      'hero-5': `${COLLECTION_BASE}/saas/hero/hero-5.webp`,
      'hero-6': `${COLLECTION_BASE}/saas/hero/hero-6.webp`,
      'hero-7': `${COLLECTION_BASE}/saas/hero/hero-7.webp`,
      'hero-8': `${COLLECTION_BASE}/saas/hero/hero-8.webp`,
    }
  },
  ecommerce: {
    label: 'E-commerce / Retail',
    keywords: ['ecommerce', 'e-commerce', 'shop', 'store', 'retail', 'product', 'marketplace', 'cart', 'fashion', 'clothing', 'accessories', 'electronics', 'grocery', 'boutique'],
    images: {
      'hero-1': `${COLLECTION_BASE}/ecommerce/hero-1.webp`,
      'product-1': `${COLLECTION_BASE}/ecommerce/product-1.webp`,
      'product-2': `${COLLECTION_BASE}/ecommerce/product-2.webp`,
      'product-3': `${COLLECTION_BASE}/ecommerce/product-3.webp`,
      'category-1': `${COLLECTION_BASE}/ecommerce/category-1.webp`,
      'banner': `${COLLECTION_BASE}/ecommerce/banner.webp`,
      'lifestyle': `${COLLECTION_BASE}/ecommerce/lifestyle.webp`,
    }
  },
  restaurant: {
    label: 'Restaurant / Food',
    keywords: ['restaurant', 'food', 'cafe', 'coffee', 'bakery', 'pizzeria', 'sushi', 'bar', 'bistro', 'catering', 'menu', 'dining', 'recipe', 'kitchen', 'chef'],
    images: {
      'hero-1': `${COLLECTION_BASE}/restaurant/hero-1.webp`,
      'dish-1': `${COLLECTION_BASE}/restaurant/dish-1.webp`,
      'dish-2': `${COLLECTION_BASE}/restaurant/dish-2.webp`,
      'interior': `${COLLECTION_BASE}/restaurant/interior.webp`,
      'chef': `${COLLECTION_BASE}/restaurant/chef.webp`,
      'ambience': `${COLLECTION_BASE}/restaurant/ambience.webp`,
    }
  },
  portfolio: {
    label: 'Portfolio / Creative',
    keywords: ['portfolio', 'creative', 'freelance', 'designer', 'photographer', 'artist', 'agency', 'studio', 'personal', 'showcase', 'gallery'],
    images: {
      'hero-1': `${COLLECTION_BASE}/portfolio/hero-1.webp`,
      'project-1': `${COLLECTION_BASE}/portfolio/project-1.webp`,
      'project-2': `${COLLECTION_BASE}/portfolio/project-2.webp`,
      'project-3': `${COLLECTION_BASE}/portfolio/project-3.webp`,
      'workspace': `${COLLECTION_BASE}/portfolio/workspace.webp`,
      'profile': `${COLLECTION_BASE}/portfolio/profile.webp`,
    }
  },
  corporate: {
    label: 'Corporate / Business',
    keywords: ['corporate', 'business', 'consulting', 'finance', 'accounting', 'law', 'legal', 'insurance', 'bank', 'enterprise', 'b2b', 'professional services', 'agency'],
    images: {
      'hero-1': `${COLLECTION_BASE}/corporate/hero-1.webp`,
      'team-1': `${COLLECTION_BASE}/corporate/team-1.webp`,
      'office': `${COLLECTION_BASE}/corporate/office.webp`,
      'meeting': `${COLLECTION_BASE}/corporate/meeting.webp`,
      'service-1': `${COLLECTION_BASE}/corporate/service-1.webp`,
      'cta': `${COLLECTION_BASE}/corporate/cta.webp`,
    }
  },
  medical: {
    label: 'Medical / Health',
    keywords: ['medical', 'health', 'hospital', 'clinic', 'doctor', 'dental', 'pharmacy', 'wellness', 'fitness', 'yoga', 'therapy', 'mental health', 'healthcare'],
    images: {
      'hero-1': `${COLLECTION_BASE}/medical/hero-1.webp`,
      'doctor': `${COLLECTION_BASE}/medical/doctor.webp`,
      'facility': `${COLLECTION_BASE}/medical/facility.webp`,
      'service-1': `${COLLECTION_BASE}/medical/service-1.webp`,
      'service-2': `${COLLECTION_BASE}/medical/service-2.webp`,
      'cta': `${COLLECTION_BASE}/medical/cta.webp`,
    }
  },
  education: {
    label: 'Education / Learning',
    keywords: ['education', 'school', 'university', 'college', 'course', 'learning', 'lms', 'tutorial', 'training', 'academy', 'e-learning', 'online course', 'student'],
    images: {
      'hero-1': `${COLLECTION_BASE}/education/hero-1.webp`,
      'classroom': `${COLLECTION_BASE}/education/classroom.webp`,
      'student': `${COLLECTION_BASE}/education/student.webp`,
      'course-1': `${COLLECTION_BASE}/education/course-1.webp`,
      'course-2': `${COLLECTION_BASE}/education/course-2.webp`,
      'campus': `${COLLECTION_BASE}/education/campus.webp`,
    }
  },
  realestate: {
    label: 'Real Estate / Property',
    keywords: ['real estate', 'property', 'housing', 'apartment', 'rental', 'hotel', 'resort', 'villa', 'interior design', 'architecture', 'home', 'listing'],
    images: {
      'hero-1': `${COLLECTION_BASE}/realestate/hero-1.webp`,
      'property-1': `${COLLECTION_BASE}/realestate/property-1.webp`,
      'property-2': `${COLLECTION_BASE}/realestate/property-2.webp`,
      'interior': `${COLLECTION_BASE}/realestate/interior.webp`,
      'exterior': `${COLLECTION_BASE}/realestate/exterior.webp`,
      'agent': `${COLLECTION_BASE}/realestate/agent.webp`,
    }
  },
  travel: {
    label: 'Travel / Tourism',
    keywords: ['travel', 'tourism', 'hotel', 'booking', 'flight', 'vacation', 'adventure', 'trip', 'tour', 'destination', 'airbnb', 'hostel'],
    images: {
      'hero-1': `${COLLECTION_BASE}/travel/hero-1.webp`,
      'destination-1': `${COLLECTION_BASE}/travel/destination-1.webp`,
      'destination-2': `${COLLECTION_BASE}/travel/destination-2.webp`,
      'experience': `${COLLECTION_BASE}/travel/experience.webp`,
      'hotel': `${COLLECTION_BASE}/travel/hotel.webp`,
      'cta': `${COLLECTION_BASE}/travel/cta.webp`,
    }
  },
  fitness: {
    label: 'Fitness / Sports',
    keywords: ['fitness', 'gym', 'sport', 'workout', 'training', 'crossfit', 'boxing', 'running', 'athletic', 'bodybuilding', 'personal trainer'],
    images: {
      'hero-1': `${COLLECTION_BASE}/fitness/hero-1.webp`,
      'workout-1': `${COLLECTION_BASE}/fitness/workout-1.webp`,
      'workout-2': `${COLLECTION_BASE}/fitness/workout-2.webp`,
      'trainer': `${COLLECTION_BASE}/fitness/trainer.webp`,
      'facility': `${COLLECTION_BASE}/fitness/facility.webp`,
      'cta': `${COLLECTION_BASE}/fitness/cta.webp`,
    }
  },
};

// Match user prompt to the best image collection
export const matchCollection = (prompt) => {
  const lower = prompt.toLowerCase();
  let bestMatch = null;
  let bestScore = 0;

  for (const [key, col] of Object.entries(IMAGE_COLLECTIONS)) {
    const score = col.keywords.filter(kw => lower.includes(kw)).length;
    if (score > bestScore) {
      bestScore = score;
      bestMatch = key;
    }
  }

  return bestMatch;
};

// Fetch collection images as base64 attachments for Gemini vision input
// Returns array of { name, type, isText: false, data } — same shape as user attachments
// Randomly picks from available images so each generation gets different inspiration
export const fetchCollectionImages = async (collectionKey) => {
  if (!collectionKey) return [];
  const col = IMAGE_COLLECTIONS[collectionKey];
  if (!col) return [];

  // Shuffle all available images and pick up to 3
  const entries = Object.entries(col.images);
  const shuffled = entries.sort(() => Math.random() - 0.5).slice(0, 3);

  const attachments = [];
  for (const [slot, url] of shuffled) {
    try {
      const res = await fetch(url);
      if (!res.ok) continue;
      const blob = await res.blob();
      const dataUrl = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      });
      attachments.push({
        name: `collection-${collectionKey}-${slot}.webp`,
        type: blob.type || 'image/webp',
        isText: false,
        data: dataUrl,
      });
    } catch { /* skip failed fetches — image not hosted yet */ }
  }

  return attachments;
};

export default IMAGE_CATALOG;
