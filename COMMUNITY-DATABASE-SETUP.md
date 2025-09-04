# 🌐 Community Database Setup Guide

This guide will help you set up the community database feature for YT2AppleMusic, allowing all users to contribute to a shared YouTube → Apple Music mapping database.

## 🚀 Quick Setup with Supabase

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Choose your organization
4. Fill in project details:
   - **Name**: `yt2applemusic-community`
   - **Database Password**: Generate a strong password
   - **Region**: Choose closest to your users
5. Click "Create new project"
6. Wait for project to be ready (~2 minutes)

### Step 2: Set Up Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Copy the contents of `supabase-schema.sql` from this project
3. Paste it into the SQL Editor
4. Click **Run** to create the tables and functions

### Step 3: Community Database (Pre-configured)

**✅ No configuration needed!**

The extension comes pre-configured with a shared community Supabase database. This means:

- All users contribute to the same database
- No individual setup required
- Instant access to community mappings
- True collaborative experience

The community database credentials are safely embedded in the extension code.

### Step 4: Build and Test

1. Run `npm run build` to build the extension
2. Load the extension in Chrome
3. Test on a YouTube music video
4. Check the popup for "Community Database" stats

## 🔧 Environment Variables (Optional)

For better security, you can use environment variables:

1. Create a `.env` file in the project root:

```bash
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

2. The extension will automatically use these values

## 📊 Database Schema Overview

### Tables Created:

1. **`song_mappings`** - Main mapping table

   - `youtube_id` - YouTube video ID
   - `apple_music_id` - Apple Music track ID
   - `confidence_score` - Algorithm-calculated confidence (0-1)
   - `user_confirmations` - Number of user confirmations
   - `user_rejections` - Number of user rejections

2. **`user_contributions`** - User activity tracking
   - `user_id` - Anonymous user identifier
   - `mapping_id` - Reference to song mapping
   - `action` - Type of contribution (confirm/reject/submit)

### Key Features:

- **Confidence Scoring**: Automatically calculated based on user votes
- **Duplicate Prevention**: Users can only vote once per mapping
- **Quality Control**: Only high-confidence mappings (70%+) are auto-used
- **Privacy**: No personal data stored, only anonymous user IDs

## 🎯 How It Works

### For Users:

1. **Discovery**: Extension checks community database first
2. **Confirmation**: Users confirm if matches are correct
3. **Contribution**: Votes improve mapping confidence scores
4. **Benefit**: High-confidence mappings work instantly for everyone

### Data Flow:

```
YouTube Video → Local Cache → Community Database → iTunes API
                    ↓              ↓                ↓
                 Instant        Fast Cache        New Mapping
```

### Confidence Algorithm:

- **New mappings**: Start at 50% confidence
- **User confirmations**: Increase confidence
- **User rejections**: Decrease confidence
- **Threshold**: 70% confidence + 2+ confirmations = auto-use

## 🛡️ Security & Privacy

### What's Stored:

- ✅ YouTube video IDs (public)
- ✅ Apple Music track IDs (public)
- ✅ Song titles and artists (public metadata)
- ✅ Anonymous user IDs (random strings)
- ✅ Vote counts and confidence scores

### What's NOT Stored:

- ❌ Personal information
- ❌ Browsing history
- ❌ IP addresses
- ❌ Account information

### Row Level Security:

- All data is public (music metadata)
- Users can read all mappings
- Users can contribute new mappings
- Users can vote on existing mappings
- No sensitive data exposure risk

## 📈 Monitoring & Analytics

### Available Stats:

- Total community mappings
- High-confidence mappings
- Individual user contributions
- Mapping accuracy over time

### Supabase Dashboard:

- Real-time database activity
- User engagement metrics
- API usage statistics
- Performance monitoring

## 🔧 Advanced Configuration

### Custom Confidence Thresholds:

Edit `src/utils/communityDb.ts`:

```typescript
private static readonly CONFIDENCE_THRESHOLD = 0.7; // 70%
private static readonly MIN_CONFIRMATIONS = 2;
```

### Rate Limiting:

Supabase provides built-in rate limiting:

- Free tier: 500 requests/second
- Paid tiers: Higher limits available

### Scaling:

- **Database**: PostgreSQL scales automatically
- **Storage**: 500MB free, unlimited paid
- **Bandwidth**: 5GB free, unlimited paid

## 🚨 Troubleshooting

### Common Issues:

1. **"Community database not available"**

   - Check Supabase credentials in `src/config/supabase.ts`
   - Verify project is active in Supabase dashboard
   - Check browser console for errors

2. **"Permission denied" errors**

   - Ensure RLS policies are set up correctly
   - Run the complete `supabase-schema.sql` script
   - Check anon key permissions

3. **No community stats showing**
   - Verify database has data (check Supabase dashboard)
   - Check network connectivity
   - Look for JavaScript errors in console

### Debug Mode:

Enable detailed logging by adding to console:

```javascript
localStorage.setItem("yt2apple_debug", "true");
```

## 🎉 Success Metrics

Once set up successfully, you should see:

- ✅ Community stats in extension popup
- ✅ Faster song lookups for popular videos
- ✅ User confirmation prompts working
- ✅ Growing database of mappings

## 🤝 Contributing

The community database grows stronger with more users:

- **Confirm accurate matches** to improve confidence
- **Report incorrect matches** to maintain quality
- **Share the extension** to grow the contributor base
- **Submit feedback** for improvements

---

**Need help?** Check the browser console for error messages or create an issue in the project repository.
