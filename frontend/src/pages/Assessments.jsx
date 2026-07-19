import React, { useEffect, useState } from "react";
import { Plus, Trash2, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import Topbar from "../components/Topbar";
import client from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function Assessments() {
  const navigate = useNavigate();

  const { user } = useAuth();

  const isAdmin = user?.role === "admin";

  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadAssessments() {
    try {
      const url = isAdmin
        ? "/api/assessments"
        : "/api/user-assessments/my-assessments";

      const res = await client.get(url);

      setAssessments(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (user) {
      loadAssessments();
    }
  }, [user]);

  async function deleteAssessment(id) {
    if (!window.confirm("Delete this assessment?")) return;

    try {
      await client.delete(`/api/assessments/${id}`);

      loadAssessments();
    } catch (err) {
      console.log(err);
      alert("Unable to delete assessment.");
    }
  }

  return (
    <DashboardLayout>
      <Topbar
        title="Assessments"
        subtitle="Manage assessments and questions"
      />

      {isAdmin && (
        <div className="flex justify-end mb-5">
          <button
            onClick={() => navigate("/add-assessment")}
            className="flex items-center gap-2 bg-primary text-white px-5 py-3 rounded-xl hover:bg-primary-600"
          >
            <Plus size={18} />

            Create Assessment
          </button>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow overflow-hidden">

        <table className="w-full">

          <thead className="bg-gray-100">

            <tr>

              <th className="px-5 py-4 text-left">
                Title
              </th>

              <th className="px-5 py-4 text-left">
                Description
              </th>

              <th className="px-5 py-4 text-center">
                Duration
              </th>

              <th className="px-5 py-4 text-center">
                Questions
              </th>

              <th className="px-5 py-4 text-center">
                {isAdmin ? "Assigned Users" : "Status"}
              </th>

              {!isAdmin && (
                <th className="px-5 py-4 text-center">Score</th>
              )}

              <th className="px-5 py-4 text-center">
                Action
              </th>

            </tr>

          </thead>

          <tbody>

            {loading && (

              <tr>

                <td
                  colSpan="6"
                  className="text-center py-10"
                >
                  Loading...
                </td>

              </tr>

            )}

            {!loading &&
              assessments.length === 0 && (

                <tr>

                  <td
                    colSpan="6"
                    className="text-center py-10"
                  >
                    {isAdmin
                      ? "No Assessments Found"
                      : "No Assessment Assigned"}
                  </td>

                </tr>

              )}

            {assessments.map((assessment) => (

              <tr
                key={assessment.id}
                className="border-t"
              >

                <td className="px-5 py-4 font-semibold">
                  {assessment.title}
                </td>

                <td className="px-5 py-4">
                  {assessment.description}
                </td>

                <td className="text-center">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                    {assessment.duration} mins
                  </span>
                </td>

                <td className="text-center">
                  {assessment.total_questions}
                </td>

                <td className="text-center">
                  {isAdmin ? (
                    assessment.assigned_users
                  ) : (
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${assessment.status?.toLowerCase() === "submitted"
                        ? "bg-green-100 text-green-700"
                        : assessment.status?.toLowerCase() === "assigned"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-100 text-gray-700"
                        }`}
                    >
                      {assessment.status}
                    </span>
                  )}
                </td>

                {!isAdmin && (
                  <td className="text-center">
                      {assessment.score ?? 0}
                  </td>
                )}

                <td className="text-center">
                  <div className="flex justify-center gap-3">

                    {isAdmin ? (
                      <>
                        {/* View/Edit Assessment */}
                        <button
                          onClick={() =>
                            navigate(
                              isAdmin
                                ? `/add-assessment/${assessment.id}`
                                : `/assessment-test/${assessment.id}`
                            )
                          }
                        >
                          <Eye size={18} className="text-blue-600" />
                        </button>

                        {/* Delete Assessment */}
                        <button
                          onClick={() =>
                            deleteAssessment(assessment.id)
                          }
                        >
                          <Trash2
                            size={18}
                            className="text-red-600"
                          />
                        </button>
                      </>
                    ) : (
                      /* Start Assessment */
                      <button
                        disabled={assessment.status?.toLowerCase() === "submitted"}
                        onClick={() =>
                          navigate(`/assessment-test/${assessment.id}`)
                        }
                        className={`px-4 py-2 rounded-lg text-white ${assessment.status?.toLowerCase() === "submitted"
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-green-600 hover:bg-green-700"
                          }`}
                      >
                        {assessment.status?.toLowerCase() === "submitted"
                          ? "Submitted"
                          : "Start Test"}
                      </button>
                    )}

                  </div>
                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>
    </DashboardLayout>
  );
}