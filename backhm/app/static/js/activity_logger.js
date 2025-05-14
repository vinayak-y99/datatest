/**
 * Activity Logger - Frontend Module
 * 
 * This module provides functions to log user activities from the frontend
 * such as button clicks, page views, and other interactions.
 */

class ActivityLogger {
  constructor(apiEndpoint = '/activity-logs/frontend-action') {
    this.apiEndpoint = apiEndpoint;
    this.queue = [];
    this.isProcessing = false;
    this.retryCount = 0;
    this.maxRetries = 3;
    this.pendingLogs = this.loadPendingLogs();

    // Process any pending logs from previous sessions
    if (this.pendingLogs && this.pendingLogs.length > 0) {
      console.log(`Found ${this.pendingLogs.length} pending activity logs. Processing...`);
      this.processPendingLogs();
    }

    // Set up event listeners for common user interactions
    this.setupCommonEventListeners();
    
    // Process logs before the page unloads
    window.addEventListener('beforeunload', () => {
      this.savePendingLogs();
    });
  }

  /**
   * Log a user action
   * 
   * @param {string} action - The action performed (e.g., 'click', 'view', 'submit')
   * @param {string} resource - The resource being interacted with (e.g., 'job_description', 'resume')
   * @param {object} details - Additional details about the action
   * @returns {Promise} - Promise resolved when the log is sent
   */
  logAction(action, resource, details = {}) {
    const logData = {
      action,
      resource,
      details: {
        ...details,
        url: window.location.href,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent
      }
    };

    // Add to queue and process
    this.queue.push(logData);
    this.processQueue();
    
    return Promise.resolve();
  }

  /**
   * Process the queue of logs
   */
  async processQueue() {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;
    
    try {
      const item = this.queue.shift();
      await this.sendLog(item);
      this.retryCount = 0;
    } catch (error) {
      console.error('Error logging activity:', error);
      
      // Add failed item to pending logs
      this.pendingLogs.push(this.queue.shift());
      this.savePendingLogs();
      
      this.retryCount++;
      if (this.retryCount < this.maxRetries) {
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 1000 * this.retryCount));
      }
    } finally {
      this.isProcessing = false;
      
      // Process next item if queue is not empty
      if (this.queue.length > 0) {
        this.processQueue();
      }
    }
  }

  /**
   * Send a log to the server
   * 
   * @param {object} logData - The log data to send
   * @returns {Promise} - Promise resolved when the log is sent
   */
  async sendLog(logData) {
    const response = await fetch(this.apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getToken()}`
      },
      body: JSON.stringify(logData)
    });

    if (!response.ok) {
      throw new Error(`Failed to log activity: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get the authentication token
   * 
   * @returns {string} - The authentication token
   */
  getToken() {
    // Get token from localStorage or wherever it's stored
    return localStorage.getItem('authToken') || '';
  }

  /**
   * Load pending logs from localStorage
   * 
   * @returns {Array} - Array of pending logs
   */
  loadPendingLogs() {
    try {
      const logs = localStorage.getItem('pendingActivityLogs');
      return logs ? JSON.parse(logs) : [];
    } catch (error) {
      console.error('Error loading pending logs:', error);
      return [];
    }
  }

  /**
   * Save pending logs to localStorage
   */
  savePendingLogs() {
    try {
      // Combine queue and pendingLogs
      const allLogs = [...this.pendingLogs, ...this.queue];
      if (allLogs.length > 0) {
        localStorage.setItem('pendingActivityLogs', JSON.stringify(allLogs));
      } else {
        localStorage.removeItem('pendingActivityLogs');
      }
    } catch (error) {
      console.error('Error saving pending logs:', error);
    }
  }

  /**
   * Process any pending logs from previous sessions
   */
  async processPendingLogs() {
    const logs = [...this.pendingLogs];
    this.pendingLogs = [];
    
    for (const log of logs) {
      try {
        await this.sendLog(log);
      } catch (error) {
        console.error('Error processing pending log:', error);
        this.pendingLogs.push(log);
      }
    }
    
    this.savePendingLogs();
  }

  /**
   * Set up event listeners for common user interactions
   */
  setupCommonEventListeners() {
    // Log button clicks
    document.addEventListener('click', (event) => {
      // Target is a button, input[type=button], or has role=button
      if (
        event.target.tagName === 'BUTTON' ||
        (event.target.tagName === 'INPUT' && event.target.type === 'button') ||
        event.target.getAttribute('role') === 'button'
      ) {
        const buttonText = event.target.innerText || event.target.value || 'Unknown';
        const buttonId = event.target.id || 'Unknown';
        
        this.logAction('button_click', 'ui', {
          button_id: buttonId,
          button_text: buttonText,
          button_class: event.target.className,
          page_section: this.getPageSection(event.target)
        });
      }
    });

    // Log form submissions
    document.addEventListener('submit', (event) => {
      const formId = event.target.id || 'Unknown';
      const formAction = event.target.action || 'Unknown';
      
      this.logAction('form_submit', 'ui', {
        form_id: formId,
        form_action: formAction
      });
    });

    // Log page navigation
    window.addEventListener('popstate', () => {
      this.logAction('page_navigation', 'ui', {
        navigation_type: 'back_forward',
        to_url: window.location.href
      });
    });

    // Log page load
    window.addEventListener('load', () => {
      this.logAction('page_view', 'ui', {
        page_title: document.title,
        referrer: document.referrer
      });
    });
  }

  /**
   * Get the section of the page an element is in
   * 
   * @param {HTMLElement} element - The element to check
   * @returns {string} - The section name
   */
  getPageSection(element) {
    // Walk up the DOM to find a section identifier
    let current = element;
    while (current && current !== document.body) {
      // Check for common section identifiers
      const id = current.id;
      const dataSection = current.getAttribute('data-section');
      const role = current.getAttribute('role');
      
      if (id) return id;
      if (dataSection) return dataSection;
      if (role === 'main' || role === 'navigation' || role === 'banner') return role;
      
      // Check for header tags
      if (['HEADER', 'FOOTER', 'NAV', 'MAIN', 'SECTION', 'ASIDE'].includes(current.tagName)) {
        return current.tagName.toLowerCase();
      }
      
      current = current.parentElement;
    }
    
    return 'unknown';
  }

  /**
   * Manually log a page view (for SPA navigation)
   * 
   * @param {string} pageTitle - The title of the page
   * @param {string} pageUrl - The URL of the page (optional)
   */
  logPageView(pageTitle, pageUrl = window.location.href) {
    this.logAction('page_view', 'ui', {
      page_title: pageTitle,
      page_url: pageUrl,
      referrer: document.referrer
    });
  }

  /**
   * Log a custom event
   * 
   * @param {string} eventName - The name of the event
   * @param {object} eventData - Additional event data
   */
  logCustomEvent(eventName, eventData = {}) {
    this.logAction('custom_event', 'ui', {
      event_name: eventName,
      ...eventData
    });
  }
}

// Create singleton instance
const activityLogger = new ActivityLogger();

export default activityLogger; 