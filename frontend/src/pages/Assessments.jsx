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

  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState(null);

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

  function startAssessment(id) {
    setSelectedAssessment(id);
    setShowDisclaimer(true);
  }

  async function confirmStartTest() {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      }
    } catch (err) {
      console.log("Fullscreen error:", err);
    }
    setShowDisclaimer(false);
    navigate(`/assessment-test/${selectedAssessment}`);
  }

  return (
    <DashboardLayout>
      <Topbar
        title="Assessments"
        subtitle="Manage assessments and questions"
        showBack
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
                        onClick={() => startAssessment(assessment.id)}
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
      {showDisclaimer && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-4">

            {/* Header */}
            <div className="border-b px-6 py-4">
              <h2 className="text-2xl font-bold text-gray-800">
                Assessment Instructions
              </h2>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-4 text-gray-700">

              <p>
                Please read the following instructions carefully before starting the
                assessment.
              </p>

              <ul className="list-disc pl-6 space-y-3">
                <li>
                  The assessment will automatically enter <b>Full Screen Mode</b>.
                </li>

                <li>
                  Do <b>not switch tabs</b>, minimize the browser, or open another
                  application while taking the assessment.
                </li>

                <li>
                  You are allowed a maximum of <b>3 tab-switch attempts</b>.
                </li>

                <li>
                  If you exceed the allowed attempts, your assessment will be
                  <span className="font-semibold text-red-600">
                    {" "}submitted automatically.
                  </span>
                </li>

                <li>
                  Do not refresh or close the browser during the assessment.
                </li>

                <li>
                  Ensure you have a stable internet connection before starting.
                </li>

                <li>
                  Once submitted, you cannot retake the assessment.
                </li>
              </ul>

            </div>

            {/* Footer */}
            <div className="flex justify-between items-center border-t px-6 py-4">

              <button
                onClick={() => setShowDisclaimer(false)}
                className="px-5 py-2 rounded-lg border border-gray-300 hover:bg-gray-100"
              >
                Cancel
              </button>

              <button
                onClick={confirmStartTest}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold"
              >
                Start Test
              </button>

            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}