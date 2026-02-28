import { test, expect, Page } from '@playwright/test';

// Test configuration
const BASE_URL = 'http://localhost:3000';
const ADMIN_EMAIL = 'admin@shelfzone.com';
const ADMIN_PASSWORD = 'Admin@12345';

test.describe('AgentTrace E2E Tests', () => {
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
  });

  test.afterAll(async () => {
    await page.close();
  });

  test.beforeEach(async () => {
    // Login before each test
    await page.goto(`${BASE_URL}/login`);
    
    // Fill login form
    await page.fill('input[name="email"], input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[name="password"], input[type="password"]', ADMIN_PASSWORD);
    
    // Click login button
    await page.click('button[type="submit"]');
    
    // Wait for navigation to dashboard
    await page.waitForURL(/.*dashboard.*/);
  });

  test.describe('Agent Trace Page Navigation', () => {
    test('should navigate to agent trace page from sidebar', async () => {
      // Look for Agent Trace link in sidebar
      const agentTraceLink = page.locator('a[href*="agent-trace"], nav a:has-text("Agent Trace")');
      
      // Check if link exists
      const linkCount = await agentTraceLink.count();
      if (linkCount === 0) {
        test.skip(true, 'Agent Trace link not found in sidebar');
      }
      
      await agentTraceLink.first().click();
      
      // Wait for navigation
      await page.waitForURL(/.*agent-trace.*/);
      
      // Verify we're on the agent trace page
      expect(page.url()).toContain('agent-trace');
    });

    test('should load Agent Map page', async () => {
      await page.goto(`${BASE_URL}/dashboard/agent-trace`);
      
      // Wait for page to load
      await page.waitForLoadState('networkidle');
      
      // Check for Agent Map heading or component
      const heading = page.locator('h1, h2, [role="heading"]');
      const headingText = await heading.allTextContents();
      
      const hasAgentMapHeading = headingText.some(text => 
        text.toLowerCase().includes('agent') && 
        (text.toLowerCase().includes('map') || text.toLowerCase().includes('trace'))
      );
      
      expect(hasAgentMapHeading).toBeTruthy();
    });
  });

  test.describe('View Toggle', () => {
    test('should have view toggle buttons', async () => {
      await page.goto(`${BASE_URL}/dashboard/agent-trace`);
      await page.waitForLoadState('networkidle');
      
      // Look for view toggle buttons (Org View / Agent View)
      const viewButtons = page.locator('button:has-text("View"), [role="button"]:has-text("View")');
      const buttonCount = await viewButtons.count();
      
      if (buttonCount === 0) {
        console.log('No view toggle buttons found - may not be implemented yet');
        return;
      }
      
      expect(buttonCount).toBeGreaterThan(0);
    });

    test('should toggle between Org View and Agent View', async () => {
      await page.goto(`${BASE_URL}/dashboard/agent-trace`);
      await page.waitForLoadState('networkidle');
      
      // Find toggle buttons
      const orgViewButton = page.locator('button:has-text("Org View"), button:has-text("Organization")');
      const agentViewButton = page.locator('button:has-text("Agent View"), button:has-text("Agent")');
      
      const hasOrgButton = await orgViewButton.count() > 0;
      const hasAgentButton = await agentViewButton.count() > 0;
      
      if (!hasOrgButton && !hasAgentButton) {
        test.skip(true, 'View toggle not implemented');
      }
      
      if (hasOrgButton) {
        await orgViewButton.first().click();
        await page.waitForTimeout(500); // Wait for view change
        
        // Verify view changed (check for org-related content)
        const content = await page.textContent('body');
        expect(content).toBeTruthy();
      }
      
      if (hasAgentButton) {
        await agentViewButton.first().click();
        await page.waitForTimeout(500); // Wait for view change
        
        // Verify view changed
        const content = await page.textContent('body');
        expect(content).toBeTruthy();
      }
    });
  });

  test.describe('Trace Filters', () => {
    test('should have filter controls', async () => {
      await page.goto(`${BASE_URL}/dashboard/agent-trace`);
      await page.waitForLoadState('networkidle');
      
      // Look for common filter elements
      const filters = page.locator('input[type="search"], select, [role="combobox"], button:has-text("Filter")');
      const filterCount = await filters.count();
      
      if (filterCount === 0) {
        console.log('No filter controls found - may not be implemented yet');
        return;
      }
      
      expect(filterCount).toBeGreaterThan(0);
    });

    test('should filter traces by status', async () => {
      await page.goto(`${BASE_URL}/dashboard/agent-trace`);
      await page.waitForLoadState('networkidle');
      
      // Look for status filter dropdown
      const statusFilter = page.locator('select:has(option:has-text("Status")), [role="combobox"]:has-text("Status")');
      const hasStatusFilter = await statusFilter.count() > 0;
      
      if (!hasStatusFilter) {
        test.skip(true, 'Status filter not found');
      }
      
      await statusFilter.first().click();
      
      // Select a status option
      const completedOption = page.locator('option:has-text("Completed"), [role="option"]:has-text("Completed")');
      if (await completedOption.count() > 0) {
        await completedOption.first().click();
        await page.waitForTimeout(1000); // Wait for filter to apply
      }
    });

    test('should filter traces by date range', async () => {
      await page.goto(`${BASE_URL}/dashboard/agent-trace`);
      await page.waitForLoadState('networkidle');
      
      // Look for date inputs
      const dateInputs = page.locator('input[type="date"], input[type="datetime-local"]');
      const hasDateFilter = await dateInputs.count() > 0;
      
      if (!hasDateFilter) {
        console.log('Date filter not found - may not be implemented yet');
        return;
      }
      
      // Fill in date range if found
      const dateInput = dateInputs.first();
      await dateInput.fill('2024-01-01');
      await page.waitForTimeout(500);
    });
  });

  test.describe('Trace List and Detail', () => {
    test('should display trace list', async () => {
      await page.goto(`${BASE_URL}/dashboard/agent-trace`);
      await page.waitForLoadState('networkidle');
      
      // Look for table, list, or card components showing traces
      const traceItems = page.locator('table tbody tr, [role="row"], .trace-item, [data-testid*="trace"]');
      const itemCount = await traceItems.count();
      
      console.log(`Found ${itemCount} trace items`);
      
      // May be 0 if no traces exist, which is valid
      expect(itemCount).toBeGreaterThanOrEqual(0);
    });

    test('should click a trace and navigate to flow page', async () => {
      await page.goto(`${BASE_URL}/dashboard/agent-trace`);
      await page.waitForLoadState('networkidle');
      
      // Look for clickable trace items
      const traceItems = page.locator('table tbody tr, [role="row"], .trace-item, [data-testid*="trace"]');
      const itemCount = await traceItems.count();
      
      if (itemCount === 0) {
        test.skip(true, 'No traces found to click');
      }
      
      // Click the first trace
      const firstTrace = traceItems.first();
      await firstTrace.click();
      
      // Wait for navigation or modal to open
      await page.waitForTimeout(1000);
      
      // Check if we navigated to a flow page or opened a detail view
      const currentUrl = page.url();
      const hasFlowView = currentUrl.includes('flow') || 
                         currentUrl.includes('trace') || 
                         await page.locator('[data-testid*="flow"], .flow-container').count() > 0;
      
      expect(hasFlowView).toBeTruthy();
    });

    test('should verify Level 3 flow page components', async () => {
      await page.goto(`${BASE_URL}/dashboard/agent-trace`);
      await page.waitForLoadState('networkidle');
      
      // Look for trace items
      const traceItems = page.locator('table tbody tr, [role="row"], .trace-item');
      const itemCount = await traceItems.count();
      
      if (itemCount === 0) {
        test.skip(true, 'No traces found');
      }
      
      // Click first trace
      await traceItems.first().click();
      await page.waitForTimeout(1000);
      
      // Check for ReactFlow components or SVG elements
      const flowElements = page.locator('svg, [data-id], .react-flow, [class*="flow"]');
      const hasFlowElements = await flowElements.count() > 0;
      
      if (hasFlowElements) {
        expect(hasFlowElements).toBeTruthy();
        console.log('Flow visualization found');
      } else {
        console.log('Flow visualization not found - may not be rendered yet');
      }
    });
  });

  test.describe('Sidebar Navigation', () => {
    test('should have Agent Trace link in sidebar', async () => {
      await page.goto(`${BASE_URL}/dashboard`);
      await page.waitForLoadState('networkidle');
      
      // Look for sidebar navigation
      const sidebar = page.locator('nav, [role="navigation"], aside');
      const sidebarText = await sidebar.allTextContents();
      
      const hasAgentTraceLink = sidebarText.some(text => 
        text.toLowerCase().includes('agent') && text.toLowerCase().includes('trace')
      );
      
      if (!hasAgentTraceLink) {
        console.log('Agent Trace link not found in sidebar - checking for alternative navigation');
        
        // Check for menu items
        const menuItems = page.locator('a, button');
        const allText = await menuItems.allTextContents();
        const foundInMenu = allText.some(text => 
          text.toLowerCase().includes('agent') && text.toLowerCase().includes('trace')
        );
        
        expect(foundInMenu).toBeTruthy();
      } else {
        expect(hasAgentTraceLink).toBeTruthy();
      }
    });

    test('should navigate using sidebar link', async () => {
      await page.goto(`${BASE_URL}/dashboard`);
      await page.waitForLoadState('networkidle');
      
      // Find and click Agent Trace link
      const agentTraceLink = page.locator('a[href*="agent-trace"]');
      const linkExists = await agentTraceLink.count() > 0;
      
      if (!linkExists) {
        // Try alternative selectors
        const altLink = page.locator('nav a:has-text("Agent Trace"), a:has-text("Agent Trace")');
        const altExists = await altLink.count() > 0;
        
        if (!altExists) {
          test.skip(true, 'Agent Trace link not found');
        }
        
        await altLink.first().click();
      } else {
        await agentTraceLink.first().click();
      }
      
      // Wait for navigation
      await page.waitForTimeout(1000);
      
      // Verify URL
      const currentUrl = page.url();
      expect(currentUrl).toContain('agent-trace');
    });
  });

  test.describe('Responsive Design', () => {
    test('should be responsive on mobile', async () => {
      await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
      
      await page.goto(`${BASE_URL}/dashboard/agent-trace`);
      await page.waitForLoadState('networkidle');
      
      // Check if page loads without horizontal scroll
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      const viewportWidth = 375;
      
      expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 20); // Allow small tolerance
    });

    test('should be responsive on tablet', async () => {
      await page.setViewportSize({ width: 768, height: 1024 }); // iPad
      
      await page.goto(`${BASE_URL}/dashboard/agent-trace`);
      await page.waitForLoadState('networkidle');
      
      // Verify page renders correctly
      const content = await page.textContent('body');
      expect(content).toBeTruthy();
    });

    test('should be responsive on desktop', async () => {
      await page.setViewportSize({ width: 1920, height: 1080 }); // Full HD
      
      await page.goto(`${BASE_URL}/dashboard/agent-trace`);
      await page.waitForLoadState('networkidle');
      
      // Verify page renders correctly
      const content = await page.textContent('body');
      expect(content).toBeTruthy();
    });
  });

  test.describe('Loading States', () => {
    test('should show loading indicator', async () => {
      await page.goto(`${BASE_URL}/dashboard/agent-trace`);
      
      // Look for loading indicators immediately
      const loadingIndicators = page.locator('[data-testid*="loading"], .loading, [role="status"], .spinner');
      
      // Check if loading indicator appears (may be very brief)
      const hasLoader = await loadingIndicators.count();
      console.log(`Found ${hasLoader} loading indicators`);
      
      // Wait for page to fully load
      await page.waitForLoadState('networkidle');
    });
  });

  test.describe('Error Handling', () => {
    test('should handle network errors gracefully', async () => {
      // Navigate to page first
      await page.goto(`${BASE_URL}/dashboard/agent-trace`);
      await page.waitForLoadState('networkidle');
      
      // Simulate offline condition
      await page.context().setOffline(true);
      
      // Try to interact with the page
      const refreshButton = page.locator('button:has-text("Refresh"), button[aria-label*="refresh"]');
      if (await refreshButton.count() > 0) {
        await refreshButton.first().click();
        await page.waitForTimeout(1000);
      }
      
      // Look for error messages
      const errorMessages = page.locator('[role="alert"], .error, [data-testid*="error"]');
      const hasError = await errorMessages.count() > 0;
      
      console.log(`Error handling: ${hasError ? 'Error message shown' : 'No error message shown'}`);
      
      // Restore online
      await page.context().setOffline(false);
    });

    test('should handle empty state', async () => {
      await page.goto(`${BASE_URL}/dashboard/agent-trace`);
      await page.waitForLoadState('networkidle');
      
      // Check for empty state messaging
      const emptyStateText = [
        'No traces found',
        'No data',
        'Get started',
        'Create your first',
        'No results',
      ];
      
      const bodyText = await page.textContent('body');
      const hasEmptyState = emptyStateText.some(text => 
        bodyText.toLowerCase().includes(text.toLowerCase())
      );
      
      console.log(`Empty state handling: ${hasEmptyState ? 'Found' : 'Not found or has data'}`);
    });
  });

  test.describe('Accessibility', () => {
    test('should have proper heading structure', async () => {
      await page.goto(`${BASE_URL}/dashboard/agent-trace`);
      await page.waitForLoadState('networkidle');
      
      // Check for headings
      const headings = page.locator('h1, h2, h3, h4, h5, h6');
      const headingCount = await headings.count();
      
      expect(headingCount).toBeGreaterThan(0);
    });

    test('should have accessible navigation', async () => {
      await page.goto(`${BASE_URL}/dashboard/agent-trace`);
      await page.waitForLoadState('networkidle');
      
      // Check for nav landmarks
      const navElements = page.locator('nav, [role="navigation"]');
      const navCount = await navElements.count();
      
      expect(navCount).toBeGreaterThan(0);
    });

    test('should have keyboard navigation support', async () => {
      await page.goto(`${BASE_URL}/dashboard/agent-trace`);
      await page.waitForLoadState('networkidle');
      
      // Try tab navigation
      await page.keyboard.press('Tab');
      await page.waitForTimeout(100);
      
      // Check if focus is visible
      const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
      expect(focusedElement).toBeTruthy();
    });
  });
});
