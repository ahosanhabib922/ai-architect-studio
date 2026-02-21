export const DEFAULT_MESSAGES = [{ role: 'model', type: 'text', content: 'Welcome to AI Architect Studio! What would you like to build today? You can say something like "Create a dashboard with a sidebar". If you request multiple pages, I will generate them as separate files.' }];

export const generateChatId = () => {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  for (let i = 0; i < 8; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return id;
};
