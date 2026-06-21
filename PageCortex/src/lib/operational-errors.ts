/**
 * Operational Error Formatting
 * 
 * Converts technical errors into user-friendly operational messages.
 * Never exposes: stack traces, SQL errors, provider secrets, internal IDs, raw API payloads.
 */

import { getAdminClient } from './supabase';
import { getIntegrationLimit } from './dodo';

export interface OperationalError {
  message: string;
  suggestion?: string;
  actionable: boolean;
  showInUI: boolean;
}

export type ErrorContext = 
  | 'integration_connection'
  | 'tool_execution'
  | 'api_call'
  | 'database'
  | 'authentication'
  | 'rate_limit'
  | 'usage_limit'
  | 'validation'
  | 'network'
  | 'unknown';

/**
 * Format any error into an operational message
 */
export function formatOperationalError(
  error: unknown,
  context: ErrorContext = 'unknown'
): OperationalError {
  const errorMessage = getErrorMessage(error);
  
  // Usage limit errors (highest priority)
  if (isUsageLimitError(errorMessage, error)) {
    return {
      message: "You've reached your plan's integration limit. Upgrade to add more connections.",
      suggestion: "Visit the billing page to explore higher-tier plans with unlimited integrations.",
      actionable: true,
      showInUI: true,
    };
  }

  // Rate limit errors
  if (isRateLimitError(errorMessage, error)) {
    return {
      message: "We're receiving too many requests right now. Please wait a moment and try again.",
      suggestion: "This helps us maintain service quality for all users.",
      actionable: false,
      showInUI: true,
    };
  }

  // Context-specific errors
  switch (context) {
    case 'integration_connection':
      return formatConnectionError(errorMessage);
    
    case 'tool_execution':
      return formatToolExecutionError(errorMessage);
    
    case 'api_call':
      return formatAPIError(errorMessage);
    
    case 'database':
      return formatDatabaseError(errorMessage);
    
    case 'authentication':
      return formatAuthError(errorMessage);
    
    case 'validation':
      return formatValidationError(errorMessage);
    
    case 'network':
      return formatNetworkError(errorMessage);
    
    default:
      return formatGenericError(errorMessage);
  }
}

/**
 * Format error for customer-facing chat widget
 */
export function formatCustomerError(error: unknown, toolName?: string): string {
  const errorMessage = getErrorMessage(error);
  
  if (isUsageLimitError(errorMessage, error)) {
    return "I'm temporarily unable to access live data. I can still answer questions based on the information I have.";
  }

  if (isRateLimitError(errorMessage, error)) {
    return "Our systems are experiencing high traffic right now. Let me try to help you with the information I have available.";
  }

  // Tool-specific customer messages
  if (toolName === 'getOrderStatus') {
    if (errorMessage.includes('timeout') || errorMessage.includes('ETIMEDOUT')) {
      return "The order system is responding slowly right now. Could you try again in a moment?";
    }
    if (errorMessage.includes('404') || errorMessage.includes('not found')) {
      return "I couldn't find that order in the system. Could you double-check the order number?";
    }
    return "I'm having trouble reaching the order system right now. This should be resolved shortly.";
  }

  if (toolName === 'trackShipment') {
    if (errorMessage.includes('timeout')) {
      return "The shipping provider is responding slowly right now. Please try again in a moment.";
    }
    return "I couldn't retrieve the latest shipping information. The tracking system may be temporarily unavailable.";
  }

  if (toolName === 'getProductAvailability') {
    return "I couldn't verify the current stock level. The inventory system may be updating.";
  }

  if (toolName === 'getShippingEstimate') {
    return "I couldn't calculate the delivery time right now. The shipping estimator may be temporarily unavailable.";
  }

  // Generic customer-facing message
  return "I'm having trouble accessing live data right now. I can still help answer general questions about our products and services.";
}

// ─── Helper Functions ────────────────────────────────────────

