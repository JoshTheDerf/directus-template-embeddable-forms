# Embeddable Forms Template

A Directus template for creating public, embeddable forms for any collection with prefill support, iframe communication, and auto-resize capabilities. Perfect for contact forms, newsletter signups, event registrations, job applications, and more.

## Overview

This template provides a complete implementation of embeddable forms for Directus, allowing you to transform any collection into a public submission form that can be embedded on external websites. The template includes pre-configured collections for common use cases, fully configured permissions, demo pages with working examples, and comprehensive documentation.

All forms automatically support Directus interfaces, conditions, validation rules, and respect your access policies and permissions. Forms also inherit Directus theming for consistent branding across your applications.

## Why We Built This

I've repeatedly wanted to embed a Directus item form into various projects and websites. Directus comes out of the box with a ton of powerful form elements and a clear path to add new ones. This would've saved me a ton of time when building my wedding RSVP form, as well as for several work projects. It seems ridiculous to install massive component frameworks and figure out how to integrate them with my website when all I need them for is small forms. 

This template and extension make it possible to add complex forms to any website, including simple static ones.

It also showcases how flexible Directus is as a platform for extending. If you stray off the beaten path, both the frontend and backend can be pretty heavily extended and reworked.

## Features

- **Embed any Directus item form**: Add a form submission for any Directus collection to any website
- **Pre-Built Collections**: 9 ready-to-use form collections for common scenarios
- **Smart Permissions**: Pre-configured public access policies for secure form submissions
- **Live Demos**: Interactive HTML demos showing real-world implementations
- **Prefill Support**: Pre-populate fields via query parameters or postMessage API
- **Iframe Communication**: Bidirectional messaging for parent-child coordination
- **Auto-Resize**: Support for automatically resizing forms when embedded
- **Validation & Conditions**: Full support for Directus validation rules and conditional fields
- **Custom Interfaces**: Works with custom Directus field interfaces

## Installation

Install this template using the Directus template CLI:

```bash
npx directus-template-cli@latest apply [INSERT CONNECTION PARAMETERS HERE] ./directus/template
```

The template will install:
- Pre-configured collections with sample data
- Embeddable forms extension
- Directus-serve extension for demo pages
- Public role permissions
- Demo HTML pages and assets

After installation, restart your Directus instance.

## What's Included

### Collections

The template includes 9 pre-configured collections ready for form submissions:

1. **Contact Requests** - Customer contact forms with priority and category support
2. **Newsletter Signups** - Email subscription forms with interests and preferences
3. **Lead Captures** - Marketing lead forms with UTM tracking and lead scoring
4. **Event Registrations** - Event signup forms with dietary requirements and ticket types
5. **Job Applications** - Career application forms with resume and cover letter uploads
6. **Support Tickets** - Customer support request forms with priority and categories
7. **Quote Requests** - Business quote and proposal request forms
8. **Survey Responses** - Customer satisfaction survey forms with ratings
9. **Article Comments** - Blog comment forms with markdown support

Each collection includes several sample entries

### Demo Pages

9 working demo pages showing different use cases and ways of integration:
- Contact form with field validation
- Newsletter signup with interests
- Lead capture with UTM tracking
- Event registration with prefill
- Job application with file uploads
- Support ticket with priority
- Quote request form
- Survey form with ratings
- Article comment form

Access demos at: `https://your-directus-url/dirserve/index.html`

### Permissions

Pre-configured Public role permissions for:
- Creating items in all form collections
- Blocked read access to submitted data (for security)
- File upload permissions for job applications
- System collection read access for schema fetching

## Usage

### Basic Form Embedding

Embed any form collection on your website using an iframe:

```html
<iframe
  src="https://your-directus-url/admin/forms/contact_requests"
  style="width: 100%; border: none;"
  id="contact-form">
</iframe>
```

### Prefilling Form Data

#### Method 1: Query Parameters

Pre-populate fields using URL parameters:

```html
<!-- Bracket notation -->
<iframe src="https://your-directus-url/admin/forms/newsletter_signups?prefill[email]=user@example.com&prefill[source]=homepage"></iframe>

<!-- Dot notation -->
<iframe src="https://your-directus-url/admin/forms/lead_captures?prefill.email=user@example.com&prefill.utm_source=google"></iframe>
```

