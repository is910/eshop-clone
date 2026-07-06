// Mocking database tables
export const userCarts = {};  // Schema: { [userId]: [{ productId, quantity }] }
export const guestCarts = {}; // Schema: { [guestId]: { items: [{ productId, quantity }], updatedAt: Date } }

// Helper mapping mock tokens to user profiles
export const mockTokens = {
  "token_user_abc123": { userId: "user_99" },
  "token_user_xyz789": { userId: "user_100" }
};

// Add item function handling both structures
export function addItemToPersistedCart({ userId, guestId, productId }) {
  const prodId = parseInt(productId, 10);

  if (userId) {
    if (!userCarts[userId]) userCarts[userId] = [];
    const absoluteCart = userCarts[userId];
    const existingItem = absoluteCart.find(item => item.productId === prodId);
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      absoluteCart.push({ productId: prodId, quantity: 1 });
    }
    return userCarts[userId];
  } 
  
  if (guestId) {
    if (!guestCarts[guestId]) {
      guestCarts[guestId] = { items: [], updatedAt: new Date() };
    }
    const temporaryCart = guestCarts[guestId];
    temporaryCart.updatedAt = new Date(); // Update timestamp on mutation
    
    const existingItem = temporaryCart.items.find(item => item.productId === prodId);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      temporaryCart.items.push({ productId: prodId, quantity: 1 });
    }
    return temporaryCart.items;
  }
}