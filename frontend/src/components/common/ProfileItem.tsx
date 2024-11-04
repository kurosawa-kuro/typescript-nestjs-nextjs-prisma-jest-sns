type ProfileItemProps = {
  label: string;
  value: string;
};

export function ProfileItem({ label, value }: ProfileItemProps) {
  return (
    <div className="bg-gray-50 rounded-lg p-3 shadow-sm">
      <span className="text-sm font-medium text-gray-500">{label}</span>
      <p className="mt-1 text-sm text-gray-900">{value}</p>
    </div>
  );
} 