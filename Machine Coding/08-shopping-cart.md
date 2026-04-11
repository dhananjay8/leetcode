# Build a Shopping Cart with Checkout Flow

## Requirements
- Browse products, add/remove from cart, update quantities
- Cart summary with totals, apply discount codes
- Checkout flow: shipping → payment → confirmation
- Persist cart across sessions (localStorage)

## Data Model
```javascript
const cartItem = { productId: 'p1', name: 'Shirt', price: 29.99, quantity: 2, image: '...' };
const cart = { items: [], discount: null, shipping: 0 };
```

## Core: Cart with useReducer
```javascript
function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.items.find(i => i.productId === action.payload.productId);
      if (existing) return { ...state, items: state.items.map(i =>
        i.productId === action.payload.productId ? { ...i, quantity: i.quantity + 1 } : i) };
      return { ...state, items: [...state.items, { ...action.payload, quantity: 1 }] };
    }
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter(i => i.productId !== action.payload) };
    case 'UPDATE_QTY':
      return { ...state, items: state.items.map(i =>
        i.productId === action.payload.id ? { ...i, quantity: action.payload.qty } : i) };
    case 'APPLY_DISCOUNT':
      return { ...state, discount: action.payload };
    case 'CLEAR': return { items: [], discount: null, shipping: 0 };
    default: return state;
  }
}

// Computed values
const subtotal = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
const discountAmount = cart.discount ? subtotal * cart.discount.percent / 100 : 0;
const total = subtotal - discountAmount + cart.shipping;
```

## Key Patterns
- **useReducer** for complex state transitions
- **Context** for global cart access
- **Derived state**: subtotal, discount, total as computed values (not stored)
- **localStorage sync**: persist cart on every update
- **Multi-step checkout**: stepper component with validation per step

## Interview Tips
- Use useReducer not useState for cart logic
- Discuss optimistic UI for add to cart
- Validate stock availability before checkout
- Mention idempotency for payment submission
