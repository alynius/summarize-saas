# DigestAI Feature Roadmap

Future features and enhancements for DigestAI.

---

## Input Types

### Completed
- [x] URL summarization (articles, blogs, docs)
- [x] Text summarization (pasted text)

### In Progress
- [ ] **YouTube Videos** - See `FEATURE_YOUTUBE.md` for detailed spec

### Planned

#### High Priority
- [ ] **PDF Upload** - Upload PDF documents, extract text, summarize
- [ ] **Multiple URLs** - Batch summarize 5-10 URLs at once
- [ ] **Twitter/X Threads** - Paste thread URL, summarize full thread

#### Medium Priority
- [ ] **Reddit Posts** - Summarize post + top comments
- [ ] **GitHub PRs/Issues** - Summarize code changes and discussions
- [ ] **Image OCR** - Extract text from screenshots/images, then summarize

#### Lower Priority
- [ ] **Audio/Podcasts** - Upload MP3/WAV, transcribe with Whisper, summarize
- [ ] **Meeting Recordings** - Transcribe and summarize meetings
- [ ] **RSS Feeds** - Auto-summarize new articles from feeds
- [ ] **Email Newsletters** - Forward emails to summarize

---

## Output Enhancements

### Planned

#### High Priority
- [ ] **Key Takeaways** - Extract 3-5 main bullet points
- [ ] **Action Items** - Extract tasks/to-dos from content
- [ ] **Multiple Formats** - Bullet points, paragraphs, structured outline

#### Medium Priority
- [ ] **Q&A Generation** - Generate study questions from content
- [ ] **Flashcards** - Create Anki-style flashcard export
- [ ] **Translation + Summary** - Summarize and translate to another language

#### Lower Priority
- [ ] **Compare Sources** - Side-by-side summary of 2+ articles on same topic
- [ ] **Timeline Extraction** - Extract chronological events
- [ ] **Entity Extraction** - List people, companies, dates mentioned

---

## Workflow Features

### Planned

#### High Priority
- [ ] **Collections/Folders** - Organize summaries into collections
- [ ] **Tags & Search** - Tag summaries, full-text search
- [ ] **Chrome Extension** - One-click summarize current page

#### Medium Priority
- [ ] **Share Links** - Public shareable summary URLs
- [ ] **API Access** - Developer API for integrations (Pro feature)
- [ ] **Export Options** - Export to Markdown, PDF, Notion

#### Lower Priority
- [ ] **Daily Digest** - Scheduled auto-summarization of feeds
- [ ] **Team Workspaces** - Shared collections for teams
- [ ] **Integrations** - Zapier, Notion, Slack, Obsidian

---

## Platform Expansion

### Planned
- [ ] **Mobile App** - Native iOS and Android apps
- [ ] **Browser Extension** - Chrome, Firefox, Safari
- [ ] **Desktop App** - Electron app for offline use
- [ ] **Slack Bot** - Summarize links shared in Slack
- [ ] **Discord Bot** - Summarize links in Discord channels

---

## AI Enhancements

### Planned
- [ ] **Confidence Scores** - Show AI confidence level on summaries
- [ ] **Source Citations** - Link summary points back to source text
- [ ] **Tone Selection** - Formal, casual, technical, simple
- [ ] **Custom Prompts** - Let users customize summarization style
- [ ] **Multi-model Comparison** - Run same content through multiple models

---

## Monetization Features

### Planned
- [ ] **Stripe Integration** - Payment processing for Pro tier
- [ ] **Usage-based Billing** - Pay per summary beyond free tier
- [ ] **BYOK (Bring Your Own Key)** - Use own API keys for unlimited access
- [ ] **Enterprise SSO** - SAML/OIDC for enterprise customers
- [ ] **Team Billing** - Centralized billing for teams

---

## Priority Legend

| Priority | Description |
|----------|-------------|
| **High** | Next up after current work, high user demand |
| **Medium** | Important but not urgent, nice to have |
| **Lower** | Future consideration, requires more infrastructure |

---

## Version History

| Date | Changes |
|------|---------|
| Jan 2026 | Initial roadmap created |

---

## Notes

- Priorities may shift based on user feedback
- Each major feature should get its own `FEATURE_*.md` spec before implementation
- Design plan updates in `DESIGN_PLAN.md` may be needed for UI features
