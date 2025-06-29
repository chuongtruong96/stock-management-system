# Product Availability Logic Fix

## Problem Statement
Product cards were showing "Out of Stock" even when the order window was open, because the system was checking `stock === 0` instead of using the order window status. This doesn't make sense for a **stationery ordering system** where there's no actual inventory tracking.

## Root Cause Analysis

### Original Flawed Logic:
```javascript
// ❌ WRONG: Checking stock levels
disabled={productData.stock === 0}

{productData.stock === 0 
  ? t('product.outOfStock', 'Out of Stock')
  : t('product.addToCart', 'Add to Cart')
}
```

### Business Context Issue:
- **Stationery Ordering System**: No inventory tracking
- **Stock concept doesn't apply**: Items are always "available" to order
- **Order window controls availability**: Not stock levels

## Solution Architecture

### New Business Logic:
```javascript
// ✅ CORRECT: Checking order window status
disabled={!canOrder}

{!canOrder 
  ? t('product.orderWindowClosed', 'Order Window Closed')
  : t('product.addToCart', 'Add to Cart')
}
```

### Key Changes Made:

#### 1. **Updated ProductCard Component** (`ProductCard.jsx`):
- **Added Order Window Context**: `useOrderWindow()` hook
- **Replaced Stock Logic**: `stock === 0` → `!canOrder`
- **Updated Button States**: Different colors and icons based on order window
- **Enhanced User Experience**: Clear messaging about why ordering is disabled

#### 2. **Enhanced Button Styling**:
```javascript
// Green gradient when ordering is allowed
background: canOrder 
  ? "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)"
  : "linear-gradient(45deg, #f44336 30%, #ff5722 90%)"

// Different icons based on state
startIcon={canOrder ? <ShoppingCartIcon /> : <DoNotDisturbIcon />}
```

#### 3. **Added Translation Keys**:
- **English**: `"orderWindowClosed": "Order Window Closed"`
- **Vietnamese**: `"orderWindowClosed": "Cửa sổ đặt hàng đã đóng"`

## Business Logic Flow

### When Order Window is **OPEN**:
- ✅ **Button**: Blue gradient with cart icon
- ✅ **Text**: "Add to Cart"
- ✅ **State**: Enabled and clickable
- ✅ **User Action**: Can add items to cart

### When Order Window is **CLOSED**:
- ❌ **Button**: Red gradient with prohibition icon
- ❌ **Text**: "Order Window Closed"
- ❌ **State**: Disabled but visually informative
- ❌ **User Action**: Cannot add items, understands why

## Key Learning Points

### 1. **Domain-Specific Logic**
- **Inventory Systems**: Use stock levels
- **Ordering Systems**: Use business rules (time windows, admin controls)
- **Context Matters**: Same UI patterns, different business logic

### 2. **User Experience Design**
- **Clear Messaging**: Users understand WHY they can't order
- **Visual Feedback**: Different colors/icons for different states
- **Consistent Behavior**: All products follow same availability rules

### 3. **System Architecture**
- **Centralized Logic**: Order window status managed in one place
- **Reactive Updates**: UI automatically updates when window status changes
- **Separation of Concerns**: Business logic separate from presentation

## Testing Scenarios

### Scenario 1: Order Window Open (Natural Period)
- **Expected**: Blue "Add to Cart" buttons on all products
- **User Can**: Add any product to cart regardless of "stock"

### Scenario 2: Order Window Open (Admin Override)
- **Expected**: Blue "Add to Cart" buttons on all products
- **User Can**: Add any product to cart (urgent orders allowed)

### Scenario 3: Order Window Closed
- **Expected**: Red "Order Window Closed" buttons on all products
- **User Cannot**: Add any products to cart
- **User Understands**: Why ordering is disabled

## Files Modified

### Frontend Components:
- `ProductCard.jsx`: Updated availability logic
- `en/translation.json`: Added new translation key
- `vi/translation.json`: Added Vietnamese translation

### Dependencies Added:
- `useOrderWindow` hook: Access to order window status
- `DoNotDisturbIcon`: Visual indicator for disabled state

## Benefits Achieved

1. **Correct Business Logic**: Products available when order window is open
2. **Clear User Communication**: Users understand system state
3. **Consistent Behavior**: All products follow same availability rules
4. **Better UX**: Visual feedback matches system state
5. **Maintainable Code**: Business logic centralized in order window context

This fix demonstrates how to **align UI logic with business requirements** and ensure that **user interface accurately reflects system state** in domain-specific applications.