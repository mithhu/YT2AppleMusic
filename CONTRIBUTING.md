# Contributing to YT2AppleMusic

Thank you for your interest in contributing to YT2AppleMusic! This document provides guidelines for contributing to the project.

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Chrome browser for testing
- Basic knowledge of TypeScript/React

### Development Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/YT2AppleMusic.git
   cd YT2AppleMusic
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start development mode**

   ```bash
   npm run dev
   ```

4. **Load extension in Chrome**
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the `dist/` folder

## 🛠️ Development Guidelines

### Code Style

- **TypeScript**: Use strict typing, avoid `any`
- **React**: Functional components with hooks
- **Naming**: Use descriptive names, camelCase for variables
- **Comments**: Document complex logic and public APIs

### File Structure

```
src/
├── background/     # Background service worker
├── content/        # Content scripts
├── popup/          # React popup UI
├── utils/          # Shared utilities
├── types/          # TypeScript definitions
└── styles/         # CSS and styling
```

### Commit Messages

Use conventional commit format:

- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation updates
- `style:` Code style changes
- `refactor:` Code refactoring
- `test:` Test additions/updates

Example: `feat: add cache confirmation dialog`

## 🧪 Testing

### Manual Testing

1. **Build the extension**

   ```bash
   npm run build
   ```

2. **Test scenarios**

   - Official music videos (VEVO, artist channels)
   - Cover songs and unofficial uploads
   - Different title formats
   - Cache functionality
   - Settings persistence

3. **Cross-browser testing**
   - Chrome (primary)
   - Edge
   - Other Chromium browsers

### Code Quality

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Fix linting issues
npm run lint:fix
```

## 🎯 Areas for Contribution

### High Priority

1. **Music Detection Improvements**

   - Better artist/song extraction
   - Support for more title formats
   - Improved confidence scoring

2. **Platform Support**

   - Spotify integration
   - Other music services
   - Mobile browser support

3. **User Experience**
   - Better error messages
   - Improved settings UI
   - Accessibility improvements

### Medium Priority

1. **Performance Optimizations**

   - Faster detection algorithms
   - Reduced memory usage
   - Better caching strategies

2. **Features**
   - Playlist support
   - Bulk operations
   - Export/import settings

### Low Priority

1. **Developer Experience**
   - Automated testing
   - CI/CD pipeline
   - Better documentation

## 📝 Pull Request Process

### Before Submitting

1. **Test thoroughly**

   - Test on multiple YouTube videos
   - Verify no regressions
   - Check console for errors

2. **Code quality**

   - Run `npm run type-check`
   - Run `npm run lint`
   - Add comments for complex logic

3. **Documentation**
   - Update README if needed
   - Add/update code comments
   - Update CHANGELOG if applicable

### PR Guidelines

1. **Title**: Clear, descriptive title
2. **Description**: Explain what and why
3. **Testing**: Describe how you tested
4. **Screenshots**: Include for UI changes
5. **Breaking Changes**: Clearly mark any breaking changes

### Review Process

1. Automated checks must pass
2. At least one maintainer review
3. All feedback addressed
4. Final approval and merge

## 🐛 Bug Reports

### Before Reporting

1. **Search existing issues**
2. **Test with latest version**
3. **Reproduce consistently**

### Bug Report Template

```markdown
**Bug Description**
Clear description of the bug

**Steps to Reproduce**

1. Go to YouTube video: [URL]
2. Click extension icon
3. See error

**Expected Behavior**
What should happen

**Actual Behavior**
What actually happens

**Environment**

- Browser: Chrome 120.0.0.0
- Extension Version: 2.0.0
- OS: macOS 14.0

**Console Logs**
Any relevant console output
```

## 💡 Feature Requests

### Feature Request Template

```markdown
**Feature Description**
Clear description of the feature

**Use Case**
Why is this feature needed?

**Proposed Solution**
How should it work?

**Alternatives Considered**
Other approaches considered

**Additional Context**
Screenshots, mockups, etc.
```

## 🔒 Security

### Reporting Security Issues

**DO NOT** create public issues for security vulnerabilities.

Instead:

1. Email: [security@example.com]
2. Include detailed description
3. Include steps to reproduce
4. We'll respond within 48 hours

### Security Guidelines

- Never commit API keys or secrets
- Use minimal required permissions
- Validate all user inputs
- Follow Chrome extension security best practices

## 📄 Code of Conduct

### Our Standards

- **Respectful**: Be respectful to all contributors
- **Inclusive**: Welcome people of all backgrounds
- **Constructive**: Provide constructive feedback
- **Professional**: Maintain professional communication

### Unacceptable Behavior

- Harassment or discrimination
- Trolling or insulting comments
- Personal attacks
- Publishing private information

## 📞 Getting Help

### Community

- **GitHub Issues**: For bugs and feature requests
- **Discussions**: For questions and ideas
- **Discord**: [Link to Discord server]

### Maintainers

- **Primary Maintainer**: [@username]
- **Response Time**: Usually within 2-3 days
- **Availability**: Best response during weekdays

## 🎉 Recognition

Contributors will be:

- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Given credit in documentation

Thank you for contributing to YT2AppleMusic! 🎵✨

---

_Last Updated: December 19, 2024_
