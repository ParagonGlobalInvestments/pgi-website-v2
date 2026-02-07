interface PortalPageHeaderProps {
  title: string;
  description: string;
  children?: React.ReactNode;
}

export function PortalPageHeader({
  title,
  description,
  children,
}: PortalPageHeaderProps) {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
      <p className="text-sm text-gray-500 mt-1">{description}</p>
      {children}
    </div>
  );
}
