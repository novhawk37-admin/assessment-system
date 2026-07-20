import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2, Save } from "lucide-react";
import { useParams } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import Topbar from "../components/Topbar";
import client from "../api/client";

export default function AddAssessment() {
    const navigate = useNavigate();

    const { id } = useParams();
    const isEdit = !!id;

    const [loading, setLoading] = useState(false);
    const [users, setUsers] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);

    useEffect(() => {
        loadUsers();
    }, []);

    useEffect(() => {
        if (isEdit) {
            loadAssessment();
        }
    }, [id]);

    async function loadAssessment() {
        try {
            const res = await client.get(`/api/assessments/${id}`);

            setAssessment({
                title: res.data.title,
                description: res.data.description,
                duration: res.data.duration,
                status: res.data.status,
            });

            setQuestions(res.data.questions || [emptyQuestion()]);

        } catch (err) {
            console.error(err);
        }
    }

    async function loadUsers() {
        try {
            const res = await client.get("/api/users");
            setUsers(res.data);
        } catch (err) {
            console.log(err);
        }
    }

    const [assessment, setAssessment] = useState({
        title: "",
        description: "",
        duration: 60,
        status: "Active",
    });

    const emptyQuestion = () => ({
        question: "",
        option_a: "",
        option_b: "",
        option_c: "",
        option_d: "",
        correct_answer: "A",
        marks: 1,
    });

    const [questions, setQuestions] = useState([emptyQuestion()]);

    function handleAssessment(e) {
        setAssessment({
            ...assessment,
            [e.target.name]: e.target.value,
        });
    }

    function toggleUser(userId) {
        if (selectedUsers.includes(userId)) {
            setSelectedUsers(
                selectedUsers.filter((id) => id !== userId)
            );
        } else {
            setSelectedUsers([...selectedUsers, userId]);
        }
    }

    function handleQuestion(index, field, value) {
        const copy = [...questions];
        copy[index][field] = value;
        setQuestions(copy);
    }

    function addQuestion() {
        setQuestions([...questions, emptyQuestion()]);
    }

    function removeQuestion(index) {
        if (questions.length === 1) return;

        const copy = [...questions];
        copy.splice(index, 1);
        setQuestions(copy);
    }

    async function saveAssessment() {
        try {
            setLoading(true);

            let assessmentId;

            if (isEdit) {

                // Update Assessment
                await client.put(`/api/assessments/${id}`, {
                    title: assessment.title,
                    description: assessment.description,
                    duration: Number(assessment.duration),
                    status: assessment.status,
                });

                assessmentId = id;

            } else {

                // Create Assessment
                const assessmentRes = await client.post("/api/assessments", {
                    title: assessment.title,
                    description: assessment.description,
                    duration: Number(assessment.duration),
                    total_questions: questions.length,
                    status: assessment.status,
                });

                assessmentId = assessmentRes.data.id;
            }

            // Save Questions
            for (const q of questions) {
                if (q.id) {
                    await client.put(`/api/questions/${q.id}`, {
                        question: q.question,
                        option_a: q.option_a,
                        option_b: q.option_b,
                        option_c: q.option_c,
                        option_d: q.option_d,
                        correct_answer: q.correct_answer,
                        marks: Number(q.marks),
                    });
                } else {
                    await client.post("/api/questions", {
                        assessment_id: assessmentId,
                        question: q.question,
                        option_a: q.option_a,
                        option_b: q.option_b,
                        option_c: q.option_c,
                        option_d: q.option_d,
                        correct_answer: q.correct_answer,
                        marks: Number(q.marks),
                    });
                }
            }

            // Assign Users
            if (selectedUsers.length > 0) {
                await client.post("/api/user-assessments/assign", {
                    assessment_id: assessmentId,
                    user_ids: selectedUsers,
                });
            }

            alert(
                isEdit
                    ? "Assessment Updated Successfully"
                    : "Assessment Created Successfully"
            );

            navigate("/assessments");

        } catch (err) {
            console.error(err);

            alert(
                err.response?.data?.detail ||
                "Unable to save assessment."
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <DashboardLayout>
            <Topbar
                title={isEdit ? "Edit Assessment" : "Create Assessment"}
                subtitle={
                    isEdit
                        ? "Update assessment and questions"
                        : "Create assessment and add questions"
                }
            />

            {/* Assessment Details */}

            <div className="bg-white rounded-xl shadow p-6 mb-6">

                <h2 className="font-bold text-lg mb-4">
                    Assessment Details
                </h2>

                <div className="grid grid-cols-2 gap-4">

                    <input
                        name="title"
                        placeholder="Assessment Title"
                        className="border rounded-lg p-3"
                        value={assessment.title}
                        onChange={handleAssessment}
                    />

                    <input
                        name="duration"
                        type="number"
                        placeholder="Duration (Minutes)"
                        className="border rounded-lg p-3"
                        value={assessment.duration}
                        onChange={handleAssessment}
                    />

                    <textarea
                        name="description"
                        placeholder="Description"
                        rows="3"
                        className="border rounded-lg p-3 col-span-2"
                        value={assessment.description}
                        onChange={handleAssessment}
                    />

                    <select
                        name="status"
                        value={assessment.status}
                        onChange={handleAssessment}
                        className="border rounded-lg p-3"
                    >
                        <option>Active</option>
                        <option>Inactive</option>
                    </select>

                    <div className="col-span-2">

                        <label className="block font-semibold mb-2">
                            Assign Users
                        </label>

                        <div className="border rounded-lg p-4 max-h-60 overflow-y-auto">

                            {users.length === 0 && (
                                <p className="text-gray-500">
                                    No Users Found
                                </p>
                            )}

                            {users.map((user) => (

                                <label
                                    key={user.id}
                                    className="flex items-center gap-3 py-2 border-b last:border-b-0"
                                >

                                    <input
                                        type="checkbox"
                                        checked={selectedUsers.includes(user.id)}
                                        onChange={() => toggleUser(user.id)}
                                    />

                                    <span>
                                        {user.name}
                                    </span>

                                </label>

                            ))}

                        </div>

                    </div>

                </div>

            </div>

            {/* Questions */}

            {(questions || []).map((q, index) => (

                <div
                    key={index}
                    className="bg-white rounded-xl shadow p-6 mb-5"
                >

                    <div className="flex justify-between items-center mb-4">

                        <h2 className="font-bold">
                            Question {index + 1}
                        </h2>

                        <button
                            onClick={() => removeQuestion(index)}
                        >
                            <Trash2 className="text-red-500" />
                        </button>

                    </div>

                    <textarea
                        className="border rounded-lg p-3 w-full mb-4"
                        rows="3"
                        placeholder="Enter Question"
                        value={q.question}
                        onChange={(e) =>
                            handleQuestion(
                                index,
                                "question",
                                e.target.value
                            )
                        }
                    />

                    <div className="grid grid-cols-2 gap-4">

                        <input
                            className="border rounded-lg p-3"
                            placeholder="Option A"
                            value={q.option_a}
                            onChange={(e) =>
                                handleQuestion(
                                    index,
                                    "option_a",
                                    e.target.value
                                )
                            }
                        />

                        <input
                            className="border rounded-lg p-3"
                            placeholder="Option B"
                            value={q.option_b}
                            onChange={(e) =>
                                handleQuestion(
                                    index,
                                    "option_b",
                                    e.target.value
                                )
                            }
                        />

                        <input
                            className="border rounded-lg p-3"
                            placeholder="Option C"
                            value={q.option_c}
                            onChange={(e) =>
                                handleQuestion(
                                    index,
                                    "option_c",
                                    e.target.value
                                )
                            }
                        />

                        <input
                            className="border rounded-lg p-3"
                            placeholder="Option D"
                            value={q.option_d}
                            onChange={(e) =>
                                handleQuestion(
                                    index,
                                    "option_d",
                                    e.target.value
                                )
                            }
                        />

                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-4">

                        <select
                            className="border rounded-lg p-3"
                            value={q.correct_answer}
                            onChange={(e) =>
                                handleQuestion(
                                    index,
                                    "correct_answer",
                                    e.target.value
                                )
                            }
                        >
                            <option value="A">Option A</option>
                            <option value="B">Option B</option>
                            <option value="C">Option C</option>
                            <option value="D">Option D</option>
                        </select>

                        <input
                            type="number"
                            className="border rounded-lg p-3"
                            value={q.marks}
                            placeholder="Mark"
                            onChange={(e) =>
                                handleQuestion(
                                    index,
                                    "marks",
                                    e.target.value
                                )
                            }
                        />

                    </div>

                </div>

            ))}

            <div className="flex gap-4 mb-8">

                <button
                    onClick={addQuestion}
                    className="bg-blue-600 text-white px-5 py-3 rounded-xl flex items-center gap-2"
                >
                    <Plus size={18} />
                    Add Question
                </button>

                <button
                    onClick={saveAssessment}
                    disabled={loading}
                    className="bg-green-600 text-white px-5 py-3 rounded-xl flex items-center gap-2"
                >
                    <Save size={18} />
                    {loading
                        ? "Saving..."
                        : isEdit
                            ? "Update Assessment"
                            : "Save Assessment"}
                </button>

            </div>

        </DashboardLayout>
    );
}
