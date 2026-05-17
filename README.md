# GeoDuels Enhancer (No Labels) 
Version: 1.9.1

Manifest Version: MV3

A lightweight Google Chrome extension designed for geoduels.io (and local development environments) that intercepts and hides overlay road labels within the Google Street View iframe. This allows players to customize their difficulty settings by toggling floating text layers on or off.
## 🚀 Features

* Hide Road Names Toggle: Effortlessly strips out floating chip labels indicating street names directly from the viewing interface. (Note: Baked-in imagery text captured on the actual physical roads cannot be removed).

* Streamlined UI: Clean, minimalist dark-mode configuration menu modeled directly after the game's core styling theme.
## 🛠 How It Works (Technical Overview)
Because Google Street View renders inside an iframe via canvas-based WebGL, traditional DOM-manipulation or CSS hiding cannot cleanly strip out labels. This extension bypasses that restriction by hooking directly into the WebGL drawing layer:

  1. Host Monitoring (content/host.js): Runs on geoduels.io. It utilizes a MutationObserver to watch for newly generated Street View iframes loaded dynamically each round.

  2. Cross-Context Communication: When a frame is caught, host.js communicates the user's current settings configuration down into the frame context via standard postMessage.

  3. WebGL Texture Hooking (content/streetview.js): Injected directly into the MAIN world execution environment of the maps iframe at document_start. It overrides WebGLRenderingContext.prototype.texImage2D and texSubImage2D.

  4. Label Detection: As textures load, it analyzes image dimensions (checking for wide banner sprite-sheet ratios) or inspects image source strings for signature Google Maps label endpoints (maps/vt, mapsLabel, overlay, etc.).

  5. Texture Neutralization: If identified as a label source, the script replaces the incoming image graphic with a completely transparent, blank canvas element of the exact same dimensions on the fly—rendering the label invisible to the canvas player.
## 📁 File Structure 
    ├── manifest.json         # Extension configuration & MV3 context setups
    ├── background.js         # Service worker initializing default sync storage config
    ├── popup.html            # Configuration menu interface layout
    ├── popup.js              # State sync logic tracking UI changes to chrome.storage
    ├── content/
    │   ├── host.js           # DOM monitor script matching geoduels.io
    │   └── streetview.js     # WebGL proxy injection script running inside maps frames
    └── icons/
        ├── icon16.png
        ├── icon48.png
        └── icon128.png 
## 🐛 Known Issues & Bugs 
1. Intermittent Black Dotted Lines Artifacting

There is a current known visual issue where black dotted lines appear across the map viewport when the user's mouse cursor travels into specific, seemingly random positions on the Street View canvas.
## 💻 Local Installation Guide 
For development or testing purposes, you can load this extension unpacked directly into your local browser instance:

  Download or clone this repository to your local machine.

  Open Google Chrome and navigate to chrome://extensions/.

  Toggle the Developer mode switch in the top right-hand corner to enabled.

  Click the Load unpacked button visible in the top left-hand menu.

  Select the root directory folder containing the manifest.json file.

  Navigate to https://geoduels.io or http://localhost:3000 to begin testing.
## 🛑 Maintenance Notice 
[!NOTE]
Project Status: The original author is no longer actively maintaining this extension. If you are a developer looking to take over the project, feel free to fork the repository, resolve open items, or submit improvements via Pull Requests.
### Notes for Future Maintainers 
* Google occasionally modifies the endpoints or domain configurations of asset servers handling labels. If labels suddenly begin appearing in updates, check content/streetview.js and add the updated network resource path criteria to isLabelSource().
* Ensure tight permissions are kept in manifest.json so the injection remains limited exclusively to the game and mapping domains.
# 📄 License 
This project is open-source under the MIT License. Feel free to modify, copy, and distribute it as needed.
