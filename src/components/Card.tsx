interface CardProps {
  title?: string;
  description?: string;
  children?: React.ReactNode;
}

function Card({ title, description, children }: CardProps) {
  return (
    <div className="rounded-md border bg-white p-3">
      {title && <h3 className="mb-2 text-2xl font-bold">{title}</h3>}
      {description && (
        <p className="mb-4 text-sm text-gray-700">{description}</p>
      )}
      {children}
    </div>
  );
}

export default Card;
