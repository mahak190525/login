import { PublicClientApplication, LogLevel } from '@azure/msal-browser'

export const msalConfig = {
  auth: {
    clientId: 'b8cc1688-3739-44d1-9f87-5040dc3d2071',
    authority: 'https://login.microsoftonline.com/85707f27-830a-4b92-aa8c-3830bfb6c6f5/',
    redirectUri: window.location.origin + '/auth/callback',
    navigateToLoginRequestUrl: false,
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false,
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) return
        switch (level) {
          case LogLevel.Error:
            console.error('[MSAL Error]', message)
            return
          case LogLevel.Info:
            console.info('[MSAL Info]', message)
            return
          case LogLevel.Verbose:
            console.debug('[MSAL Verbose]', message)
            return
          case LogLevel.Warning:
            console.warn('[MSAL Warning]', message)
            return
        }
      },
    },
  },
}

export const loginRequest = {
  scopes: ['User.Read', 'openid', 'profile', 'email'],
  prompt: 'select_account',
}

// Create and initialize MSAL instance
export const msalInstance = new PublicClientApplication(msalConfig)

// Initialize MSAL - this must be called before any other MSAL operations
msalInstance.initialize().then(() => {
  console.log('[MSAL] Initialized successfully')
}).catch((error) => {
  console.error('[MSAL] Initialization failed:', error)
})