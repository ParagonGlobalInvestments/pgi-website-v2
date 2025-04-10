import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";

export default async function DashboardPage() {
  const user = await currentUser();

  // If no user is found, show a message (shouldn't happen due to middleware protection)
  if (!user) {
    return (
      <div className="py-12 px-4 text-center">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold mb-4 text-dark">Access Denied</h1>
          <p className="text-gray-700 mb-4">
            Please sign in to access the dashboard.
          </p>
          <Link href="/portal" className="btn-primary">
            Go to Portal
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 px-4">
      <div className="container mx-auto">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-3xl font-bold mb-6 text-dark">
            Welcome to your Dashboard, {user?.firstName || "Member"}
          </h1>

          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-primary">
              Account Overview
            </h2>
            <div className="bg-light p-4 rounded-md">
              <p className="text-gray-700">
                Email: {user?.emailAddresses[0]?.emailAddress || "Not provided"}
              </p>
              <p className="text-gray-700">
                Member since:{" "}
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString()
                  : "Unknown"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-light p-6 rounded-md">
              <h3 className="text-lg font-semibold mb-3 text-primary">
                Investment Portfolio
              </h3>
              <p className="text-gray-700 mb-4">
                Track your investment portfolio performance and make informed
                decisions.
              </p>
              <Link
                href="/dashboard/portfolio"
                className="text-primary hover:underline"
              >
                View Portfolio →
              </Link>
            </div>

            <div className="bg-light p-6 rounded-md">
              <h3 className="text-lg font-semibold mb-3 text-primary">
                Educational Resources
              </h3>
              <p className="text-gray-700 mb-4">
                Access exclusive educational materials to enhance your investing
                knowledge.
              </p>
              <Link
                href="/dashboard/resources"
                className="text-primary hover:underline"
              >
                Browse Resources →
              </Link>
            </div>

            <div className="bg-light p-6 rounded-md">
              <h3 className="text-lg font-semibold mb-3 text-primary">
                Chapter Activities
              </h3>
              <p className="text-gray-700 mb-4">
                Stay updated on your chapter's activities and upcoming events.
              </p>
              <Link
                href="/dashboard/chapter"
                className="text-primary hover:underline"
              >
                View Chapter →
              </Link>
            </div>

            <div className="bg-light p-6 rounded-md">
              <h3 className="text-lg font-semibold mb-3 text-primary">
                Member Directory
              </h3>
              <p className="text-gray-700 mb-4">
                Connect with other members across all Paragon chapters.
              </p>
              <Link
                href="/dashboard/directory"
                className="text-primary hover:underline"
              >
                View Directory →
              </Link>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-xl font-semibold mb-4 text-primary">
              Recent Announcements
            </h2>
            <div className="space-y-4">
              <div className="p-4 border border-gray-200 rounded-md">
                <p className="text-sm text-gray-500">October 15, 2023</p>
                <h3 className="font-medium text-dark">
                  New Investment Strategy Workshop
                </h3>
                <p className="text-gray-700">
                  Join us for an exclusive workshop on value investing
                  strategies led by industry professionals.
                </p>
              </div>
              <div className="p-4 border border-gray-200 rounded-md">
                <p className="text-sm text-gray-500">October 8, 2023</p>
                <h3 className="font-medium text-dark">
                  Portfolio Performance Update
                </h3>
                <p className="text-gray-700">
                  The latest quarterly performance report for our investment
                  fund is now available.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