#### Method 2: PostMessage API

Dynamically send data to forms after they load:

```javascript
const iframe = document.getElementById('my-form');

// Wait for form ready event
window.addEventListener('message', (event) => {
  if (event.origin !== 'https://your-directus-url') return;

  if (event.data.type === 'directus-form-ready') {
    // Send prefill data
    iframe.contentWindow.postMessage({
      type: 'directus-form-prefill',
      data: {
        email: 'user@example.com',
        first_name: 'John',
        last_name: 'Doe',
        utm_campaign: 'spring_2024'
      }
    }, 'https://your-directus-url');
  }
});
```

### Auto-Resize Implementation

Automatically adjust iframe height as form content changes:

```javascript
window.addEventListener('message', (event) => {
  if (event.origin !== 'https://your-directus-url') return;

  if (event.data.type === 'directus-form-resize') {
    const iframe = document.getElementById('my-form');
    iframe.style.height = event.data.data.height + 'px';
  }
});
```

### Handling Form Submissions

React to form submissions in the parent page:

```javascript
window.addEventListener('message', (event) => {
  if (event.origin !== 'https://your-directus-url') return;

  switch (event.data.type) {
    case 'directus-form-submitted':
      // Show thank you message
      console.log('Form submitted:', event.data.data);
      window.location.href = '/thank-you';
      break;

    case 'directus-form-error':
      // Handle submission error
      console.error('Form error:', event.data.data.error);
      alert('There was an error submitting your form. Please try again.');
      break;
  }
});
```

See the included demo pages for complete working examples.

## Permissions Configuration

The template includes pre-configured permissions for the built-in collections, but you'll need to create new permission sets for new forms.

### Recommended Permission Setup

For each form collection in the Public role:

1. **Create Permission**: All Fields
2. **Read Permission**: Selected fields only, with a filter that prevents actually reading anything submitted:
   ```json
   {
     "_and": [
       { "id": { "_null": true } }
     ]
   }
   ```

This allows form schema access while preventing data exposure.

### System Collections

Public role needs read access to:
- `directus_collections` - All Fields
- `directus_fields` - All Fields
- `directus_relations` - All Fields

### File Uploads

For forms with file uploads (e.g., job applications), grant:
- `directus_files` - Create permission with selected fields and folder restrictions as needed

## Development Story

This template was built almost entirely using Directus MCP and Claude Code, demonstrating the power of AI-assisted development with Directus.

### Tools Used

**Directus MCP**: Model Context Protocol integration provided by Directus for programmatic access to:
- Collection and field management
- Permission and policy configuration
- Content creation and management
- Schema exploration and relationships

**Claude Code**: AI coding assistant used for:
- Extension scaffolding and development
- Building and testing form functionality
- Generating demo pages from schema
- Writing documentation
- Creating iframe integration examples

**Custom MCP Extension**: A custom permissions MCP was developed to:
- Generate permission configurations
- Test access policies
- Validate security settings

**Directus Dirserve Extension**: Extension for hosting demo HTML files directly from directus_files

### Development Workflow

1. Used MCP to explore Directus schema and create collections
2. Claude Code generated the majority of the embeddable forms extension, I handled integration with the router for public access.
3. MCP created demo data for all collections
4. Claude auto-generated demo HTML pages from collection schemas
5. Claude with a custom permissions MCP tool configured and tested the public access role.
6. Directus-serve extension set up for demo hosting
7. Template packaging and documentation with MCP assistance

Other than routing integration, the entire template was built through natural language conversation with AI tools, showcasing how Directus MCP enables rapid development of new capabilities by combining code and database knowledge and manipulation.

## Demo

