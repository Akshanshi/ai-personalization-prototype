# Pickabook Setup & Verification Checklist

Use this checklist to ensure your Pickabook prototype is set up correctly and working as expected.

## Pre-Setup Checklist

### Prerequisites
- [ ] Node.js 18 or higher installed (`node --version`)
- [ ] npm installed (`npm --version`)
- [ ] Text editor ready (VS Code, Cursor, etc.)
- [ ] Terminal/command prompt open
- [ ] Internet connection available

### Account Setup
- [ ] Created Replicate account at [replicate.com](https://replicate.com)
- [ ] Generated API token from [Account Settings](https://replicate.com/account/api-tokens)
- [ ] Copied API token to clipboard or notepad

## Installation Checklist

### Step 1: Download & Install
- [ ] Project files downloaded/cloned
- [ ] Navigated to project directory in terminal
- [ ] Ran `npm install`
- [ ] No errors during installation
- [ ] `node_modules` folder created

### Step 2: Environment Configuration
- [ ] Created `.env.local` file in project root
- [ ] Copied content from `.env.example`
- [ ] Replaced placeholder with actual Replicate API token
- [ ] Saved `.env.local` file
- [ ] Verified no extra spaces around token

### Step 3: Start Development Server
- [ ] Ran `npm run dev`
- [ ] Server started without errors
- [ ] Saw "Ready" message in terminal
- [ ] URL shown: `http://localhost:3000`

## UI Verification Checklist

### Step 4: Open Application
- [ ] Opened browser
- [ ] Navigated to `http://localhost:3000`
- [ ] Page loaded successfully
- [ ] No errors in browser console (F12)

### Step 5: Verify UI Elements
- [ ] "Pickabook" header visible
- [ ] Orange/amber gradient background visible
- [ ] Two cards displayed: "Upload Photo" and "Personalized Result"
- [ ] Upload area shows "Click to upload an image"
- [ ] Result area shows "Your result will appear here"
- [ ] "Generate Personalized Illustration" button at bottom
- [ ] Button is disabled (no file uploaded yet)

## Functionality Testing Checklist

### Step 6: Test File Upload
- [ ] Clicked upload area
- [ ] File picker opened
- [ ] Selected a test photo (child's face, or any face)
- [ ] Photo preview appeared in upload card
- [ ] Preview shows correct image
- [ ] "Change Photo" and "Clear" buttons visible
- [ ] Generate button is now enabled

### Step 7: Test Validation
- [ ] Tried uploading a non-image file (e.g., .txt)
- [ ] Received error message: "Please select a valid image file"
- [ ] Tried uploading very large file (>10MB) if available
- [ ] Received error message about file size
- [ ] Tried uploading valid image again
- [ ] Validation passed successfully

### Step 8: Test Generation
- [ ] Clicked "Generate Personalized Illustration" button
- [ ] Button text changed to "Generating..."
- [ ] Button became disabled
- [ ] Loading spinner appeared in result card
- [ ] Message shown: "Creating your magical illustration..."
- [ ] Waited 30-60 seconds (this is normal)

### Step 9: Verify Result
- [ ] Personalized illustration appeared in result card
- [ ] Image looks like cartoon/illustrated version
- [ ] Success message appeared at top
- [ ] "Download Image" button visible
- [ ] Image quality looks good
- [ ] Face is recognizable in cartoon form

### Step 10: Test Download
- [ ] Clicked "Download Image" button
- [ ] Browser initiated download
- [ ] File downloaded as PNG
- [ ] Opened downloaded file
- [ ] Image opens correctly
- [ ] Quality is good

### Step 11: Test Additional Features
- [ ] Clicked "Clear" button
- [ ] Preview and result cleared
- [ ] Upload area reset
- [ ] Uploaded different photo
- [ ] Generated another illustration
- [ ] Second generation worked correctly

## Error Testing Checklist

### Step 12: Test Error Scenarios
- [ ] Stopped dev server (Ctrl+C)
- [ ] Tried to generate image
- [ ] Received appropriate error message
- [ ] Restarted dev server
- [ ] App recovered successfully

### Step 13: Console Verification
**Terminal (Server Logs):**
- [ ] Saw "Received personalization request" log
- [ ] Saw "Processing file" log
- [ ] Saw "Calling Replicate API" log
- [ ] Saw "AI personalization successful" log
- [ ] Saw "Compositing onto template" log
- [ ] Saw "Personalization completed successfully" log
- [ ] No unexpected errors

**Browser Console (F12):**
- [ ] Saw "Sending request to API..." log
- [ ] Saw "Received personalized image" log
- [ ] No red error messages
- [ ] No failed network requests

## Documentation Review Checklist

### Step 14: Documentation
- [ ] Read `README.md` overview
- [ ] Reviewed `SETUP.md` for setup steps
- [ ] Skimmed `ARCHITECTURE.md` for technical details
- [ ] Bookmarked `TROUBLESHOOTING.md` for future reference
- [ ] Reviewed `API.md` for integration options
- [ ] Read `SUMMARY.md` for complete overview

## Advanced Testing (Optional)

### Step 15: Template System (Optional)
- [ ] Created or downloaded a 1024x1024 PNG template
- [ ] Saved as `public/templates/template1.png`
- [ ] Regenerated illustration
- [ ] Face appeared on template correctly
- [ ] Position looks good

### Step 16: Configuration Testing (Optional)
- [ ] Modified prompt in `app/api/personalize/route.ts`
- [ ] Tried different style description
- [ ] Regenerated with new prompt
- [ ] Style changed as expected
- [ ] Reverted to original prompt

### Step 17: Different Photos (Optional)
Tested with:
- [ ] Child photo (intended use)
- [ ] Adult photo (should still work)
- [ ] Side-facing photo (may not work as well)
- [ ] Group photo (only processes first face)
- [ ] Low-quality photo (may produce poor results)
- [ ] High-quality photo (best results)

## Deployment Readiness Checklist

### Step 18: Pre-Deployment
- [ ] Ran `npm run build`
- [ ] Build completed without errors
- [ ] Ran `npm run start`
- [ ] Production server started
- [ ] Tested production build locally
- [ ] Everything works in production mode

### Step 19: Environment Variables
- [ ] Listed all required environment variables
- [ ] Documented each variable purpose
- [ ] Prepared values for production environment
- [ ] Never committed `.env.local` to git

### Step 20: Deployment Platform
If deploying to Vercel:
- [ ] Created Vercel account
- [ ] Connected GitHub repository
- [ ] Set environment variable: `REPLICATE_API_TOKEN`
- [ ] Upgraded to Pro plan (for 60s timeout)
- [ ] Deployed successfully
- [ ] Tested production URL

If deploying to Railway:
- [ ] Created Railway account
- [ ] Created new project
- [ ] Connected repository
- [ ] Set environment variables
- [ ] Deployed successfully
- [ ] Tested production URL

## Performance Verification Checklist

### Step 21: Performance Metrics
- [ ] Measured upload validation time: <100ms ✓
- [ ] Measured preview generation: <100ms ✓
- [ ] Measured total API time: 30-60s ✓
- [ ] Measured download time: <1s ✓
- [ ] No memory leaks after multiple generations
- [ ] UI remains responsive during processing

## Security Checklist

### Step 22: Security Verification
- [ ] `.env.local` is in `.gitignore`
- [ ] API token not visible in browser
- [ ] API token not in client-side code
- [ ] File validation working (type & size)
- [ ] No sensitive data in error messages
- [ ] Stack traces only in development mode

## Final Checks

### Step 23: Code Quality
- [ ] Ran `npm run typecheck` (expected to fail until npm install)
- [ ] No TypeScript errors after install
- [ ] Code is well-commented
- [ ] File structure is organized
- [ ] No unused files or code

### Step 24: Documentation
- [ ] All documentation files present
- [ ] README is clear and complete
- [ ] Setup instructions are accurate
- [ ] Architecture is well-documented
- [ ] API is fully documented

### Step 25: Ready for Demo
- [ ] Have test photos ready
- [ ] Know the expected processing time
- [ ] Can explain the architecture
- [ ] Can demonstrate error handling
- [ ] Can discuss V2 improvements
- [ ] Understand limitations
- [ ] Know cost implications

## Troubleshooting Reference

If any check fails, refer to:
1. `TROUBLESHOOTING.md` - Common issues
2. Terminal logs - Server errors
3. Browser console - Client errors
4. `SETUP.md` - Setup instructions
5. [Replicate Status](https://status.replicate.com/) - API status

## Success Criteria

You're ready to proceed if:
- [x] All "Installation" steps passed
- [x] All "UI Verification" steps passed
- [x] All "Functionality Testing" steps passed
- [x] At least one successful generation completed
- [x] Download works correctly
- [x] No critical errors

## Common Issues Quick Fix

| Issue | Quick Fix |
|-------|-----------|
| Module not found | Run `npm install` |
| API token error | Check `.env.local` |
| Server won't start | Kill port 3000: `lsof -ti:3000 | xargs kill` |
| Timeout error | Wait longer or check Replicate status |
| Template not found | System works without templates |
| Build error | Clear cache: `rm -rf .next node_modules && npm install` |

## Support

Need help? Check:
- [ ] `TROUBLESHOOTING.md` for common issues
- [ ] Browser console for errors
- [ ] Terminal for server logs
- [ ] Replicate dashboard for API status
- [ ] GitHub issues for known problems

---

## Sign-Off

Date: _______________

Tested by: _______________

Environment:
- [ ] Development
- [ ] Production

Status:
- [ ] All checks passed
- [ ] Ready for demo
- [ ] Ready for deployment
- [ ] Issues found (see notes below)

Notes:
_______________________________________
_______________________________________
_______________________________________

---

**Congratulations!** If all checks passed, you have a fully functional Pickabook prototype! 🎉
