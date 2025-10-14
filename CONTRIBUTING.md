# 🤝 Contributing to HikeMatch

Thank you for your interest in contributing to HikeMatch! This guide will help you get started.

## 🎯 Ways to Contribute

- 🐛 Report bugs
- 💡 Suggest new features
- 📝 Improve documentation
- 🎨 Enhance UI/UX
- 🔧 Fix issues
- ✨ Add new features

## 🚀 Getting Started

1. **Fork the repository**
2. **Clone your fork**:
   ```bash
   git clone https://github.com/your-username/hikematch.git
   cd hikematch
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Set up Firebase** (see SETUP.md)
5. **Create a branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## 💻 Development Workflow

### Running Locally
```bash
npm run dev
```

### Building
```bash
npm run build
```

### Linting
```bash
npm run lint
```

### Testing Your Changes
1. Test authentication flow
2. Test swipe functionality
3. Test with multiple users
4. Test on mobile viewport
5. Check browser console for errors

## 🎨 Code Style

- Use TypeScript for type safety
- Follow existing code patterns
- Use meaningful variable names
- Add comments for complex logic
- Keep functions small and focused

### Component Structure
```typescript
import { useState, useEffect } from 'react';
import { SomeType } from '../lib/types';

interface ComponentProps {
  // Props with TypeScript types
}

export default function ComponentName({ props }: ComponentProps) {
  // State
  const [state, setState] = useState<Type>(initial);

  // Effects
  useEffect(() => {
    // Effect logic
  }, [dependencies]);

  // Handlers
  const handleAction = () => {
    // Handler logic
  };

  // Render
  return (
    <div className="tailwind-classes">
      {/* JSX */}
    </div>
  );
}
```

## 🌟 Feature Ideas

Here are some features you could add:

### Easy
- [ ] Add difficulty filter for trails
- [ ] Add trail search functionality
- [ ] Show user profile page
- [ ] Add dark mode
- [ ] Add more trail categories

### Medium
- [ ] Implement undo last swipe
- [ ] Add trail favorites list
- [ ] Group matching (3+ users)
- [ ] Share matches on social media
- [ ] User settings page

### Advanced
- [ ] Map view with trail locations
- [ ] Weather integration for trails
- [ ] AI trail recommendations
- [ ] Chat between matched users
- [ ] Photo upload for completed hikes

## 📝 Pull Request Process

1. **Update documentation** if needed
2. **Test thoroughly** on multiple browsers
3. **Commit with clear messages**:
   ```bash
   git commit -m "feat: add trail difficulty filter"
   ```
4. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```
5. **Create Pull Request** with:
   - Clear title
   - Description of changes
   - Screenshots (if UI changes)
   - Testing notes

### Commit Message Format
```
type: brief description

Longer description if needed

Fixes #issue-number
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Maintenance

## 🐛 Bug Reports

When reporting bugs, include:

1. **Description**: What happened?
2. **Expected behavior**: What should happen?
3. **Steps to reproduce**:
   - Step 1
   - Step 2
   - Step 3
4. **Screenshots**: If applicable
5. **Environment**:
   - Browser & version
   - OS
   - Device (mobile/desktop)
6. **Console errors**: Check browser console (F12)

## 💡 Feature Requests

When suggesting features:

1. **Problem**: What problem does it solve?
2. **Solution**: How would it work?
3. **Alternatives**: Other approaches considered?
4. **Mockups**: Sketches or wireframes (if UI)

## 🏗️ Project Structure

```
hikeapp/
├── src/
│   ├── components/      # Reusable React components
│   │   ├── AuthForm.tsx
│   │   ├── Navbar.tsx
│   │   └── TrailCard.tsx
│   ├── pages/          # Page components
│   │   ├── Home.tsx
│   │   └── Matches.tsx
│   ├── lib/            # Utilities and helpers
│   │   ├── firebase.ts
│   │   └── firestoreHelpers.ts
│   ├── App.tsx         # Main app component
│   ├── main.tsx        # Entry point
│   └── index.css       # Global styles
├── public/             # Static assets
├── .env.example        # Environment template
├── vite.config.ts      # Vite configuration
├── tailwind.config.js  # Tailwind configuration
└── package.json        # Dependencies
```

## 🔥 Firebase Guidelines

### Adding New Collections
1. Update `firestoreHelpers.ts`
2. Add TypeScript interfaces
3. Add helper functions
4. Update security rules
5. Document in README

### Security Rules
Always follow the principle of least privilege:
- Users can only read/write their own data
- Authenticate all operations
- Validate data structure
- Rate limit if needed

## 🎨 UI/UX Guidelines

- **Mobile-first**: Design for mobile, enhance for desktop
- **Accessibility**: Use semantic HTML, ARIA labels
- **Loading states**: Always show feedback
- **Error handling**: Display helpful error messages
- **Consistency**: Follow existing design patterns

### Tailwind Classes
Use existing utility classes:
- `btn-primary`: Primary button
- `btn-secondary`: Secondary button
- `input-field`: Form inputs
- `card`: Card container

## 📱 PWA Considerations

When adding features:
- Ensure offline functionality (if possible)
- Optimize images and assets
- Test on actual mobile devices
- Check PWA install flow

## 🧪 Testing Checklist

Before submitting PR:

- [ ] Code builds without errors
- [ ] No console errors or warnings
- [ ] Works in Chrome
- [ ] Works in Firefox
- [ ] Works in Safari
- [ ] Mobile responsive
- [ ] Swipe works on touch devices
- [ ] Real-time updates work
- [ ] Authentication flow intact

## 📚 Resources

- [React Docs](https://react.dev)
- [Firebase Docs](https://firebase.google.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)

## 💬 Questions?

- Open an issue for questions
- Check existing issues first
- Be respectful and constructive

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for making HikeMatch better! 🎉**

Happy coding! 🚀
