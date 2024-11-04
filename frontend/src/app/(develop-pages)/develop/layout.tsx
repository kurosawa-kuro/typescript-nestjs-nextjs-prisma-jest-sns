
import DevelopSideBar from '@/components/SideBar/DevelopSidebar';

export default function DevelopPagesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex bg-white text-black">
      <DevelopSideBar />
      <main className="flex-grow p-8">
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4" role="alert">
          <p className="font-bold">Develop Area</p>
        </div>
        {children}
      </main>
    </div>
  );
}
