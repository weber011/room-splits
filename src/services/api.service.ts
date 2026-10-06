export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  status: number;
}

export async function handleApiResponse<T>(promise: Promise<T>): Promise<ApiResponse<T>> {
  try {
    const data = await promise;
    return { data, error: null, status: 200 };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
    return { data: null, error: errorMessage, status: 500 };
  }
}
