interface RoleBadgeProps {
  role: string;
}

export function RoleBadge({ role }: RoleBadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
        ${role === 'admin' 
          ? 'bg-rose-100 text-rose-700' 
          : 'bg-blue-100 text-blue-800'
        }
      `}
    >
      {role}
    </span>
  );
} 