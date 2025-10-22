# Reset Matches Feature 🔄

## Overview

The **Reset Matches** feature allows two connected friends to clear all their mutual matches and swipes for a specific category, enabling them to swipe fresh together. This is perfect for situations like:

- 🎬 **Movie Night**: "Let's reset our movie matches and pick something new to watch tonight!"
- 🥾 **Weekend Plans**: "Want to reset hikes and find a new trail to explore?"
- 🍽️ **Dinner Date**: "Let's reset restaurants and discover a new place together!"
- 📺 **Binge Watch**: "Reset TV shows so we can find a new series to watch!"

## User Flow

### 1. Sending a Reset Request

```
User A → Connections Page → Click "Reset" on Friend's Card → 
Choose Category (Hikes/Movies/TV/Restaurants) → Confirm
```

**What happens:**
- Request is sent to User B
- Request appears in User A's "Pending Reset Requests" section
- Request appears in User B's "Reset Requests" section
- User A sees a success toast notification

### 2. Receiving and Accepting a Request

```
User B → Connections Page → Sees Reset Request → Click "Reset" → Confirm
```

**What happens:**
- All mutual matches for that category are deleted
- All swipes for mutually-liked items are cleared
- Both users can now swipe on those items again
- Both users see a success notification
- Request is removed from pending lists

### 3. Declining a Request

```
User B → Connections Page → Sees Reset Request → Click "Decline"
```

**What happens:**
- Request is marked as rejected
- No matches or swipes are affected
- Request is removed from lists

## Technical Architecture

### Database Structure

#### `resetRequests` Collection

```typescript
{
  id: string                    // Auto-generated document ID
  fromUserId: string            // User who sent the request
  fromUsername: string
  fromDisplayName: string
  toUserId: string              // User receiving the request
  toUsername: string
  toDisplayName: string
  category: CategoryType        // 'hikes' | 'movies' | 'tv' | 'restaurants'
  status: 'pending' | 'accepted' | 'rejected'
  createdAt: Timestamp
  acceptedAt?: Timestamp        // Added when accepted
  rejectedAt?: Timestamp        // Added when rejected
}
```

### Key Functions

#### `sendResetRequest(toUserId, category)`
- **Validates**: Users must be connected
- **Checks**: No existing pending request for this category between these users
- **Creates**: New reset request document in Firestore
- **Returns**: Success or throws error

#### `acceptResetRequest(requestId)`
- **Validates**: Current user is the recipient
- **Updates**: Request status to 'accepted'
- **Deletes**: All mutual matches for the category
- **Clears**: All swipes for mutually-liked items
- **Allows**: Both users to swipe fresh on those items

#### `rejectResetRequest(requestId)`
- **Validates**: Current user is the recipient
- **Updates**: Request status to 'rejected'
- **Preserves**: All existing matches and swipes

### Reset Logic Details

When a reset request is **accepted**:

1. **Find Mutual Matches**
   - Query `matches` collection
   - Filter by: both userIds present AND matching category
   - Delete all matching documents

2. **Find Mutual Swipes**
   - Query both users' swipe collections
   - Filter by: category AND liked=true
   - Find intersection (items both users liked)
   - Delete swipes for these items from both users

3. **Result**
   - Users can swipe again on previously matched items
   - Fresh start for that category
   - Other categories remain unaffected

## UI Components

### `ResetMatchesModal` Component

**Purpose**: Category selection interface when initiating a reset

**Features:**
- Visual category cards with emojis
- Clear explanation of what will happen
- Two-step confirmation (category selection → confirmation)
- Prevents accidental resets

**UX Considerations:**
- Large touch targets for mobile
- Clear visual hierarchy
- Informative descriptions
- Loading states during request

### Connections Page Updates

**New Elements:**
1. **Reset Button**: On each connected friend card
2. **Received Reset Requests Section**: Shows incoming requests
3. **Sent Reset Requests Section**: Shows pending outgoing requests
4. **Confirmation Modals**: For accepting/rejecting requests

**Visual Design:**
- 🔄 Orange theme for reset actions (distinct from green connections)
- Category emojis for quick recognition
- Pending states with ⏳ indicator
- Clear action buttons (Accept/Decline)

