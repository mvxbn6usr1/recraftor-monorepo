interface ErrorDisplayProps {
  message: string;
}

export function ErrorDisplay({ message }: ErrorDisplayProps) {
  return (
    <div className="flex-1 flex items-center justify-center text-destructive">
      <p>Error: {message}</p>
    </div>
  );
}