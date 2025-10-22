# SwipeMatch Privacy Model

## Overview
SwipeMatch implements a connection-based privacy model where user-contributed content is only visible to connected users.

## Content Visibility Rules

### Seed Data (Platform Content)
- **Visible to:** Everyone
- **Characteristics:** Items without a `createdBy` field
- **Examples:** Pre-seeded restaurants, movies, TV shows, and hiking trails
- **Purpose:** Provides base content for all users to start matching

### User Contributions
User-contributed items follow strict privacy rules based on connections:

#### Your Own Contributions
- **Visible to:** You + All your connections
- **Why:** You should always see your own content and be able to manage it

#### Connected Users' Contributions  
- **Visible to:** Only users connected to the contributor
- **Why:** Creates a trusted network of recommendations
- **Benefit:** Friends see what friends recommend

#### Non-Connected Users' Contributions
- **Visible to:** Hidden/Not shown
- **Why:** Privacy by default - prevents spam and maintains quality
- **Exception:** None - you must be connected to see contributions

## Implementation Details

### Swipe Feed (`getUnswipedCategoryItems`)
```typescript
// Filters applied:
1. Remove already swiped items
2. Show all seed data (no createdBy field)
3. Show user's own contributions (createdBy === currentUserId)
4. Show contributions from connected users (createdBy in connectedUserIds)
5. Hide all other user contributions
```

### Matches Page
- Only shows matches with connected users
- Filters out matches with non-connected users
- Prompts users to make connections if none exist

### My Swipes Page
- Shows all items you've swiped on (yours and seed data visible)
- Connected users' contributions remain visible
- Non-connected contributions may appear in history but won't be re-shown

## Connection Workflow

### Making Connections
1. Go to **Connections** page
2. Send connection request to another user (by username)
3. Other user accepts request
4. Both users are now connected
5. Both users can now see each other's contributions

### Connection Benefits
- Access to friends' curated recommendations
- Shared matching on items both friends like
- Trust-based content discovery
- Quality control through social graph

## Data Structure

### SwipeItem with Privacy Metadata
```typescript
{
  id: string,
  category: CategoryType,
  name: string,
  image: string,
  description: string,
  categoryData: {...},
  createdBy?: string,  // 👈 Privacy marker
  createdAt?: Timestamp,
  updatedAt?: Timestamp
}
```

### Privacy Check Logic
```typescript
// Seed data (always visible)
if (!item.createdBy) return true;

// Your contributions (always visible)
if (item.createdBy === currentUserId) return true;

// Connected users' contributions
if (connectedUserIds.includes(item.createdBy)) return true;

// Everything else (hidden)
return false;
```

## Security Considerations

### Firestore Security Rules
The privacy model should be enforced at multiple levels:

1. **Client-side filtering** (current implementation)
   - Fast and responsive
   - Reduces data transfer
   - User experience optimization

2. **Firestore security rules** (recommended addition)
   ```javascript
   // Example rule for contributions
   match /restaurants/{itemId} {
     allow read: if isAuthenticated() && 
       (!exists(resource.data.createdBy) || 
        resource.data.createdBy == request.auth.uid ||
        isConnected(request.auth.uid, resource.data.createdBy));
   }
   ```

3. **Server-side validation** (future enhancement)
   - Cloud Functions to verify connections
   - Prevent tampering with client code
   - Audit trail for privacy compliance

## User Benefits

### For Contributors
- ✅ Control over who sees your recommendations
- ✅ Share with trusted network only
- ✅ Privacy-first approach
- ✅ No spam or unwanted visibility

### For Consumers
- ✅ Curated content from friends
- ✅ Trust-based recommendations
- ✅ No random user content
- ✅ Quality over quantity

### For Platform
- ✅ Encourages connections and engagement
- ✅ Reduces spam and low-quality contributions
- ✅ Creates closed-loop recommendation network
- ✅ Maintains content quality standards

## Future Enhancements

### Possible Features
1. **Connection circles** - Organize connections into groups
2. **Public vs Private contributions** - Let users choose visibility
3. **Contribution limits** - Rate limits per category per time period
4. **Reputation system** - Upvote/downvote from connected users
5. **Connection suggestions** - Based on shared interests
6. **Privacy settings** - Per-item or per-category visibility controls

## Testing Privacy

### Verification Steps
1. Create two test accounts (User A and User B)
2. User A creates a contribution (e.g., a restaurant)
3. User B should NOT see it in their feed
4. User B sends connection request to User A
5. User A accepts
6. User B should NOW see User A's contribution
7. Test with multiple users and multiple contributions

### Edge Cases
- ❓ What if a user is blocked/removed after matching?
- ❓ Should deleted connections remove contribution visibility?
- ❓ Should matches persist after disconnection?
- ❓ Can users see items they've already swiped from now-disconnected users?

## Summary

SwipeMatch's privacy model creates a **connection-first, trust-based recommendation network** where:
- Platform content is accessible to everyone
- User contributions are private to connected networks
- Matches only occur between connected users
- Quality is maintained through social filtering

This model encourages meaningful connections and ensures that recommendations come from trusted sources.