## User Experience Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    User A (Initiator)                        │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ 1. Click "Reset" button
                            ▼
                    ┌───────────────┐
                    │ Choose        │
                    │ Category      │
                    │ Modal         │
                    └───────┬───────┘
                            │
                            │ 2. Select category (e.g., Movies)
                            ▼
                    ┌───────────────┐
                    │ Confirmation  │
                    │ Modal         │
                    └───────┬───────┘
                            │
                            │ 3. Confirm
                            ▼
                    ┌───────────────┐
                    │ Request Sent  │
                    │ Toast         │
                    └───────┬───────┘
                            │
                            │ 4. Firestore creates resetRequest
                            │
┌───────────────────────────┴─────────────────────────────────┐
│                    User B (Recipient)                        │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ 5. Sees request in UI
                            ▼
                    ┌───────────────┐
                    │ Reset Request │
                    │ "Reset Movies │
                    │  with User A" │
                    └───────┬───────┘
                            │
                ┌───────────┴───────────┐
                │                       │
                ▼                       ▼
        ┌─────────────┐        ┌─────────────┐
        │ Click       │        │ Click       │
        │ "Reset"     │        │ "Decline"   │
        └──────┬──────┘        └──────┬──────┘
               │                      │
               │ 6a. Accept           │ 6b. Reject
               ▼                      ▼
        ┌─────────────┐        ┌─────────────┐
        │ Confirmation│        │ Request     │
        │ Modal       │        │ Rejected    │
        └──────┬──────┘        └──────┬──────┘
               │                      │
               │ 7a. Confirm          │
               ▼                      │
        ┌─────────────┐               │
        │ Delete:     │               │
        │ • Matches   │               │
        │ • Swipes    │               │
        └──────┬──────┘               │
               │                      │
               ▼                      │
        ┌─────────────┐               │
        │ Success     │               │
        │ Toast       │               │
        └──────┬──────┘               │
               │                      │
               └──────────┬───────────┘
                          │
                          ▼
                  Both users see
                  updated state
