#!/bin/bash

# Build the site
npm run build

# Deploy to Netlify
netlify deploy --prod 