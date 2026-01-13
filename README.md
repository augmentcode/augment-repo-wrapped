# 🎁 Repo Wrapped

**Your GitHub repository's year in review** - Spotify Wrapped style!

Generate beautiful, shareable story slides showcasing your repository's achievements, contributors, and activity throughout the year.

Built by [Augment Code](https://augmentcode.com) with Next.js 15, TypeScript, and Tailwind CSS.

---

## ✨ Features

- 📊 **Comprehensive Stats** - Commits, PRs, reviews, issues, and code changes
- 👥 **Contributor Leaderboard** - Top contributors with commit counts
- 📈 **Activity Insights** - Busiest days, months, and contribution patterns
- 🎨 **Beautiful Slides** - Instagram-story style presentation
- 📥 **Shareable** - Download high-quality PNG images
- 🔒 **Secure** - OAuth authentication with read-only access
- ⚡ **Fast** - Server-side caching for instant re-loads
- 🌓 **Dark/Light Mode** - Matches your preference

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- A GitHub account
- GitHub OAuth App credentials ([create one here](https://github.com/settings/developers))

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/augmentcode/augment-repo-wrapped.git
   cd augment-repo-wrapped
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   ```

4. **Configure `.env.local`:**
   - Create a GitHub OAuth App at https://github.com/settings/developers
   - Set callback URL to: `http://localhost:3000/api/auth/callback/github`
   - Copy Client ID and Client Secret to `.env.local`
   - Generate a secret: `openssl rand -base64 32`
   - Update `NEXTAUTH_SECRET` in `.env.local`

5. **Run the development server:**
   ```bash
   npm run dev
   ```

6. **Open [http://localhost:3000](http://localhost:3000)** in your browser

---

## 📦 Deployment

Deploy to Vercel in minutes! See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/augmentcode/augment-repo-wrapped)

**Quick steps:**
1. Create a production GitHub OAuth App
2. Deploy to Vercel
3. Add environment variables in Vercel dashboard
4. Update OAuth callback URL to your Vercel URL

---

## 🛠️ Tech Stack

- **Framework:** [Next.js 15](https://nextjs.org) (App Router)
- **Language:** [TypeScript](https://www.typescriptlang.org)
- **Styling:** [Tailwind CSS](https://tailwindcss.com)
- **UI Components:** [shadcn/ui](https://ui.shadcn.com)
- **Authentication:** [NextAuth.js](https://next-auth.js.org)
- **GitHub API:** [Octokit](https://github.com/octokit/octokit.js)
- **Deployment:** [Vercel](https://vercel.com)

---

## 📖 How It Works

1. **Authenticate** - Sign in with GitHub OAuth or Personal Access Token
2. **Select Repository** - Choose any public repository you have access to
3. **Generate Wrapped** - We fetch stats from GitHub's API (cached for 5 minutes)
4. **View & Share** - Browse beautiful slides and download as PNG

### What We Fetch:

- Repository metadata and languages
- Commit activity and contributor stats
- Pull requests with reviews and comments
- Issues and community metrics
- Code frequency and change patterns

### Privacy & Permissions:

- **Scope:** `public_repo read:org` (minimum required for Statistics API)
- **Read-only:** We never write, update, or delete anything
- **No storage:** Your data is never stored on our servers
- **Cached:** Results cached for 5 minutes for performance

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📄 License

MIT License - see [LICENSE](./LICENSE) for details.

---

## 🙏 Acknowledgments

- Inspired by [Spotify Wrapped](https://www.spotify.com/wrapped/)
- Built with ❤️ by [Augment Code](https://augmentcode.com)

---

## 📞 Support

- **Issues:** [GitHub Issues](https://github.com/augmentcode/augment-repo-wrapped/issues)
- **Discussions:** [GitHub Discussions](https://github.com/augmentcode/augment-repo-wrapped/discussions)
- **Website:** [augmentcode.com](https://augmentcode.com)
