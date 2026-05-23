import type { Sidebar, SidebarItem } from 'vocs'

// Main sidebar configuration
const sidebarConfig: SidebarItem[] = [
  {
    text: 'Introduction',
    link: '/',
  },
  {
    text: 'Getting Started',
    items: [
      {
        text: 'Environment Setup',
        link: '/getting-started/setup',
      },
      {
        text: 'Quick Start',
        link: '/getting-started/quickstart',
      },
      {
        text: 'Basics',
        collapsed: true,
        items: [
          {
            text: 'Models',
            link: '/getting-started/basics/models',
          },
          {
            text: 'Systems',
            link: '/getting-started/basics/systems',
          },
          {
            text: 'World',
            link: '/getting-started/basics/world',
          },
          {
            text: 'Store',
            link: '/getting-started/basics/store',
          },
          {
            text: 'Events',
            link: '/getting-started/basics/events',
          },
          {
            text: 'Testing',
            items: [
              {
                text: 'Unit Testing',
                link: '/getting-started/basics/testing/unit',
              },
              {
                text: 'Integration Testing',
                link: '/getting-started/basics/testing/integration',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    text: 'Guides',
    collapsed: true,
    items: [
      {
        text: 'React Integration',
        collapsed: true,
        items: [
          {
            text: 'Overview',
            link: '/guides/react/overview',
          },
          {
            text: 'Setup',
            link: '/guides/react/setup',
          },
          {
            text: 'Hooks & State',
            link: '/guides/react/hooks',
          },
          {
            text: 'Components',
            link: '/guides/react/components',
          },
          {
            text: 'Torii Client Integration',
            link: '/deployment/torii/client-integration',
          },
        ],
      },
      {
        text: 'Unity Integration',
        link: '/guides/unity',
      },
      {
        text: 'AI Agents',
        items: [
          {
            text: 'Daydreams',
            link: '/guides/ai/daydreams',
          },
          {
            text: 'Eliza',
            link: '/guides/ai/eliza',
          },
        ],
      },
    ],
  },
  {
    text: 'Deployment',
    collapsed: true,
    items: [
      {
        text: 'Local Development',
        link: '/deployment/local',
      },
      {
        text: 'Testnet (Sepolia)',
        link: '/deployment/sepolia',
      },
      {
        text: 'Mainnet',
        link: '/deployment/mainnet',
      },
      {
        text: 'Slot',
        link: '/deployment/slot',
      },
      {
        text: 'Torii Integration',
        items: [
          {
            text: 'Client Integration',
            link: '/deployment/torii/client-integration',
          },
          {
            text: 'Guides',
            items: [
              {
                text: 'Setup & Configuration',
                link: '/deployment/torii/guides/setup',
              },
              {
                text: 'GraphQL Queries',
                link: '/deployment/torii/guides/graphql-queries',
              },
              {
                text: 'Custom Hooks',
                link: '/deployment/torii/guides/custom-hooks',
              },
              {
                text: 'Data Conversion',
                link: '/deployment/torii/guides/data-conversion',
              },
              {
                text: 'Error Handling',
                link: '/deployment/torii/guides/error-handling',
              },
              {
                text: 'Performance',
                link: '/deployment/torii/guides/performance',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    text: 'Examples',
    collapsed: true,
    items: [
      {
        text: 'Starter Templates',
        items: [
          {
            text: 'React Starter',
            link: '/examples/starters/react',
          },
          {
            text: 'Bevy Starter',
            link: '/examples/starters/bevy',
          },
        ],
      },
      {
        text: 'Production Games',
        items: [
          {
            text: 'Simple Game',
            link: '/examples/games/simple',
          },
          {
            text: 'Advanced Game',
            link: '/examples/games/advanced',
          },
        ],
      },
    ],
  },
  {
    text: 'Advanced',
    collapsed: true,
    items: [
      {
        text: 'Gas Optimization',
        link: '/advanced/gas-optimization',
      },
      {
        text: 'Smart Contracts vs Dojo',
        link: '/advanced/contracts-comparison',
      },
      {
        text: 'Best Practices',
        link: '/advanced/best-practices',
      },
      {
        text: 'Performance',
        link: '/advanced/performance',
      },
    ],
  },
  {
    text: 'Reference',
    collapsed: true,
    items: [
      {
        text: 'API Reference',
        link: '/reference/api',
      },
      {
        text: 'CLI Commands',
        link: '/reference/cli',
      },
      {
        text: 'Configuration',
        link: '/reference/config',
      },
      {
        text: 'MDX Components',
        link: '/reference/mdx-components',
      },
      {
        text: 'Troubleshooting',
        link: '/reference/troubleshooting',
      },
    ],
  },
]

/**
 * Gets all top-level routes from the sidebar config
 */
const getTopLevelRoutes = (sidebar: SidebarItem[]): Array<[string, string]> =>
  sidebar
    .filter((item) => item.text !== 'Introduction') // Skip Introduction
    .map((item) => {
      // Convert the text to a URL-friendly format and get the first link if available
      const path = item.link || `/${item.text.toLowerCase().replace(/\s+/g, '-')}`
      return [path.split('/')[1], item.text] as [string, string]
    })

/**
 * Recursively modifies the sidebar structure to control which sections are collapsed
 */
const sidebarFocusOn = (
  sidebar: SidebarItem[],
  target: string,
  closeOther: boolean = false,
): SidebarItem[] =>
  sidebar.map((item) =>
    item.items && item.items.length > 0
      ? {
          ...item,
          collapsed: item.text === target ? false : closeOther ? true : item.collapsed,
          items: sidebarFocusOn(item.items, target, closeOther),
        }
      : {
          ...item,
          collapsed: item.text === target ? false : closeOther ? true : item.collapsed,
        },
  )

/**
 * Generates a complete sidebar configuration with automatic route-based collapsing
 */
const generateSidebarConfig = (sidebar: SidebarItem[]): Sidebar => {
  // Initialize with the default route
  const config: Sidebar = {
    '/': sidebar,
  }

  // Configure for all top-level routes
  getTopLevelRoutes(sidebar).forEach(([route, sectionName]) => {
    config[`/${route}`] = sidebarFocusOn(sidebar, sectionName, false)
  })

  return config
}

// Export the generated sidebar configuration
export const sidebar = generateSidebarConfig(sidebarConfig)

// Export individual pieces for potential customization
export { sidebarConfig, getTopLevelRoutes, sidebarFocusOn, generateSidebarConfig }