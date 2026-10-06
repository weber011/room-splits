import { getAuthUserAction } from "@/app/actions/auth.actions";
import { ReviewCard } from "@/components/common";
import { Badge } from "@/components/ui/badge";

export default async function ReviewsPage() {
  await getAuthUserAction();

  const sampleReview = {
    id: "rev-12",
    propertyId: "prop-101",
    tenantId: "user-1",
    tenantName: "Ananya Roy",
    rating: 4.9,
    cleanlinessRating: 5,
    foodRating: 4.8,
    amenitiesRating: 5,
    valueForMoneyRating: 4.9,
    comment: "Gourmet daily food quality and super fast WiFi for remote software work!",
    isVerifiedResident: true,
    createdAt: "3 days ago",
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8">
      <div>
        <Badge variant="accent">Resident Feedback</Badge>
        <h1 className="text-3xl font-extrabold text-white tracking-tight mt-1">
          Property Reviews & Ratings
        </h1>
        <p className="text-sm text-slate-400">Honest feedback from verified resident stays.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ReviewCard review={sampleReview} />
      </div>
    </div>
  );
}