```

## Security Considerations

### Access Control

1. **Connection Requirement**
   - Can only send reset requests to connected friends
   - Prevents spam from non-friends

2. **Ownership Validation**
   - Users can only accept/reject requests sent to them
   - Users can only cancel their own sent requests

3. **Duplicate Prevention**
   - System checks for existing pending requests
   - Prevents multiple pending requests for same category

### Data Privacy

- Reset only affects data between the two users
- Other users' matches with these users are unaffected
- Category isolation: resetting movies doesn't affect hikes

### Firestore Security Rules (Recommended)

```javascript
// resetRequests collection
match /resetRequests/{requestId} {
  // Users can read their own requests (sent or received)
  allow read: if request.auth != null && (
    resource.data.fromUserId == request.auth.uid ||
    resource.data.toUserId == request.auth.uid
  );
  
  // Users can create requests to connected friends
  allow create: if request.auth != null &&
    request.resource.data.fromUserId == request.auth.uid &&
    exists(/databases/$(database)/documents/connections/$(request.auth.uid + '_' + request.resource.data.toUserId));
  
  // Only recipient can update (accept/reject)
  allow update: if request.auth != null &&
    resource.data.toUserId == request.auth.uid &&
    resource.data.status == 'pending';
    
  // Sender can delete (cancel) their own pending requests
  allow delete: if request.auth != null &&
    resource.data.fromUserId == request.auth.uid &&
    resource.data.status == 'pending';
}
```

## Edge Cases Handled

### 1. No Mutual Matches
- Reset still succeeds (nothing to delete)
- Users receive success confirmation
- Allows preemptive resets before swiping

### 2. Already Processed Request
- System validates request is still pending
- Shows error if trying to process twice
- Prevents duplicate operations

### 3. Partial Matches
- Some items matched, some not
- Only mutual matches are cleared
- Solo swipes remain intact

### 4. Connection Removed
- Reset requests remain valid even if connection is removed
- Design decision: allows cleanup of old matches
- Alternative: Could auto-reject on connection removal

### 5. Multiple Categories
- Each reset is category-specific
- Can have multiple pending requests for different categories
- Cannot have duplicate pending requests for same category

## Testing Scenarios

### Basic Flow Test
```
1. User A and User B are connected
2. Both have swiped and matched on Movie #123
3. User A sends reset request for Movies
4. User B accepts
5. Verify: Match for Movie #123 is deleted
6. Verify: Both users' swipes on Movie #123 are deleted
7. Verify: Both can see Movie #123 in swipe deck again
8. Verify: Other categories (hikes, TV, restaurants) unaffected
```

### Multiple Users Test
```
1. User A, B, and C are all connected
2. All three match on Movie #456
3. User A sends reset request to User B for Movies
4. User B accepts
5. Verify: Match between A and B is deleted
6. Verify: Match between A and C still exists
7. Verify: Match between B and C still exists
8. Result: Category-wide reset only affects the two users
```

### Rejection Test
```
1. User A sends reset request to User B
2. User B declines
3. Verify: All matches remain intact
4. Verify: All swipes remain intact
5. Verify: Request is removed from UI
6. Result: No data changed, graceful rejection
```

### Duplicate Prevention Test
```
1. User A sends reset request to User B for Movies
2. User A tries to send another reset request for Movies
3. Verify: Second request is blocked with error message
4. User B accepts first request
5. User A can now send a new reset request for Movies
6. Result: Only one pending request per category pair
```

## Future Enhancements

### Potential Features

1. **Auto-Expiring Requests**
   - Requests expire after 7 days
   - Automatic cleanup of stale requests
   - Notifications before expiry

2. **Reset All Categories**
   - One-click reset for all categories
   - Useful for fresh starts
   - Requires extra confirmation

3. **Partial Reset Options**
   - Reset only matches (keep swipes)
   - Reset only swipes (keep matches)
   - More granular control

4. **Reset History**
   - View past resets
   - Analytics: "Matched 15 movies after last reset"
   - Helps track activity patterns

5. **Scheduled Resets**
   - Weekly/monthly auto-reset option
   - For regular movie night groups
   - Keeps content fresh automatically

6. **Group Resets**
   - Reset with multiple friends at once
   - Useful for friend groups
   - Requires all members to accept

## API Reference

### Functions

#### `sendResetRequest(toUserId: string, category: CategoryType): Promise<void>`
Send a reset request to a connected friend.

**Parameters:**
- `toUserId`: The user ID of the friend
- `category`: 'hikes' | 'movies' | 'tv' | 'restaurants'

**Throws:**
- "You must be logged in"
- "You must be connected with this user first"
- "User profile not found"
- "There is already a pending reset request for this category"

---

#### `getSentResetRequests(): Promise<ResetRequest[]>`
Get all reset requests sent by the current user.

**Returns:** Array of pending reset requests

---

#### `getReceivedResetRequests(): Promise<ResetRequest[]>`
Get all reset requests received by the current user.

**Returns:** Array of pending reset requests

---

#### `acceptResetRequest(requestId: string): Promise<void>`
Accept a reset request and clear mutual matches/swipes.

**Parameters:**
- `requestId`: The ID of the reset request

**Throws:**
- "You must be logged in"
- "Reset request not found"
- "You can only accept requests sent to you"
- "This request has already been processed"

**Side Effects:**
- Deletes all mutual matches for the category
- Deletes all swipes for mutually-liked items
- Updates request status to 'accepted'

---

#### `rejectResetRequest(requestId: string): Promise<void>`
Reject a reset request without changing any data.

**Parameters:**
- `requestId`: The ID of the reset request

**Throws:**
- "You must be logged in"
- "Reset request not found"
- "You can only reject requests sent to you"

---

#### `cancelResetRequest(requestId: string): Promise<void>`
Cancel a sent reset request (sender only).

**Parameters:**
- `requestId`: The ID of the reset request

**Throws:**
- "You must be logged in"
- "Reset request not found"
- "You can only cancel your own requests"

## Performance Considerations

### Query Optimization

1. **Indexed Fields**
   - Create composite index on `resetRequests`:
     - `fromUserId` + `status`
     - `toUserId` + `status`
     - `fromUserId` + `toUserId` + `category` + `status`

2. **Batch Operations**
   - Delete operations are batched where possible
   - Reduces Firestore write costs
   - Improves reset speed

3. **Real-time Listeners**
   - Consider adding `onSnapshot` for reset requests
   - Updates UI immediately when friend accepts/rejects
   - Better user experience than polling

### Scalability

- **Small Match Sets**: Current implementation fine (<1000 matches)
- **Large Match Sets**: Consider batch delete in Cloud Functions
- **Many Users**: Indexes ensure fast queries
- **Frequent Resets**: Minimal impact due to targeted deletes

## Conclusion

The Reset Matches feature provides a powerful way for friends to refresh their matching experience. Key strengths:

✅ **User-Centric**: Solves real use case (choosing movies/restaurants/etc. together)  
✅ **Safe**: Two-way consent required, category-specific  
✅ **Flexible**: Works independently per category  
✅ **Performant**: Efficient Firestore operations  
✅ **Secure**: Proper validation and access control  
✅ **Intuitive**: Clear UI and confirmation flows  

This feature complements the existing matching system and enhances the social experience of the app!
