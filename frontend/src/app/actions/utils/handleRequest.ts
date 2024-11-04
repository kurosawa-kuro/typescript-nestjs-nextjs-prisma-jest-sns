export async function handleRequest<T>(
  requestFn: () => Promise<T>,
  errorMessage: string,
  defaultValue?: T
): Promise<T> {
  try {
    return await requestFn();
  } catch (error) {
    console.error(errorMessage, error);
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    throw error;
  }
} 