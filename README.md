# CTV Simulator - UK Smart TV Ad Tech Testing

A comprehensive web-based Connected TV (CTV) simulator designed for UK-based Smart TV ad tech testing and debugging. This tool mimics the behavior of a UK Smart TV app for testing VAST tags, OpenRTB endpoints, and ad monetization workflows.

## 🚀 Features

### Core CTV Simulation
- **Realistic CTV Environment**: Mimics Samsung Tizen, LG WebOS, Android TV, and Roku devices
- **UK Geo-targeting**: Pre-configured with UK IP addresses and geolocation data
- **Smart TV User Agents**: Authentic user agent strings for major CTV platforms
- **Video Player**: HTML5 video player with ad breakpoint triggers

### Ad Request Testing
- **VAST Tag Support**: Test VAST 2.0/3.0/4.0 ad tags with real-time validation
- **OpenRTB Integration**: Full OpenRTB 2.5 request generation with UK-specific parameters
- **SSP Endpoint Presets**: Pre-configured endpoints for major SSPs (Magnite, Xandr, FreeWheel, etc.)
- **Custom Endpoints**: Support for custom VAST and OpenRTB endpoints

### Developer Tools
- **Network Logger**: Real-time logging of ad requests and responses (similar to Chrome DevTools)
- **Request/Response Inspector**: Detailed view of headers, payloads, and response data
- **VAST Parser**: Automatic parsing and validation of VAST responses
- **Error Detection**: Automatic flagging of empty responses, timeouts, and malformed data

### UK-Specific Features
- **GDPR Compliance**: Built-in GDPR consent management with TCF string support
- **UK IP Simulation**: Multiple UK IP addresses for different regions
- **Geo Parameters**: Accurate UK geolocation data (London, Manchester, Birmingham, Edinburgh)
- **Currency Support**: GBP currency settings for bid requests

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS with custom CTV theme
- **Video Player**: Video.js with ad support
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Date Handling**: date-fns

## 📦 Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd ctv-simulator
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser**:
   Navigate to `http://localhost:3000`

## 🎯 Usage

### Basic Setup

1. **Configure Device Settings**:
   - Select your target CTV platform (Samsung Tizen, LG WebOS, etc.)
   - Choose device type (Connected TV is default)

2. **Set Geo Parameters**:
   - Select a UK IP address from presets
   - Configure country, region, and coordinates
   - Default: London, UK (51.5074, -0.1278)

3. **Configure Ad Endpoints**:
   - Choose from SSP presets or enter custom URLs
   - Support for both VAST tags and OpenRTB endpoints
   - GDPR consent settings with TCF string support

### Testing Workflow

1. **Start Video Playback**: Click play to trigger pre-roll ad requests
2. **Monitor Network Activity**: View real-time ad requests in the right panel
3. **Inspect Responses**: Click on any request to view detailed information
4. **Debug Issues**: Use the console logs to identify and troubleshoot problems

### Ad Request Triggers

- **Pre-roll**: Triggered when video starts playing
- **Mid-roll**: Triggered at 30-second mark (configurable)
- **Manual Testing**: Use configuration panel to test different scenarios

## 🔧 Configuration Options

### Device Configuration
```typescript
{
  userAgent: "Mozilla/5.0 (SMART-TV; LINUX; Tizen 6.0)...",
  deviceType: 3, // Connected TV
  make: "Samsung",
  model: "Smart TV",
  os: "Tizen",
  osv: "6.0"
}
```

### Geo Configuration
```typescript
{
  country: "GB",
  region: "England",
  city: "London",
  lat: 51.5074,
  lon: -0.1278,
  ip: "91.245.227.10"
}
```

### OpenRTB Request Structure
The simulator generates comprehensive OpenRTB 2.5 requests with:
- Video impression parameters (1920x1080, various protocols)
- UK-specific geo data
- CTV device information
- GDPR compliance parameters
- Realistic bid floor and currency settings

## 🧪 Testing Scenarios

### Common Use Cases
1. **VAST Tag Validation**: Test VAST XML parsing and creative loading
2. **OpenRTB Bid Requests**: Validate bid request structure and SSP responses
3. **Geo-targeting**: Test UK-specific targeting parameters
4. **GDPR Compliance**: Verify consent string handling
5. **Error Handling**: Test timeout scenarios and malformed responses

### SSP Integration Testing
- **Magnite (Rubicon)**: OpenRTB endpoint testing
- **Xandr (AppNexus)**: Bid request validation
- **FreeWheel**: VAST tag integration
- **Google Ad Manager**: DFP tag testing
- **SpotX**: Video ad serving

## 🐛 Debugging Features

### Network Inspector
- Request/response timing
- HTTP status codes
- Header inspection
- Payload validation
- Response parsing

### Error Detection
- Empty VAST responses (204 status)
- Request timeouts (>5 seconds)
- Malformed XML/JSON responses
- Missing required OpenRTB fields
- GDPR compliance issues

### Console Logging
- Real-time event logging
- Filterable log levels (info, warning, error, success)
- Timestamped entries
- Request correlation

## 🔒 Privacy & Compliance

### GDPR Support
- Toggle GDPR consent on/off
- Custom TCF consent string input
- Automatic `regs.ext.gdpr` parameter inclusion
- UK-specific privacy regulations

### Data Handling
- All testing data stays in browser memory
- No external data transmission except to configured endpoints
- Clear logs and requests functionality
- No persistent storage of sensitive data

## 🚀 Development

### Project Structure
```
src/
├── components/          # React components
│   ├── VideoPlayer.tsx  # Video.js integration
│   ├── ConfigPanel.tsx  # Configuration UI
│   └── LogPanel.tsx     # Network logs and inspector
├── store/              # Zustand state management
│   └── useStore.ts     # Global app state
├── types/              # TypeScript definitions
│   └── index.ts        # Interface definitions
├── utils/              # Utility functions
│   └── adRequests.ts   # Ad request generation and parsing
└── App.tsx             # Main application component
```

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Support

For issues, questions, or contributions:
- Create an issue on GitHub
- Submit a pull request
- Contact the development team

## 🔮 Roadmap

### Upcoming Features
- [ ] SSAI (Server-Side Ad Insertion) simulation
- [ ] Header bidding wrapper testing
- [ ] Advanced VAST creative validation
- [ ] Multi-currency bid request support
- [ ] Custom device profile creation
- [ ] Automated testing scenarios
- [ ] Performance metrics dashboard
- [ ] Export/import configuration profiles

---

**Built for UK CTV ad monetization debugging and testing** 🇬🇧📺 