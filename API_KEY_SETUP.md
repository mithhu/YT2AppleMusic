# OpenAI API Key Setup Guide

## 🔑 **How to Use AI Enhancement**

### **Step 1: Get Your OpenAI API Key**

1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign in or create an OpenAI account
3. Click "Create new secret key"
4. Give it a name (e.g., "YouTube Apple Music Extension")
5. Copy the key (starts with `sk-...`)
6. **Keep it private and secure!**

### **Step 2: Add Key to Extension**

1. **Build and load the extension:**
   ```bash
   npm run build
   ```
2. **Load in Chrome:**

   - Go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist/` folder

3. **Configure the extension:**
   - Click the extension icon in Chrome toolbar
   - Toggle ON "AI-enhanced search"
   - Enter your API key in the input field that appears
   - The key is stored securely in Chrome sync storage

### **Step 3: Test AI Enhancement**

1. Go to a YouTube music video
2. Click the extension icon
3. Click "Search Current Video"
4. You should see improved song matching with AI!

## 🛡️ **Security Features**

### **Your API Key is Safe**

- ✅ Stored in Chrome's secure sync storage
- ✅ Never logged or exposed in console
- ✅ Only sent to OpenAI's official API
- ✅ Input field is password-masked
- ✅ Syncs across your Chrome browsers

### **Privacy Protection**

- ✅ AI enhancement is completely optional
- ✅ Works without API key (rule-based fallback)
- ✅ No data collection or tracking
- ✅ All processing happens locally

## 🎯 **How AI Enhancement Works**

### **Without AI (Rule-based)**

```
"Adele - Hello (Official Music Video)"
→ Artist: "Adele", Song: "Hello (Official Music Video)"
```

### **With AI Enhancement**

```
"Adele - Hello (Official Music Video)"
→ Artist: "Adele", Song: "Hello"
→ Confidence: 95%
→ Alternative queries: ["Adele Hello", "Hello Adele"]
```

## 💰 **API Costs**

### **OpenAI Pricing**

- Uses GPT-3.5-turbo model
- ~$0.001-0.002 per song enhancement
- Very affordable for personal use
- You control your own usage

### **Cost Optimization**

- Only calls API when AI enhancement is enabled
- Caches results to avoid duplicate calls
- Falls back to free rule-based matching if API fails
- You can disable AI anytime to stop costs

## 🔧 **Troubleshooting**

### **API Key Not Working**

1. **Check the key format:** Should start with `sk-`
2. **Verify account:** Make sure you have OpenAI credits
3. **Check console:** Open DevTools → Console for error messages
4. **Try regenerating:** Create a new key if needed

### **AI Enhancement Not Improving Results**

1. **Check confidence scores:** Look for confidence percentages
2. **Compare results:** Try with/without AI on same video
3. **Check different videos:** Some titles are already clean

### **Extension Errors**

1. **Refresh YouTube page:** Content script may need reload
2. **Check permissions:** Extension needs YouTube access
3. **Reload extension:** Disable/enable in Chrome extensions

## 🎵 **Best Results**

### **AI Enhancement Works Best On:**

- Complex video titles with extra text
- Foreign language titles
- Covers, remixes, live versions
- Videos with featuring artists
- Unofficial uploads with messy titles

### **Examples:**

```
❌ Without AI: "Ed Sheeran - Shape of You (Official Video) [4K]"
✅ With AI: "Ed Sheeran" + "Shape of You"

❌ Without AI: "Bohemian Rhapsody - Queen (Live Aid 1985) [HD Remaster]"
✅ With AI: "Queen" + "Bohemian Rhapsody"
```

## 🚀 **Quick Start**

1. Get API key from OpenAI
2. `npm run build`
3. Load extension in Chrome
4. Enable AI enhancement + enter key
5. Test on YouTube music video
6. Enjoy better Apple Music matches! 🎶

---

**Remember:** Your API key is yours alone. Never share it publicly or commit it to code repositories!
