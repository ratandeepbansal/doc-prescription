# Development Guide

## Project Structure

This prescription assistant follows a clean architecture pattern:

```
app/          - Next.js app router pages
components/   - React components
  ui/         - shadcn/ui base components
lib/          - Business logic
  services/   - External service integrations (OpenAI, PDF, storage)
  store/      - Zustand state management
  types.ts    - TypeScript definitions
  utils.ts    - Helper functions
```

## Development Commands

```bash
# Start dev server (with Turbopack)
npm run dev

# Type checking only
npm run typecheck

# Linting only
npm run lint

# Both type checking and linting
npm run checks

# Production build
npm run build

# Production server
npm start
```

## Code Standards

### TypeScript
- Strict mode enabled
- All types defined in `lib/types.ts`
- Use interfaces for object shapes
- Avoid `any` type

### React Components
- Use `"use client"` directive for client components
- Functional components with TypeScript
- Props interface above component
- Use React hooks (useState, useEffect, useRef)

### UI Components
- Follow shadcn/ui patterns
- Use `cn()` utility for className merging
- Implement proper TypeScript types
- Use forwardRef when needed

### State Management
- Zustand store in `lib/store/`
- Keep stores focused and minimal
- Async actions in store methods

### Notifications
- Use Sonner toast library
- Import: `import { toast } from "sonner"`
- Types: `toast.success()`, `toast.error()`, `toast.info()`
- Never use browser `alert()` or `confirm()`

### Error Handling
- Try-catch for async operations
- Log errors to console
- Show user-friendly toast messages
- Graceful degradation (e.g., empty suggestions if API fails)

## Adding New Features

### 1. Create Types
Add TypeScript interfaces to `lib/types.ts`

### 2. Update Store (if needed)
Add state and actions to `lib/store/consultation-store.ts`

### 3. Create UI Components
Follow shadcn/ui patterns in `components/ui/`

### 4. Build Feature Component
Create in `components/` directory

### 5. Add Services (if needed)
External integrations in `lib/services/`

### 6. Test
- Run `npm run checks`
- Manual testing in browser
- Check console for errors

## Common Patterns

### Loading States
```typescript
const [isLoading, setIsLoading] = useState(false);

const handleAction = async () => {
  setIsLoading(true);
  try {
    await someAsyncOperation();
    toast.success('Success!');
  } catch (error) {
    console.error(error);
    toast.error('Something went wrong');
  } finally {
    setIsLoading(false);
  }
};
```

### Form Inputs
```typescript
const [value, setValue] = useState('');

<Input
  placeholder="Enter value"
  value={value}
  onChange={(e) => setValue(e.target.value)}
/>
```

### Conditional Rendering
```typescript
{isLoading ? (
  <Skeleton className="h-20 w-full" />
) : (
  <ActualContent />
)}
```

## Environment Variables

### Required
- `NEXT_PUBLIC_OPENAI_API_KEY` - OpenAI API key

### Development
Create `.env.local`:
```bash
NEXT_PUBLIC_OPENAI_API_KEY=sk-your-key-here
```

⚠️ **Security Note**: 
- `NEXT_PUBLIC_` prefix exposes variables to client
- For production, use backend API proxy
- Never commit `.env.local` to git

## Testing Checklist

- [ ] TypeScript compilation (`npm run typecheck`)
- [ ] ESLint passes (`npm run lint`)
- [ ] All phases work (welcome → recording → draft)
- [ ] PDF generation works
- [ ] Dark mode toggle works
- [ ] localStorage persistence works
- [ ] AI suggestions appear (with valid API key)
- [ ] Error states show toast notifications
- [ ] No console errors

## Known Limitations

1. **Simulated Transcription**: Uses setTimeout for demo
2. **Client-Side API**: OpenAI key exposed (MVP only)
3. **localStorage**: 5MB browser limit
4. **No Authentication**: Single-user only
5. **No Backend**: Everything client-side

## Next Steps for Production

1. **Backend API Proxy**
   - Move OpenAI calls server-side
   - Secure API key
   - Add rate limiting

2. **Database**
   - Replace localStorage
   - Add PostgreSQL/MongoDB
   - Implement proper schema

3. **Authentication**
   - Add doctor login
   - User management
   - Session handling

4. **Real Transcription**
   - Integrate OpenAI Realtime API
   - Add WebSocket support
   - Handle audio input

5. **Testing**
   - Unit tests (Jest/Vitest)
   - E2E tests (Playwright)
   - Integration tests

6. **Deployment**
   - Set up CI/CD
   - Environment configs
   - Monitoring and logging
