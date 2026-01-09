# Notes Frontend Application

A professional, production-quality Next.js frontend for a Notes API with Version History.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **HTTP Client:** Axios
- **Form Handling:** React Hook Form
- **Validation:** Zod
- **UI Components:** ShadCN UI
- **Icons:** Lucide React
- **Notifications:** Sonner

## Features

### Authentication
- ✅ User registration with validation
- ✅ User login with JWT authentication
- ✅ Protected routes
- ✅ Automatic token management with Axios interceptors
- ✅ Logout functionality

### Notes Management
- ✅ View all notes in a card-based grid layout
- ✅ Create new notes with modal dialog
- ✅ Edit existing notes
- ✅ Delete notes with confirmation dialog
- ✅ Empty state when no notes exist
- ✅ Loading skeletons for better UX

### Version History
- ✅ View all versions of a note
- ✅ Display version details (title, content, timestamp)
- ✅ Restore previous versions
- ✅ Confirmation before restoring
- ✅ Visual indicator for current version

## Project Structure

```
notes_frontend/
├── app/
│   ├── dashboard/
│   │   ├── layout.tsx           # Protected dashboard layout
│   │   └── notes/
│   │       ├── page.tsx         # Notes list page
│   │       └── [id]/
│   │           ├── page.tsx     # Edit note page
│   │           └── versions/
│   │               └── page.tsx # Version history page
│   ├── login/
│   │   └── page.tsx            # Login page
│   ├── register/
│   │   └── page.tsx            # Register page
│   ├── layout.tsx              # Root layout
│   ├── globals.css             # Global styles
│   └── page.tsx                # Home page (redirects to login)
│
├── components/
│   ├── Navbar.tsx              # Navigation bar
│   ├── NoteCard.tsx            # Note card component
│   ├── VersionItem.tsx         # Version history item
│   └── ui/                     # ShadCN UI components
│       ├── button.tsx
│       ├── input.tsx
│       ├── textarea.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       ├── skeleton.tsx
│       └── label.tsx
│
├── context/
│   └── AuthContext.tsx         # Authentication context & logic
│
├── lib/
│   ├── api.ts                  # Axios instance & API functions
│   ├── auth.ts                 # Token management utilities
│   ├── types.ts                # TypeScript type definitions
│   └── utils.ts                # Utility functions (cn)
│
├── .env.local                  # Environment variables
├── .env.local.example          # Environment variables template
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.js
└── next.config.js
```

## Setup Instructions

### Prerequisites

- Node.js 18.x or higher
- npm or yarn
- Backend API running (Django REST Framework)

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   
   Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```
   
   Update the API URL in `.env.local`:
   ```env
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   ```
   http://localhost:3000
   ```

## API Integration

This frontend expects the following backend API endpoints:

### Authentication
- `POST /api/auth/register/` - User registration
- `POST /api/auth/login/` - User login
- `POST /api/auth/logout/` - User logout

### Notes
- `GET /api/notes/` - List all notes
- `GET /api/notes/:id/` - Get single note
- `POST /api/notes/` - Create new note
- `PUT /api/notes/:id/` - Update note
- `DELETE /api/notes/:id/` - Delete note

### Version History
- `GET /api/notes/:id/versions/` - Get all versions of a note
- `POST /api/notes/:id/versions/:versionId/restore/` - Restore a version

### Authentication Headers

All authenticated requests include:
```
Authorization: Bearer <access_token>
```

## Key Features Explained

### Authentication Flow

1. User logs in via `/login`
2. JWT tokens stored in localStorage
3. Axios interceptor automatically adds token to all requests
4. On 401 error, user is redirected to login
5. Logout clears tokens and redirects to login

### Protected Routes

The dashboard layout checks authentication status and redirects unauthenticated users to login.

### Form Validation

All forms use React Hook Form with Zod validation for:
- Type safety
- Real-time validation
- Clear error messages
- Better UX

### Error Handling

- API errors shown via toast notifications
- Loading states for all async operations
- Confirmation dialogs for destructive actions
- Graceful error recovery

## Production Considerations

### Security
- JWT tokens stored in localStorage (consider httpOnly cookies for production)
- HTTPS required for production
- Environment variables for API URLs
- CORS configuration on backend

### Performance
- Server-side rendering where appropriate
- Loading skeletons for better perceived performance
- Optimized bundle size
- Code splitting via Next.js App Router

### UX
- Responsive design (mobile + desktop)
- Loading states
- Empty states
- Error states
- Success feedback

## Development Scripts

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_BASE_URL` | Backend API base URL | `http://localhost:8000/api` |

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## Support

For issues and questions, please open a GitHub issue.
