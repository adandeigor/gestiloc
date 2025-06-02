export const FORM_DATA_ENDPOINTS = [
    '/api/user/:id/profile',
  ];
  
  export const isFormDataEndpoint = (endpoint: string): boolean => {
    return FORM_DATA_ENDPOINTS.some((pattern) => {
      const regex = new RegExp('^' + pattern.replace(/:\w+/g, '[^/]+') + '$');
      return regex.test(endpoint);
    });
  };