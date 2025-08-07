// --- Define the structure of the successful AI response ---
// This ensures that when we get data back, TypeScript knows what it should look like.
interface AISuccessResponse {
    success: true;
    response: string;
    query: string;
    timestamp: string;
  }
  
  // --- Define the structure of a failed AI response ---
  interface AIFailResponse {
    success: false;
    response: string; // We'll use 'response' for the user-facing error message
    error?: string; // The actual error message for debugging
  }
  
  // This is a "union type", meaning the response can be one of the two types above.
  type AIResponse = AISuccessResponse | AIFailResponse;
  
  class AIService {
    private baseURL: string;
  
    constructor() {
      // Use a production URL for the AI service
      this.baseURL = 'https://lucra-wealth-ai-lina.onrender.com'; 
    }
  
    /**
     * Sends a query and user context to the AI backend.
     * @param query The user's question.
     * @param userContext The user's financial data from the Zustand store.
     * @param sessionId A unique ID for the current chat session.
     * @returns A promise that resolves with the AI's response.
     */
    public async processQuery(query: string, userContext: object | null, sessionId: string): Promise<AIResponse> {
        console.log(`Sending query to AI (Session: ${sessionId}):`, query);
        console.log('With user context:', userContext);
  
      try {
        // Use the standard `fetch` API to make a network request.
        const response = await fetch(`${this.baseURL}/api/ai/query`, {
          method: 'POST', // We are sending data, so we use POST.
          headers: {
            'Content-Type': 'application/json', // Tell the server we're sending JSON.
          },
          // Convert the JavaScript object into a JSON string for sending.
          // The keys here ('query', 'user_context') MUST match what the Python server expects.
          body: JSON.stringify({
            query: query,
            user_context: userContext,
            sessionId: sessionId,
          }),
        });
  
        // If the server responds with an error (e.g., 404, 500), throw an error.
        if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.statusText}`);
        }
  
        // Parse the JSON response from the server and cast it to our AIResponse type.
        const result = await response.json() as AIResponse;
        return result;
  
      } catch (error) {
        // This block runs if the network request fails (e.g., wrong IP, server is down).
        console.error('AI Service communication error:', error);
        
        // Return a standardized error object that matches our AIFailResponse type.
        return {
          success: false,
          response: 'I\'m sorry, but I\'m having trouble connecting right now. Please try again later.',
          error: error instanceof Error ? error.message : String(error),
        };
      }
    }
  }
  
  // Create and export a single instance of the service (Singleton pattern).
  // This means the entire app will share the same messenger.
  const aiService = new AIService();
  export default aiService;