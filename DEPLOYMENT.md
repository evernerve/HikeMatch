# 📋 Deployment Checklist

Use this checklist before deploying HikeMatch to production.

## ✅ Pre-Deployment

### Firebase Setup
- [ ] Firebase project created
- [ ] Firestore database enabled (test mode initially)
- [ ] Email/Password authentication enabled
- [ ] Firebase config added to `.env`
- [ ] Environment variables tested locally
- [ ] Trails collection initialized (runs automatically on first use)

### Code Quality
- [ ] No console errors in browser
- [ ] All features tested locally
- [ ] Authentication works (login, signup, logout)
- [ ] Swipe functionality works
- [ ] Matches display correctly
- [ ] Real-time updates working
- [ ] Mobile responsive design verified

### Security
- [ ] `.env` file in `.gitignore`
- [ ] No hardcoded API keys in code
- [ ] Firebase security rules reviewed
- [ ] Authentication required for all routes

## 🚀 Deployment Steps

### 1. Build Test
```bash
npm run build
npm run preview
```
- [ ] Build completes without errors
- [ ] Preview works correctly on http://localhost:4173

### 2. Vercel Setup
- [ ] GitHub repository created
- [ ] Code pushed to GitHub
- [ ] Vercel account created
- [ ] Project imported to Vercel

### 3. Environment Variables
Add these in Vercel Project Settings → Environment Variables:
- [ ] `VITE_FIREBASE_API_KEY`
- [ ] `VITE_FIREBASE_AUTH_DOMAIN`
- [ ] `VITE_FIREBASE_PROJECT_ID`
- [ ] `VITE_FIREBASE_STORAGE_BUCKET`
- [ ] `VITE_FIREBASE_MESSAGING_SENDER_ID`
- [ ] `VITE_FIREBASE_APP_ID`

### 4. Deploy
- [ ] Trigger deployment from Vercel dashboard
- [ ] Deployment succeeds
- [ ] Production URL accessible
- [ ] SSL certificate active (HTTPS)

## 🔒 Post-Deployment Security

### Firebase Security Rules
- [ ] Update Firestore rules to production mode:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
    
    match /trails/{trailId} {
      allow read: if request.auth != null;
      allow write: if false;
    }
    
    match /userSwipes/{userId}/swipes/{swipeId} {
      allow read, write: if request.auth.uid == userId;
    }
    
    match /matches/{matchId} {
      allow read: if request.auth != null && 
                     request.auth.uid in resource.data.userIds;
      allow create: if request.auth != null;
      allow update, delete: if false;
    }
  }
}
```

- [ ] Publish security rules
- [ ] Test that unauthorized access is blocked

### Firebase Authentication
- [ ] Email enumeration protection enabled
- [ ] Password policy configured
- [ ] Email verification (optional but recommended)

## ✅ Production Testing

### Authentication
- [ ] New user signup works
- [ ] Login works
- [ ] Logout works
- [ ] Demo user works
- [ ] Session persists on page refresh

### Core Features
- [ ] Trails load correctly
- [ ] Swipe right/left works
- [ ] Swipes are saved to Firestore
- [ ] Matches are created when two users like same trail
- [ ] Matches page shows correct data
- [ ] Real-time updates work

### UI/UX
- [ ] All images load
- [ ] Navigation works
- [ ] Mobile view is responsive
- [ ] Touch swipe works on mobile
- [ ] Animations are smooth
- [ ] Loading states appear correctly
- [ ] Error messages display properly

### PWA
- [ ] PWA install prompt appears
- [ ] App can be installed to home screen
- [ ] Offline page works (optional)
- [ ] Service worker registered
- [ ] Manifest.json accessible

### Performance
- [ ] Page loads in < 3 seconds
- [ ] Images optimized
- [ ] No memory leaks
- [ ] Firestore queries optimized

## 📊 Monitoring Setup (Optional)

### Firebase Console
- [ ] Set up billing alerts
- [ ] Monitor daily usage
- [ ] Review quota limits

### Vercel Analytics
- [ ] Enable Vercel Analytics
- [ ] Monitor page views
- [ ] Check error rates

### Google Analytics (Optional)
- [ ] Analytics enabled in Firebase
- [ ] Tracking events configured
- [ ] User flows analyzed

## 🎯 Launch Checklist

### Documentation
- [ ] README.md updated with live URL
- [ ] SETUP.md reviewed
- [ ] Known issues documented
- [ ] Feature roadmap created

### Marketing
- [ ] Custom domain configured (optional)
- [ ] Social media preview image
- [ ] Share with friends
- [ ] Collect feedback

### Maintenance
- [ ] Set up GitHub branch protection
- [ ] Plan for regular updates
- [ ] Monitor Firebase costs
- [ ] Backup strategy defined

## 🎉 Post-Launch

After successful deployment:

1. **Share with testers**: Get 3-5 friends to test
2. **Monitor logs**: Check Vercel and Firebase for errors
3. **Iterate**: Fix bugs and add features based on feedback
4. **Scale**: Upgrade Firebase plan if needed

## 🆘 Rollback Plan

If something goes wrong:

1. **Vercel**: Revert to previous deployment from dashboard
2. **Firebase**: Restore previous security rules
3. **Code**: Git revert to last working commit

```bash
# Revert last commit
git revert HEAD
git push

# Redeploy
vercel --prod
```

## 📝 Notes

- Firebase free tier: 50K reads/day, 20K writes/day, 1GB storage
- Vercel free tier: 100GB bandwidth/month
- Unsplash images are free but rate-limited

---

**Deployment Date**: _____________

**Production URL**: _____________

**Firebase Project ID**: _____________

**Deployed By**: _____________

---

## ✨ Success Criteria

Your deployment is successful when:
- ✅ Users can sign up and log in
- ✅ Users can swipe on trails
- ✅ Matches are created and displayed
- ✅ Real-time updates work
- ✅ No console errors
- ✅ Mobile experience is smooth
- ✅ PWA can be installed

**Congratulations! 🎉 Your HikeMatch app is live!**
