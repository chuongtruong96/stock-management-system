# Deployment Commands

## Git Push Commands

```bash
# Navigate to your project directory
cd "D:\PMH Products\Stationery-Stock-mngt-system\stationery-mgnt-system"

# Check current status
git status

# Add all changes
git add .

# Commit with descriptive message
git commit -m "feat: Enhanced notifications system and migrated images to Cloudinary

- Implemented modern card-based notifications UI with advanced filtering
- Added bulk actions, search, and mobile-responsive design
- Migrated all product and category images to Cloudinary
- Updated database with cloud image URLs
- Added comprehensive translation support
- Enhanced accessibility and performance optimizations"

# Push to main branch
git push origin main
```

## Alternative shorter commit message:
```bash
git commit -m "Enhanced notifications & migrated images to Cloudinary"
```

## If you need to force push (use carefully):
```bash
git push origin main --force
```