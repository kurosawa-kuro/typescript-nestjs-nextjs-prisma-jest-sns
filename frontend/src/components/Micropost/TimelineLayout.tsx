interface TimelineLayoutProps {
  mainContent: React.ReactNode;
  categoryList: React.ReactNode;
}

const TimelineLayout: React.FC<TimelineLayoutProps> = ({ mainContent, categoryList }) => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex gap-8">
        {/* メインコンテンツ */}
        <div className="flex-1">
          {mainContent}
        </div>
        
        {/* サイドバー */}
        <div className="w-80 flex-shrink-0">
          {categoryList}
        </div>
      </div>
    </div>
  );
};

export default TimelineLayout; 