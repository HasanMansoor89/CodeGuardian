# SecureCode AI (Code Guardian)


**SecureCode AI** is a professional, AI-powered security review tool designed for modern developers. It uses advanced language models (Google Gemini) to analyze your source code for security vulnerabilities, providing line-by-line explanations and remediation suggestions.

## 🚀 Features

- **AI-Powered Security Analysis**: Leverages Google's Gemini models to detect complex security vulnerabilities that static analysis tools might miss.
- **Comprehensive Vulnerability Detection**:
  Identifies:
  - 🔑 Hardcoded Secrets & API Keys
  - 💉 SQL Injection & XSS
  - 🔓 Authentication & Authorization Flaws
  - 🛡️ Create Input Validation Issues
  - And more...
- **Multi-Input Support**:
  - 📋 **Paste Code**: Quick analysis for snippets.
  - 📂 **File Upload**: Drag & drop support for multiple files.
  - 🐙 **GitHub Integration**: Fetch and scan public repositories or specific folders directly.
- **Interactive Reports**:
  - Filter vulnerabilities by severity (Critical, High, Medium, Low).
  - Detailed line-by-line code breakdown.
  - Export reports for documentation.
- **Privacy Focused**: Your API keys are stored locally in your browser and are never sent to our servers.

## 🛠️ Tech Stack

- **Frontend**: [React](https://react.dev/) + [Vite](https://vitejs.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [Shadcn UI](https://ui.shadcn.com/)
- **AI Engine**: [Google Generative AI SDK](https://www.npmjs.com/package/@google/generative-ai)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Routing**: [React Router](https://reactrouter.com/)
- **State Management**: React Hooks + Context

## 🏁 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn or bun
- A valid [Google Gemini API Key](https://aistudio.google.com/app/apikey)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/HasanMansoor89/CodeGuardian
   cd code-guardian
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   bun install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open the application**
   Navigate to `http://localhost:8080` (or the port shown in your terminal).

5. **Run Tests**
   To execute the test suite:
   ```bash
   npm run test
   ```

## 📖 Usage

1. **Configure API Keys**:
   - Click the **Settings** (gear icon) in the top right corner.
   - Enter your **Google Gemini API Key**.
   - (Optional) Enter a **GitHub Token** to increase rate limits when scanning repositories.

2. **Analyze Code**:
   - **Paste**: Copy and paste code snippets directly into the editor.
   - **Upload**: Drag and drop source files (.js, .ts, .py, .go, etc.).
   - **GitHub**: Paste a GitHub repository URL (e.g., `https://github.com/username/repo`).

3. **Review Results**:
   - View the **Security Summary** dashboard.
   - Expand individual issues to see detailed **Remediation Steps**.
   - Use the **Explanation Level** toggle to switch between Beginner and Expert explanations.

## 🛡️ Supported Languages

SecureCode AI supports analysis for a wide range of programming languages including:
- JavaScript / TypeScript (`.js`, `.ts`, `.jsx`, `.tsx`)
- Python (`.py`)
- Java (`.java`)
- Go (`.go`)
- PHP (`.php`)
- Ruby (`.rb`)
- C / C++ (`.c`, `.cpp`, `.h`)
- C# (`.cs`)
- Rust (`.rs`)
- Swift (`.swift`)
- SQL (`.sql`)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## � Authors

- **Hasan Mansoor**
- **Syed Danish Khurram**
- **Muhammad Farasat Azeemi**

## 🙏 Acknowledgements

- Built with [Shadcn UI](https://ui.shadcn.com/) components.
- Powered by [Google Gemini](https://deepmind.google/technologies/gemini/).






