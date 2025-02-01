# CraftVile Police RP Website

A modern, responsive website for the CraftVile Police Roleplay Garry's Mod server.

## Features

- Modern, responsive design
- Dark/Light theme support
- Steam authentication
- Forum system
- Store with Stripe integration
- Staff application system
- FAQ section
- Mobile-friendly navigation

## Technologies Used

- HTML5
- CSS3 (with modern features and optimizations)
- JavaScript (ES6+)
- Node.js
- MongoDB
- Stripe API
- Steam API

## Local Development

1. Clone the repository:
```bash
git clone https://github.com/yourusername/craftvile-police-rp.git
```

2. Install dependencies:
```bash
cd craftvile-police-rp
npm install
```

3. Create a `.env` file in the root directory with your configuration:
```env
STEAM_API_KEY=your_steam_api_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
MONGODB_URI=your_mongodb_uri
```

4. Start the development server:
```bash
npm start
```

The site will be available at `http://localhost:3000`

## Building for Production

1. Build the project:
```bash
npm run build
```

2. The optimized files will be in the `dist` directory.

## Deployment to GitHub Pages

1. Update the `homepage` field in `package.json` with your GitHub Pages URL:
```json
{
  "homepage": "https://yourusername.github.io/craftvile-police-rp"
}
```

2. Deploy to GitHub Pages:
```bash
npm run deploy
```

## Project Structure

```
craftvile-police-rp/
├── public/
│   ├── assets/       # Images and SVG files
│   ├── css/         # Stylesheets
│   ├── js/          # JavaScript files
│   └── index.html   # Main HTML file
├── dist/            # Production build
├── package.json
└── README.md
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

For any questions or concerns, please contact us through:
- Discord: [Your Discord Server]
- Steam: [Your Steam Group]
- Email: [Your Email] 