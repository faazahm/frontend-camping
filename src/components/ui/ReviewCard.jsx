import { Star, User } from 'lucide-react';

const ReviewCard = ({ review }) => {
  const getOverallRating = () => {
    if (review.rating !== undefined && review.rating !== null) {
      return Number(review.rating);
    }
    if (review.answers?.length) {
      return review.answers.reduce((sum, a) => sum + (a.score || 0), 0) / review.answers.length;
    }
    return 0;
  };

  const getUsername = () => {
    return review.username || review.user?.full_name || review.user?.name || 'User';
  };

  const overallRating = getOverallRating();
  const username = getUsername();

  return (
    <div className="bg-gray-50 dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-gray-300 hover:shadow-lg transition-all duration-300 h-full flex flex-col group hover:-translate-y-1">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center shrink-0">
          <User size={18} className="text-orange-600" />
        </div>
        <div className="min-w-0">
          <p className="font-bold text-gray-900 dark:text-white text-sm truncate">
            {username}
          </p>
          <div className="flex items-center gap-1 mt-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={14}
                fill={star <= Math.round(overallRating) ? 'currentColor' : 'none'}
                className={star <= Math.round(overallRating) ? 'text-orange-500' : 'text-gray-300'}
              />
            ))}
            <span className="ml-1 text-xs font-bold text-gray-500 dark:text-gray-400">
              {overallRating.toFixed(1)}
            </span>
          </div>
        </div>
      </div>

      <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed flex-1 min-h-[3rem]">
        {review.comment || review.komentar}
      </p>

      <p className="text-[10px] text-gray-400 mt-3">
        {review.created_at || review.tanggal
          ? new Date(review.created_at || review.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
          : 'Baru saja'}
      </p>
    </div>
  );
};

export default ReviewCard;
