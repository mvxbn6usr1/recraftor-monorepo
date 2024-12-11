# Recraft Dashboard

A powerful web application for AI image generation, vectorization, and management with an intuitive user interface.

## Features

### Image Generation
- Generate images using state-of-the-art AI models
- Custom style presets for consistent results
- Real-time progress tracking
- Adjustable parameters for fine-tuned control
- Persistent settings across sessions

### Image Management
- Modern gallery interface with image previews
- Download functionality for generated images
- Image metadata viewing and management
- Prompt and settings reuse functionality
- Efficient image storage using IndexedDB

### Image Processing
- Image vectorization capabilities
- Custom style application
- Batch processing support
- Progress tracking for all operations

### User Interface
- Clean, modern design with dark mode
- Responsive layout
- Intuitive sidebar navigation
- Modal-based image viewing and actions
- Smooth animations and transitions

## Technology Stack

- **Frontend Framework**: React with TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: 
  - Radix UI for accessible components
  - Lucide React for icons
  - Shadcn/ui for styled components
- **State Management**: React Context API
- **Storage**: IndexedDB for image data
- **Build Tool**: Vite
- **Package Manager**: npm

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm (v7 or higher)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/recraft-dashboard.git
cd recraft-dashboard
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Building for Production

To create a production build:
```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
recraft-dashboard/
├── src/
│   ├── components/         # React components
│   │   ├── ui/            # Reusable UI components
│   │   └── sidebars/      # Sidebar components
│   ├── lib/               # Utility functions and services
│   ├── styles/            # Global styles
│   ├── App.tsx           # Main application component
│   └── main.tsx          # Application entry point
├── public/               # Static assets
├── index.html           # HTML template
├── tailwind.config.js   # Tailwind configuration
├── tsconfig.json        # TypeScript configuration
└── vite.config.ts       # Vite configuration
```

## Key Components

### Image Storage
The application uses IndexedDB for efficient image storage, handling both binary data and metadata. This enables fast retrieval and persistent storage of generated images.

### Style Management
Custom styles are managed through a dedicated system that allows for:
- Preset style selection
- Custom style parameters
- Style persistence across sessions

### User Interface
The UI is built with accessibility and user experience in mind:
- Responsive design that works across different screen sizes
- Keyboard navigation support
- Clear visual feedback for actions
- Consistent styling throughout the application

## Development Guidelines

### Code Style
- Use TypeScript for type safety
- Follow React best practices and hooks guidelines
- Maintain consistent component structure
- Use meaningful variable and function names
- Include appropriate error handling

### State Management
- Use React Context for global state
- Implement proper loading states
- Handle errors gracefully
- Maintain consistent state updates

### Performance Considerations
- Optimize image loading and processing
- Implement proper caching strategies
- Use lazy loading where appropriate
- Monitor and optimize bundle size

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with [React](https://reactjs.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- UI Components from [Radix UI](https://www.radix-ui.com/)
- Icons from [Lucide](https://lucide.dev/)
- Component styling from [shadcn/ui](https://ui.shadcn.com/)