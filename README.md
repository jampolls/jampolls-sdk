# 🎯 Jampolls SDK

![Jampolls SDK](https://img.shields.io/badge/Jampolls-SDK-orange?style=for-the-badge)
![Version](https://img.shields.io/npm/v/@jampolls/sdk?style=for-the-badge)
![License](https://img.shields.io/npm/l/@jampolls/sdk?style=for-the-badge)

The official JavaScript SDK for embedding interactive Jampolls on any website. Create engaging polls that blend seamlessly with your site's design.

## ✨ Features

- 🚀 **Easy Integration** - One script tag, one line of JavaScript
- 🎨 **Auto-Theming** - Automatically adapts to your site's theme
- 📱 **Responsive Design** - Works perfectly on mobile and desktop
- ⚡ **Fast Loading** - Optimized for performance
- 🔒 **Secure** - Built-in CORS protection and secure voting
- 🌐 **Cross-Origin** - Works on any domain
- 📊 **Real-time Results** - Live vote updates
- ♿ **Accessible** - Full keyboard navigation and screen reader support

## 🚀 Quick Start

### CDN Installation (Recommended)

Add this script tag to your HTML:

```html
<script src="https://cdn.jampolls.com/jampolls.min.js"></script>
```

### NPM Installation

```bash
npm install @jampolls/sdk
```

```javascript
import JamPolls from '@jampolls/sdk';
```

## 📖 Basic Usage

### 1. Get Your Embed Key

1. Sign up at [jampolls.com](https://jampolls.com)
2. Create a poll
3. Go to your dashboard → Widgets
4. Copy your embed key

### 2. Add the Widget Container

```html
<div id="my-poll"></div>
```

### 3. Initialize the Poll

```html
<script>
  JamPolls.embed('your-embed-key', 'my-poll');
</script>
```

That's it! Your poll will appear automatically.

## 🎨 Advanced Usage

### Custom Configuration

```javascript
JamPolls.embed('your-embed-key', 'my-poll', {
  theme: 'dark',           // 'auto', 'light', 'dark', 'jampolls'
  showResults: true,       // Show results after voting
  showBranding: false,     // Hide "Powered by Jampolls"
  autoHeight: true,        // Automatically adjust height
  onLoad: (data) => {
    console.log('Poll loaded:', data);
  },
  onVote: (result) => {
    console.log('Vote cast:', result);
  },
  onError: (error) => {
    console.error('Poll error:', error);
  }
});
```

### Auto-Embed with Data Attributes

For even easier integration, use data attributes:

```html
<!-- This poll will auto-initialize when the page loads -->
<div data-jampolls-embed="your-embed-key"
     data-theme="dark"
     data-show-results="true"
     data-auto-height="true">
</div>
```

### Multiple Polls

```javascript
// Poll 1
JamPolls.embed('poll-1-key', 'container-1', {
  theme: 'light'
});

// Poll 2  
JamPolls.embed('poll-2-key', 'container-2', {
  theme: 'dark'
});
```

### Dynamic Poll Switching

```javascript
// Get widget instance
const widget = JamPolls.getWidget('my-poll');

// Switch to different poll
widget.switchPoll('new-embed-key');

// Refresh current poll
widget.refresh();

// Remove widget
JamPolls.removeWidget('my-poll');
```

## ⚙️ Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `theme` | String | `'auto'` | Theme: `'auto'`, `'light'`, `'dark'`, `'jampolls'` |
| `showResults` | Boolean | `true` | Show vote results after voting |
| `showBranding` | Boolean | `true` | Show "Powered by Jampolls" link |
| `autoHeight` | Boolean | `true` | Automatically adjust widget height |
| `onLoad` | Function | `null` | Callback when poll loads successfully |
| `onVote` | Function | `null` | Callback when a vote is cast |
| `onError` | Function | `null` | Callback when an error occurs |

## 🎨 Theming

### Auto Theme Detection
The SDK automatically detects your site's color scheme:

```javascript
JamPolls.embed('key', 'container', {
  theme: 'auto'  // Detects light/dark automatically
});
```

### Custom CSS
Override styles with CSS custom properties:

```css
.jampolls-widget {
  --jp-primary: #your-brand-color;
  --jp-bg: #your-background;
  --jp-text: #your-text-color;
  --jp-radius: 16px;
}
```

### Available Themes

- **`auto`** - Automatically detects light/dark mode
- **`light`** - Light theme with clean whites and grays
- **`dark`** - Dark theme perfect for dark websites
- **`jampolls`** - Branded theme with Jampolls colors

## 📱 Responsive Design

The SDK is fully responsive and works great on:

- 📱 Mobile devices (iOS, Android)
- 💻 Desktop browsers
- 📱 Tablets
- 🖥️ Large screens

## 🔒 Security & Privacy

- ✅ **CORS Protection** - Domain-based access control
- ✅ **Secure Voting** - Prevents vote manipulation
- ✅ **Privacy-First** - No unnecessary data collection
- ✅ **Fingerprint-Based** - Anonymous but unique voter identification

## 🌐 Browser Support

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+
- ❌ Internet Explorer (not supported)

## 📊 Analytics & Events

Track poll interactions with event callbacks:

```javascript
JamPolls.embed('key', 'container', {
  onLoad: (pollData) => {
    // Poll loaded successfully
    analytics.track('poll_loaded', {
      pollId: pollData.poll_data.id,
      question: pollData.poll_data.question
    });
  },
  
  onVote: (result) => {
    // Vote was cast
    analytics.track('poll_voted', {
      action: result.action,  // 'added' or 'removed'
      pollId: result.poll_id
    });
  },
  
  onError: (error) => {
    // Handle errors gracefully
    console.error('Poll error:', error);
  }
});
```

## 🔧 API Reference

### JamPolls.embed(embedKey, containerId, options)

Creates a new poll widget.

**Parameters:**
- `embedKey` (String) - Your poll's embed key from Jampolls dashboard
- `containerId` (String) - ID of the HTML element to contain the poll
- `options` (Object) - Configuration options (optional)

**Returns:** Widget instance

### JamPolls.getWidget(containerId)

Gets an existing widget instance.

**Parameters:**
- `containerId` (String) - Container ID

**Returns:** Widget instance or undefined

### JamPolls.removeWidget(containerId)

Removes a widget and cleans up resources.

**Parameters:**
- `containerId` (String) - Container ID

### JamPolls.autoEmbed()

Automatically initializes all polls with `data-jampolls-embed` attributes.

## 🏗️ Building from Source

```bash
# Clone the repository
git clone https://github.com/jampolls/sdk.git
cd sdk

# Install dependencies
npm install

# Build for development
npm run build:dev

# Build for production
npm run build:prod

# Serve examples locally
npm run serve
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md).

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 💬 Support

- 📧 Email: support@jampolls.com
- 💬 Discord: [Join our community](https://discord.gg/jampolls)
- 📖 Documentation: [jampolls.com/sdk](https://jampolls.com/sdk)
- 🐛 Issues: [GitHub Issues](https://github.com/jampollsclub/jampolls-sdk/issues)

## 🚀 What's Next?

- [ ] React component wrapper
- [ ] Vue.js plugin
- [ ] WordPress plugin
- [ ] Advanced analytics dashboard
- [ ] Custom poll templates
- [ ] A/B testing features

---

<div align="center">
  <p>Made with ❤️ by the <a href="https://jampolls.com">Jampolls</a> team</p>
  <p>
    <a href="https://jampolls.com">Website</a> •
    <a href="https://jampolls.com/sdk">Docs</a> •
    <a href="https://github.com/jampollsclub/jampolls-sdk">GitHub</a> •
    <a href="https://twitter.com/jampolls">Twitter</a>
  </p>
</div>
