# Quick Start Guide

## Getting Started in 5 Minutes

### 1. Prerequisites Check
```bash
node --version  # Should be 18.x or higher
npm --version   # Should be 9.x or higher
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Backend URL
```bash
# Copy environment file
cp .env.local.example .env.local

# Edit .env.local and set your backend URL
# NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
```

### 4. Start Development Server
```bash
npm run dev
```

### 5. Open Browser
Navigate to: http://localhost:3000

---

## First Time Setup

### Create an Account
1. Click "Register" on the login page
2. Fill in:
   - Username (min 3 characters)
   - Email (valid email format)
   - Password (min 6 characters)
   - Confirm Password
3. Click "Register"

### Create Your First Note
1. Click "+ New Note" button
2. Enter a title and content
3. Click "Create Note"

### Edit a Note
1. Click "Edit" on any note card
2. Modify title or content
3. Click "Save Changes"

### View Version History
1. Click "History" on any note card
2. View all previous versions
3. Click "Restore" to revert to any version

### Delete a Note
1. Click the trash icon on any note card
2. Confirm deletion in the dialog

---

## Troubleshooting

### Backend Connection Issues
- Ensure backend is running
- Check `.env.local` has correct API URL
- Verify CORS is configured on backend

### Authentication Issues
- Clear localStorage in browser dev tools
- Check backend JWT settings
- Verify login credentials

### Build Issues
- Delete `node_modules` and `.next` folders
- Run `npm install` again
- Clear npm cache: `npm cache clean --force`

---

## Production Deployment

### Build for Production
```bash
npm run build
```

### Start Production Server
```bash
npm start
```

### Deploy to Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Environment Variables for Production
Set in your hosting platform:
- `NEXT_PUBLIC_API_BASE_URL` - Your production API URL

---

## Common Tasks

### Update Dependencies
```bash
npm update
```

### Check for Outdated Packages
```bash
npm outdated
```

### Run Linter
```bash
npm run lint
```

---

## API Endpoints Reference

### Auth
- `POST /auth/register/` - Register new user
- `POST /auth/login/` - Login user
- `POST /auth/logout/` - Logout user

### Notes
- `GET /notes/` - Get all notes
- `POST /notes/` - Create note
- `GET /notes/:id/` - Get single note
- `PUT /notes/:id/` - Update note
- `DELETE /notes/:id/` - Delete note

### Versions
- `GET /notes/:id/versions/` - Get version history
- `POST /notes/:id/versions/:versionId/restore/` - Restore version

---

## Tips & Best Practices

1. **Always test locally before deploying**
2. **Keep dependencies updated**
3. **Use meaningful commit messages**
4. **Test on multiple browsers**
5. **Monitor error logs**
6. **Backup important data**
7. **Use environment variables for configuration**
8. **Follow TypeScript best practices**
9. **Write clean, readable code**
10. **Document complex logic**

---

## Need Help?

- 📖 Read the full README.md
- 🐛 Check GitHub Issues
- 💬 Ask in Discussions
- 📧 Contact maintainers

---

Happy coding! 🚀
