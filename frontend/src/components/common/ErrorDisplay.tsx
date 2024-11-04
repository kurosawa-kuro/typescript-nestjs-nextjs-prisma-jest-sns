type ErrorDisplayProps = {
  error: string;
};

export function ErrorDisplay({ error }: ErrorDisplayProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-xl rounded-lg p-6 max-w-md w-full">
        <h1 className="text-2xl font-bold text-center mb-4 text-red-600">Error</h1>
        <p className="text-center">{error}</p>
      </div>
    </div>
  );
} 