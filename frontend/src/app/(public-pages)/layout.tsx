import SideBar from '@/components/SideBar/SideBar';

export default function PublicPagesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex bg-white text-black">
      <SideBar />
      <main className="flex-grow p-8">{children}</main>
    </div>
  );
}
