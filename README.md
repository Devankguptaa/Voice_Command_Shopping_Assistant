# 🛒 Voice Command Shopping Assistant

A simple yet powerful shopping list app you can control with your **voice**.  
Built entirely using **HTML5, CSS3, and vanilla JavaScript** with the **Web Speech API**.  
No frameworks or backend needed — it runs fully in your browser.

---

## ✨ Features
- 🎤 **Voice Commands**: Add, remove, search, clear, and get help
- 🌍 **Supports Multiple Languages**: English, Spanish, French, German, Hindi
- 🧠 **Smart Assistant**:
  - Auto-categorizes items (dairy, produce, grains, etc.)
  - Seasonal suggestions
  - Substitute recommendations
  - History-based suggestions
- 🔍 **Search Products**: Find items by name, brand, or category
- 💾 **Local Persistence**: Saves list & history in LocalStorage
- 🔊 **Voice Feedback**: Speaks out every action

---

## 🚀 Getting Started

### Run Locally
1. Clone this repository:
   ```bash
   git clone https://github.com/your-username/voice-shopping-assistant.git
   ```
2. Open `index.html` in **Chrome** or **Edge**.
3. Allow microphone access.
4. Start speaking commands!

### Live Deployment  
This app is deployed as a static site on **Render**.  

🔗 **Live Demo**: https://voice-command-shopping-assistant-7htr.onrender.com  

Render provides free HTTPS hosting, automatic redeploys from Git, and a global CDN for fast access.  

---

## 🛠️ Tech Stack
- **Frontend**: HTML5, CSS3 (Flexbox & Grid), Vanilla JavaScript (ES6+)
- **APIs**: Web Speech API (Recognition + Synthesis)
- **Storage**: LocalStorage

---

## 📂 Project Structure
```
Voice_Command_Shopping_Assistant/
├── index.html     # Main HTML
├── styles.css     # Styling
├── script.js      # App logic
└── README.md      # Documentation
```

---

## 🎯 Example Commands
- “add milk” → Adds milk  
- “add 2 apples” → Adds 2 apples  
- “remove bread” → Deletes bread from list  
- “find juice” → Searches catalog for juice  
- “clear list” → Empties shopping list  
- “help” → Shows available commands  

---

## 📱 Browser Support
| Browser | Recognition | Speech | Status |
|---------|-------------|--------|--------|
| Chrome  | ✅           | ✅      | Full   |
| Edge    | ✅           | ✅      | Full   |
| Firefox | ❌           | ✅      | Partial|
| Safari  | ❌           | ✅      | Partial|

> 💡 For best results, use **Chrome** or **Edge**.

---

## 🐛 Troubleshooting
- Ensure you’re on **HTTPS** (mic access requires secure context).  
- Allow microphone permissions when prompted.  
- If speech doesn’t work, try Chrome/Edge.  

---

## 📈 Roadmap
- Cloud sync for lists  
- Grocery API integration  
- Barcode scanner support  
- Recipe/meal planning  
- Shared lists with family  


---

**Built with ❤️ using open web technologies.**