**Video Walkthrough**: [Watch on YouTube](https://www.youtube.com/watch?v=6DcpQy0i9vA)

**Live Demos**: After installing the template, access live demos at:
```
https://your-directus-url/dirserve/index.html
```

## Screenshots

Consider adding these screenshots to showcase the template:

1. **Admin Module Dashboard**: Overview tab showing all available forms with embed codes
2. **Form Preview**: Live preview of a contact form in the admin interface
3. **Embedded Form**: Screenshot of a form embedded on an external website
4. **Permission Configuration**: Public role permissions setup for forms
5. **Collection List**: View of all pre-configured form collections in Directus
6. **Demo Page**: Screenshot of the demo index page with navigation
7. **Prefill Example**: Form with fields pre-populated from query parameters
8. **Submission Success**: Success message after form submission
9. **Extension Guide**: Setup wizard showing step-by-step instructions

## Project Structure

```
directus-template-embeddable-forms/
├── directus/
│   ├── docker-compose.yaml         # Docker setup for local development
│   ├── .env.example                # Environment variables template
│   ├── extensions/
│   │   └── directus-extension-embeddable-forms/
│   │       ├── src/
│   │       │   ├── index.ts        # Extension entry point
│   │       │   ├── module.vue      # Admin module component
│   │       │   ├── routes/         # Admin UI routes
│   │       │   └── utils/          # Public route registration
│   │       └── package.json
│   └── template/
│       ├── collections.json        # Collection definitions
│       ├── fields.json             # Field configurations
│       ├── relations.json          # Relationship definitions
│       ├── permissions.json        # Public role permissions
│       ├── policies.json           # Access policies
│       ├── roles.json              # Role definitions
│       ├── extensions.json         # Extension metadata
│       ├── files.json              # Demo file metadata
│       ├── folders.json            # File organization
│       ├── content/                # Sample data for collections
│       │   ├── contact_requests.json
│       │   ├── newsletter_signups.json
│       │   ├── lead_captures.json
│       │   ├── event_registrations.json
│       │   ├── job_applications.json
│       │   └── ...
│       └── assets/                 # Demo HTML files
│           ├── index.html
│           ├── contact.html
│           ├── newsletter.html
│           ├── lead.html
│           └── ...
├── screenshots/                    # Template screenshots
├── package.json                    # Template metadata
├── LICENSE
└── README.md
```

## Key Implementation Details

### Building with Directus MCP

I find Directus MCP to be a huge time saver when building non-trivial projects with Directus. Because the MCP allows creating and configuring tables in conjunction with writing code, MCP can configure test cases for debugging. It also saves a ton of time looking up collection and field names and matching them between code and database.

This project was almost entirely built with Directus MCP. Tables, Documentation, Demos, and code. The only part I manually intervened in was the integration with the admin app router. As a result, this didn't take nearly as much time as it would have built from scratch.


### Module Public Routes

The Directus admin app supports public-accessible routes, but modules are not able to register themselves as public routes.
To get around this, I pulled the internal Vue app instance (and vue router) from the #app DOM element, then hooked into the router directly.
This still caused redirects back to the /login page, so I intercepted all route transitions and force-redirected back to the form page when the original intended route was a form embedding page. It's hacky, but it works surprisingly well.

### Admin App Stores

The Directus admin app has a number of stores that are initialized after logging in by fetch data from various endpoints that expect authentication. Some of these stores are used by forms and interfaces. Because we never complete the login step, those stores never initialize. It's possibly to trigger hydration of some of those stores before our module code finishes mounting, but other stores require manually injecting data.

### Theming Issues

iframes only have a transparent background when the color-scheme meta/CSS property line up. I had to remove Directus' internal color scheme meta tag to allow iframes to have transparent backgrounds.

### Iframe Communication
Uses the postMessage API for secure cross-origin communication between form and parent page. All events include collection context for multi-form implementations. This is subject to all the configuration challenges iframe embedding and communication normally has.

## Future Improvements

Things I would have liked to get to if I had enough time...

- Support for file uploads. This requires populating the users and permissions stores in the Directus Admin app manually.
- Custom styling themes for forms
- More robust testing for various relational interfaces. I know M2O works, but that's all I've tested.

## License

MIT

## Acknowledgments

Built with:
- [Directus](https://directus.io) - Open-source data platform
- [Directus MCP](https://directus.io/mcp) - Model Context Protocol integration
- [Claude Code](https://claude.ai) - AI-powered development assistant
- [directus-serve](https://github.com/directus-labs/directus-serve) - File serving extension
