type FlashMessageProps = {
  message: string;
};

export function FlashMessage({ message }: FlashMessageProps) {
  return (
    <div className="fixed top-4 right-4 bg-green-500 text-white p-2 rounded">
      {message}
    </div>
  );
} 