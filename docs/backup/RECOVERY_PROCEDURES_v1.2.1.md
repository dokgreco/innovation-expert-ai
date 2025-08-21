# Innovation Expert AI v1.2.1 - Recovery Procedures

**Version:** v1.2.1 Production Ready  
**Backup Date:** August 21, 2025  
**Last Updated:** August 21, 2025  

## Emergency Recovery (Quick Start)

### Prerequisites
- Node.js v22.17.1 or compatible
- npm v10.9.2 or compatible
- Git access to repository
- Access to environment variables

### Step 1: Repository Recovery
```bash
# Option A: From backup branch (recommended for pre-security state)
git clone -b backup/v1.2.1-pre-security https://github.com/dokgreco/innovation-expert-ai.git
cd innovation-expert-ai

# Option B: From production tag
git clone https://github.com/dokgreco/innovation-expert-ai.git
cd innovation-expert-ai
git checkout v1.2.1-production
```

### Step 2: Dependencies Installation
```bash
# Clean install from package-lock.json
npm ci

# Verify installation
npm list --depth=0
```

### Step 3: Environment Configuration
```bash
# Copy environment template
cp .env.example .env.local

# Configure required variables:
# NOTION_TOKEN=secret_xxxxx
# NOTION_CASE_STUDIES_DB=xxxxx
# NOTION_BEST_PRACTICES_DB=xxxxx
# NOTION_INSIGHTS_DB=xxxxx
# ANTHROPIC_API_KEY=sk-ant-xxxxx
```

### Step 4: Verification
```bash
# Development mode test
npm run dev

# Build test
npm run build
npm start

# Lint check
npm run lint
```

## Full System Recovery

### 1. Infrastructure Setup

#### Local Development
```bash
# Verify Node.js version
node --version  # Should be v22.17.1

# Verify npm version
npm --version   # Should be v10.9.2

# Update if necessary
nvm install 22.17.1
nvm use 22.17.1
```

#### Production Environment (Vercel)
```bash
# Deploy from backup branch
vercel --prod --yes

# Or deploy from production tag
git checkout v1.2.1-production
vercel --prod --yes
```

### 2. Database Recovery

#### Notion Databases
- **Case Studies DB**: Verify connection and data integrity
- **Best Practices DB**: Ensure all records accessible
- **Insights DB**: Check query performance

```javascript
// Test Notion connection
const { Client } = require('@notionhq/client');
const notion = new Client({ auth: process.env.NOTION_TOKEN });

// Verify database access
async function verifyDatabases() {
  try {
    const caseStudies = await notion.databases.query({
      database_id: process.env.NOTION_CASE_STUDIES_DB,
      page_size: 1
    });
    console.log('✅ Case Studies DB accessible');
    
    const bestPractices = await notion.databases.query({
      database_id: process.env.NOTION_BEST_PRACTICES_DB,
      page_size: 1
    });
    console.log('✅ Best Practices DB accessible');
    
    const insights = await notion.databases.query({
      database_id: process.env.NOTION_INSIGHTS_DB,
      page_size: 1
    });
    console.log('✅ Insights DB accessible');
  } catch (error) {
    console.error('❌ Database verification failed:', error);
  }
}
```

### 3. API Services Recovery

#### Anthropic Claude API
```bash
# Test API connection
curl -H "Content-Type: application/json" \
     -H "x-api-key: $ANTHROPIC_API_KEY" \
     -d '{"model": "claude-3-sonnet-20240229", "max_tokens": 10, "messages": [{"role": "user", "content": "test"}]}' \
     https://api.anthropic.com/v1/messages
```

### 4. Feature Verification Checklist

#### Core Functionality
- [ ] Main analysis engine working
- [ ] Notion database queries optimized
- [ ] Claude AI responses generating
- [ ] Multilingual support (IT/EN)
- [ ] Translation loading correctly

#### Advanced Features
- [ ] Validation questions displaying
- [ ] Scoring system calculating
- [ ] Re-submission flow (3 iterations)
- [ ] Delta tracking working
- [ ] Deep dive sections accessible

#### UI/UX Components
- [ ] Progress indicator showing correct steps
- [ ] Language switcher functioning
- [ ] Sidebar navigation working
- [ ] Footer with copyright and privacy links
- [ ] Privacy policy page accessible

#### Performance & Security
- [ ] Page load times optimized (~12s analysis)
- [ ] Rate limiting active
- [ ] CORS policies configured
- [ ] Domain restrictions in place

## File Recovery (From Local Backup)

### If Git Repository Unavailable
```bash
# Extract from backup archive
cd backup/critical-files-v1.2.1/

# Copy to new project directory
mkdir -p new-innovation-expert-ai
cp -r * new-innovation-expert-ai/
cd new-innovation-expert-ai

# Initialize git repository
git init
git add .
git commit -m "Restore from backup v1.2.1"

# Continue with dependency installation
npm install
```

## Troubleshooting Common Issues

### Build Failures
```bash
# Clear Next.js cache
rm -rf .next

# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Translation Issues
```bash
# Verify translation files exist
ls -la public/locales/it/
ls -la public/locales/en/

# Check file contents
cat public/locales/it/common.json
cat public/locales/en/common.json
```

### API Connection Issues
```bash
# Verify environment variables
echo $NOTION_TOKEN
echo $ANTHROPIC_API_KEY

# Test API endpoints locally
npm run dev
curl http://localhost:3000/api/claude-analysis
```

### Performance Issues
```bash
# Check Node.js memory usage
node --max-old-space-size=4096 node_modules/.bin/next dev

# Monitor build performance
npm run build --verbose
```

## Rollback Procedures

### From Security Implementation Issues
```bash
# Quick rollback to pre-security state
git checkout backup/v1.2.1-pre-security
npm ci
npm run build

# Verify rollback successful
npm run dev
```

### From Production Issues
```bash
# Emergency rollback using tag
git checkout v1.2.1-production
vercel --prod --yes

# Verify production deployment
curl https://innovation-expert-ai-sana.vercel.app/
```

## Validation Testing

### Complete System Test
```bash
# 1. Start application
npm run dev

# 2. Test main flow
# - Enter project description
# - Verify analysis generation
# - Complete validation questions
# - Check scoring calculation

# 3. Test language switching
# - Switch to English
# - Verify translations load
# - Switch back to Italian

# 4. Test deep dive sections
# - Navigate to each section
# - Ask questions in Q&A
# - Verify responses generate

# 5. Test privacy policy
# - Click privacy link in footer
# - Verify page loads in both languages
```

## Emergency Contacts & Resources

### Technical Resources
- **Repository**: https://github.com/dokgreco/innovation-expert-ai
- **Production URL**: https://innovation-expert-ai-sana.vercel.app
- **Vercel Dashboard**: [Vercel project dashboard]

### Recovery Time Estimates
- **Quick Recovery**: 5-10 minutes
- **Full System Recovery**: 15-30 minutes
- **Complete Rebuild**: 45-60 minutes

### Success Criteria
✅ Application starts without errors  
✅ All pages load correctly  
✅ Analysis generation working  
✅ Multilingual support functional  
✅ Privacy policy accessible  
✅ Performance within acceptable range (≤15s analysis)  

---

**Last Verified**: August 21, 2025  
**Recovery Documentation Version**: 1.0  
**System State**: v1.2.1 Production Ready