function getErrorMessage(error: unknown): string {
  if (typeof error === 'string') return error;
  if (error instanceof Error) return error.message;
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }
  return 'An unexpected error occurred';
}

function isUsageLimitError(message: string, error: unknown): boolean {
  const patterns = [
    /usage limit/i,
    /plan limit/i,
    /integration limit/i,
    /subscription limit/i,
    /quota exceeded/i,
  ];
  
  // Check error object for usage limit flags
  if (error && typeof error === 'object') {
    if ('code' in error && error.code === 'USAGE_LIMIT_EXCEEDED') return true;
    if ('type' in error && error.type === 'usage_limit') return true;
  }
  
  return patterns.some(p => p.test(message));
}

function isRateLimitError(message: string, error: unknown): boolean {
  const patterns = [
    /rate limit/i,
    /too many requests/i,
    /429/,
  ];
  
  if (error && typeof error === 'object' && 'status' in error) {
    if (error.status === 429) return true;
  }
  
  return patterns.some(p => p.test(message));
}

function formatConnectionError(message: string): OperationalError {
  // Timeout
  if (message.includes('timeout') || message.includes('ETIMEDOUT')) {
    return {
      message: "The connection timed out while contacting the provider.",
      suggestion: "This usually resolves itself. Check that your integration URL is correct and the service is online.",
      actionable: true,
      showInUI: true,
    };
  }

  // Authentication failures
  if (message.includes('401') || message.includes('unauthorized') || message.includes('invalid token')) {
    return {
      message: "The authentication credentials are invalid or expired.",
      suggestion: "Edit this integration and update your API credentials.",
      actionable: true,
      showInUI: true,
    };
  }

  // SSL/Certificate issues
  if (message.includes('certificate') || message.includes('SSL') || message.includes('CERT_')) {
    return {
      message: "There's a security certificate issue with the provider.",
      suggestion: "Ensure the integration URL uses HTTPS and has a valid SSL certificate.",
      actionable: true,
      showInUI: true,
    };
  }

  // Network errors
  if (message.includes('ENOTFOUND') || message.includes('ECONNREFUSED')) {
    return {
      message: "We couldn't reach the integration endpoint.",
      suggestion: "Check that the base URL is correct and the service is accessible from the internet.",
      actionable: true,
      showInUI: true,
    };
  }

  return {
    message: "We couldn't establish a connection to this integration.",
    suggestion: "Check your integration settings and try testing the connection again.",
    actionable: true,
    showInUI: true,
  };
}

function formatToolExecutionError(message: string): OperationalError {
  if (message.includes('blocked') || message.includes('not whitelisted')) {
    return {
      message: "This endpoint is not allowed by your integration permissions.",
      suggestion: "Add this endpoint to your integration's whitelist in the dashboard.",
      actionable: true,
      showInUI: true,
    };
  }

  if (message.includes('404')) {
    return {
      message: "The requested resource wasn't found.",
      suggestion: "The order, product, or shipment may not exist in the system.",
      actionable: false,
      showInUI: true,
    };
  }

  if (message.includes('500') || message.includes('internal server error')) {
    return {
      message: "The provider's system encountered an error.",
      suggestion: "This is temporary. The provider's engineering team has been notified.",
      actionable: false,
      showInUI: true,
    };
  }

  return {
    message: "We couldn't complete this operation right now.",
    suggestion: "The integration may be temporarily unavailable. Try again in a moment.",
    actionable: false,
    showInUI: true,
  };
}

function formatAPIError(message: string): OperationalError {
  if (message.includes('timeout')) {
    return {
      message: "The API request timed out.",
      suggestion: "The external service may be under heavy load. Try again in a moment.",
      actionable: false,
      showInUI: true,
    };
  }

  if (message.includes('401') || message.includes('403')) {
    return {
      message: "This integration needs attention in the dashboard.",
      suggestion: "The API credentials may have expired or been revoked.",
      actionable: true,
      showInUI: true,
    };
  }

  return {
    message: "The API call couldn't be completed.",
    suggestion: "This is usually temporary. Check the integration health in your dashboard.",
    actionable: true,
    showInUI: true,
  };
}

