# HireSwift

<div align="center">
  <h1><b>HireSwift</b></h1>
</div>

# 📗 Table of Contents

- [📖 About HireSwift](#about-project)
- [🛠 Technologies Used](#technologies-used)
- [📁 Project Structure](#project-structure)
- [🚀 Live Demo](#live-demo)
- [💻 Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [✨ Features](#features)
- [🔧 Development](#development)
  - [Available Scripts](#available-scripts)
  - [Code Style](#code-style)
  - [Styling](#styling)
- [🔐 Authentication](#authentication)
- [🏗 Building for Production](#building-for-production)
- [🤝 Contributing](#contributing)
- [📝 License](#license)

HireSwift is a modern web application that connects talents with hiring managers, streamlining the job search and hiring process.

## Technologies Used

- React 18
- Vite
- Tailwind CSS
- Supabase (Backend as a Service)

## Project Structure

```
hireswift/
├── src/
│   ├── components/    # Reusable components
│   ├── constants/     # Application constants
│   ├── pages/         # Page components
│   ├── styles/        # Global styles
│   ├── supab/         # Supabase configuration
│   ├── App.jsx        # Main application component
│   ├── App.css        # Application styles
│   └── main.jsx       # Application entry point
├── public/            # Public assets
├── index.html         # HTML entry point
├── tailwind.config.js # Tailwind configuration
├── postcss.config.js  # PostCSS configuration
├── eslint.config.js   # ESLint configuration
└── package.json       # Project dependencies
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm (v8 or higher)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/christianib003/hireswift.git
cd hireswift
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with your Supabase credentials:
```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Start the development server:
```bash
npm run dev
```

## Features

- User authentication with Supabase
- Role-based access control
- Job posting and application system
- Responsive design with Tailwind CSS

## Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Code Style

The project uses ESLint for code linting. Configuration can be found in `eslint.config.js`.

### Styling

- Tailwind CSS is used for styling
- Global styles are in `src/styles`
- Component-specific styles are co-located with components
- Configuration in `tailwind.config.js`

## Authentication

Authentication is handled through Supabase, configured in `src/supab/`. Features include:
- Email/Password Registration
- Email/Password Login
- Protected Routes

## Building for Production

1. Create a production build:
```bash
npm run build
```

2. The build output will be in the `dist` directory

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## 🚀 Live Demo <a name="live-demo"></a>

- [Live Demo Link](https://hireswift.netlify.app/)
- [Video Walkthrough](https://youtu.be/e8HyKVWX2qE)

Credentials for different roles:
- Admin:
  - Email: admin.auto@yopmail.com
  - Password: pass123
- Hiring Manager:
  - Email: bravo.auto@yopmail.com
  - Password: pass123
- Talent:
  - Email: alpha.auto@yopmail.com
  - Password: pass123
