'use client';

import { Micropost } from '@/types/micropost';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import Image from 'next/image';

// Chart.jsの登録
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface CategoryRanking {
  id: number;
  name: string;
  postCount: number;
  recentPosts: Array<{
    id: number;
    title: string;
    imagePath: string;
    createdAt: string;
    user: {
      id: number;
      name: string;
      profile: {
        avatarPath: string;
      };
    };
  }>;
}

interface MostViewRanking {
  id: number;
  title: string;
  imagePath: string;
  createdAt: string;
  user: {
    id: number;
    name: string;
    profile: {
      avatarPath: string;
    };
  };
  viewCount: number;
}

interface RankingClientProps {
  rankingData: Micropost[];
  categoryRanking: CategoryRanking[];
  mostViewRanking: MostViewRanking[];
}

// チャートの共通オプションを作成
const createChartOptions = (title: string, yAxisLabel: string) => ({
  responsive: true,
  plugins: {
    legend: {
      display: false,
    },
    title: {
      display: true,
      text: title,
      font: {
        size: 20,
      },
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: yAxisLabel,
      },
    },
    x: {
      title: {
        display: true,
        text: '投稿タイトル',
      },
    },
  },
});

export default function RankingClient({ rankingData, categoryRanking, mostViewRanking }: RankingClientProps) {
  const likeOptions = createChartOptions('いいね数ランキング', 'いいね数');
  const mostViewOptions = createChartOptions('閲覧数ランキング', '閲覧数');
  
  const categoryOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right' as const,
      },
      title: {
        display: true,
        text: 'カテゴリ別投稿数',
        font: {
          size: 20,
        },
      },
    },
  };

  const createBarChartData = (labels: string[], data: number[], color: string) => ({
    labels,
    datasets: [{
      data,
      backgroundColor: `rgba(${color}, 0.5)`,
      borderColor: `rgba(${color}, 1)`,
      borderWidth: 1,
    }],
  });

  const chartData = createBarChartData(
    rankingData.map(post => post.title),
    rankingData.map(post => post.likesCount),
    '54, 162, 235'
  );

  const mostViewChartData = createBarChartData(
    mostViewRanking.map(post => post.title),
    mostViewRanking.map(post => post.viewCount),
    '75, 192, 192'
  );

  const categoryChartData = {
    labels: categoryRanking.map(category => category.name),
    datasets: [
      {
        data: categoryRanking.map(category => category.postCount),
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)',
          'rgba(153, 102, 255, 0.5)',
          'rgba(255, 159, 64, 0.5)',
          'rgba(199, 199, 199, 0.5)',
          'rgba(83, 102, 255, 0.5)',
          'rgba(40, 159, 64, 0.5)',
          'rgba(210, 199, 199, 0.5)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(199, 199, 199, 1)',
          'rgba(83, 102, 255, 1)',
          'rgba(40, 159, 64, 1)',
          'rgba(210, 199, 199, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* いいねランキングチャート */}
        <div className="p-4 bg-white rounded-lg shadow">
          <Bar options={likeOptions} data={chartData} />
        </div>

        {/* 最も閲覧された投稿ランキングチャート */}
        <div className="p-4 bg-white rounded-lg shadow">
          <Bar options={mostViewOptions} data={mostViewChartData} />
        </div>

        {/* カテゴリランキングチャート */}
        <div className="p-4 bg-white rounded-lg shadow">
          <Pie options={categoryOptions} data={categoryChartData} />
        </div>
      </div>
    </div>
  );
} 