function formatDatabaseError(message: string): OperationalError {
  // Never expose SQL errors, table names, or query details
  return {
    message: "We encountered a temporary data issue.",
    suggestion: "Our team has been notified and is investigating.",
    actionable: false,
    showInUI: true,
  };
}

function formatAuthError(message: string): OperationalError {
  if (message.includes('expired')) {
    return {
      message: "Your session has expired.",
      suggestion: "Please sign in again to continue.",
      actionable: true,
      showInUI: true,
    };
  }

  return {
    message: "You need to be signed in to access this.",
    suggestion: "Please sign in and try again.",
    actionable: true,
    showInUI: true,
  };
}

function formatValidationError(message: string): OperationalError {
  // Clean up technical validation errors
  const cleanMessage = message
    .replace(/required/gi, 'is required')
    .replace(/invalid/gi, 'is invalid')
    .replace(/must be/gi, 'should be');

  return {
    message: cleanMessage,
    suggestion: "Please check your input and try again.",
    actionable: true,
    showInUI: true,
  };
}

function formatNetworkError(message: string): OperationalError {
  if (message.includes('offline') || message.includes('no internet')) {
    return {
      message: "You appear to be offline.",
      suggestion: "Check your internet connection and try again.",
      actionable: true,
      showInUI: true,
    };
  }

  return {
    message: "We're having trouble connecting right now.",
    suggestion: "This is usually temporary. Try again in a moment.",
    actionable: false,
    showInUI: true,
  };
}

function formatGenericError(message: string): OperationalError {
  // Sanitize technical jargon
  const sanitized = message
    .replace(/undefined|null/gi, 'missing data')
    .replace(/cannot read property/gi, 'missing information')
    .replace(/is not a function/gi, 'invalid operation')
    .replace(/unexpected token/gi, 'invalid data format')
    .replace(/JSON\.parse/gi, 'data parsing');

  // If message is still too technical, use generic fallback
  const isTechnical = /\b(TypeError|ReferenceError|SyntaxError|Error:)\b/i.test(sanitized);

  if (isTechnical) {
    return {
      message: "Something unexpected happened.",
      suggestion: "Our team has been notified. Please try again or contact support if this persists.",
      actionable: false,
      showInUI: true,
    };
  }

  return {
    message: sanitized,
    suggestion: "Please try again or contact support if this continues.",
    actionable: false,
    showInUI: true,
  };
}

/**
 * Check if user has exceeded their plan's integration limit
 */
export async function checkIntegrationLimit(
  userId: string,
  currentCount: number
): Promise<{ allowed: boolean; limit: number; plan: string; apiAccess: boolean }> {
  const admin = getAdminClient();
  const { data: profile } = await admin
    .from('profiles')
    .select('plan, api_access')
    .eq('id', userId)
    .single();

  const userPlan = profile?.plan || 'free';
  const apiAccess = profile?.api_access ?? false;
  const limit = getIntegrationLimit(userPlan);

  if (!apiAccess || limit === 0) {
    return { allowed: false, limit: 0, plan: userPlan, apiAccess };
  }

  const allowed = limit === -1 || currentCount < limit;
  return { allowed, limit: limit === -1 ? 999999 : limit, plan: userPlan, apiAccess };
}

/**
 * Create a usage limit error
 */
export function createUsageLimitError(plan: string, limit: number): Error {
  const error = new Error(`Your ${plan} plan includes ${limit} integration${limit === 1 ? '' : 's'}. Upgrade to add more.`);
  (error as any).code = 'USAGE_LIMIT_EXCEEDED';
  (error as any).type = 'usage_limit';
  return error;
}
