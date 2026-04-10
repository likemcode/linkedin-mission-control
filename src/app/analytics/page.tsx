"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type PostWithAnalytics = {
  id: string;
  content: string;
  score: number | null;
  publishedAt: string;
  analytics: {
    likes: number;
    comments: number;
    reposts: number;
    impressions: number;
  } | null;
};

type Summary = {
  totalPosts: number;
  totalLikes: number;
  totalComments: number;
  totalImpressions: number;
  avgScore: number;
};

export default function AnalyticsPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [posts, setPosts] = useState<PostWithAnalytics[]>([]);

  useEffect(() => {
    fetch("/api/analytics")
      .then((r) => r.json())
      .then((data) => {
        setSummary(data.summary);
        setPosts(data.posts);
      });
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Analytics</h1>

      {/* Summary cards */}
      {summary && (
        <div className="grid grid-cols-5 gap-4 mb-8">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-400">{summary.totalPosts}</div>
            <div className="text-xs text-gray-400">Posts publiés</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <div className="text-2xl font-bold text-red-400">{summary.totalLikes}</div>
            <div className="text-xs text-gray-400">Likes</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-400">{summary.totalComments}</div>
            <div className="text-xs text-gray-400">Commentaires</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <div className="text-2xl font-bold text-purple-400">{summary.totalImpressions}</div>
            <div className="text-xs text-gray-400">Impressions</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <div className="text-2xl font-bold text-yellow-400">{summary.avgScore || "—"}</div>
            <div className="text-xs text-gray-400">Score moyen IA</div>
          </div>
        </div>
      )}

      {/* Posts table */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-800">
            <tr>
              <th className="text-left p-3 text-gray-400 font-medium">Post</th>
              <th className="text-center p-3 text-gray-400 font-medium">Score</th>
              <th className="text-center p-3 text-gray-400 font-medium">Likes</th>
              <th className="text-center p-3 text-gray-400 font-medium">Comments</th>
              <th className="text-center p-3 text-gray-400 font-medium">Impressions</th>
              <th className="text-center p-3 text-gray-400 font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.id} className="border-t border-gray-800 hover:bg-gray-800/50">
                <td className="p-3">
                  <Link href={`/editor/${post.id}`} className="text-gray-300 hover:text-blue-400">
                    {post.content.slice(0, 60)}
                    {post.content.length > 60 ? "..." : ""}
                  </Link>
                </td>
                <td className="p-3 text-center">
                  {post.score ? (
                    <span
                      className={`font-bold ${
                        post.score >= 80
                          ? "text-green-400"
                          : post.score >= 60
                            ? "text-yellow-400"
                            : "text-red-400"
                      }`}
                    >
                      {post.score}
                    </span>
                  ) : (
                    <span className="text-gray-600">—</span>
                  )}
                </td>
                <td className="p-3 text-center text-gray-300">{post.analytics?.likes ?? "—"}</td>
                <td className="p-3 text-center text-gray-300">{post.analytics?.comments ?? "—"}</td>
                <td className="p-3 text-center text-gray-300">{post.analytics?.impressions ?? "—"}</td>
                <td className="p-3 text-center text-gray-500">
                  {post.publishedAt
                    ? new Date(post.publishedAt).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "short",
                      })
                    : "—"}
                </td>
              </tr>
            ))}
            {posts.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-500">
                  Aucun post publié. Les analytics apparaîtront ici après ta première publication.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
