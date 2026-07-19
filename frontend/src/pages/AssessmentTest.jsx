import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import Topbar from "../components/Topbar";

import QuestionCard from "../components/QuestionCard";
import QuestionPalette from "../components/QuestionPalette";
import Timer from "../components/Timer";

import client from "../api/client";

export default function AssessmentTest() {

    const { id } = useParams();

    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);

    const [assessment, setAssessment] = useState(null);

    const [questions, setQuestions] = useState([]);

    const [currentQuestion, setCurrentQuestion] = useState(0);

    const [answers, setAnswers] = useState({});

    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        loadAssessment();
    }, []);


    async function loadAssessment() {

        try {

            const res = await client.get(`/api/assessments/${id}`);

            setAssessment(res.data);
            setQuestions(res.data.questions || []);

        } catch (err) {

            console.log(err);

            alert("Unable to load assessment.");

            navigate("/assessments");

        }

        setLoading(false);

    }

    function selectAnswer(questionId, answer) {

        setAnswers((prev) => ({
            ...prev,
            [questionId]: answer,
        }));

    }

    function nextQuestion() {

        if (currentQuestion < questions.length - 1) {

            setCurrentQuestion(currentQuestion + 1);

        }

    }

    function previousQuestion() {

        if (currentQuestion > 0) {

            setCurrentQuestion(currentQuestion - 1);

        }

    }

    function jumpQuestion(index) {

        setCurrentQuestion(index);

    }

    async function submitAssessment(autoSubmit = false) {

        if (submitted) return;

        if (!autoSubmit) {
            const ok = window.confirm("Submit Assessment?");
            if (!ok) return;
        }

        setSubmitted(true);

        try {

            const payload = {
                answers: Object.keys(answers).map((questionId) => ({
                    question_id: Number(questionId),
                    selected_answer: answers[questionId],
                })),
            };

            await client.post(
                `/api/user-assessments/${id}/submit`,
                payload
            );

            if (!autoSubmit) {
                alert("Assessment Submitted Successfully");
            }

            navigate(`/assessment-result/${id}`);

        } catch (err) {

            setSubmitted(false);

            console.log(err);

            alert(
                err.response?.data?.detail ||
                "Unable to submit assessment."
            );
        }
    }

    if (loading) {
        return (
            <DashboardLayout>
                <Topbar
                    title="Assessment"
                    subtitle="Loading..."
                />
                <div className="p-10 text-center">
                    Loading Assessment...
                </div>
            </DashboardLayout>
        );
    }

    return (

        <DashboardLayout>

            <Topbar
                title={assessment?.title}
                subtitle={assessment?.description}
            />

            <div className="grid grid-cols-12 gap-6">

                {/* Left */}

                <div className="col-span-9">

                    <div className="bg-white rounded-xl shadow p-6">

                        <div className="flex justify-between items-center mb-6">

                            <h2 className="text-xl font-bold">

                                Question {currentQuestion + 1}

                                {" / "}

                                {questions.length}

                            </h2>

                            <Timer
                                minutes={assessment?.duration || 60}
                                onComplete={() => submitAssessment(true)}
                            />

                        </div>

                        {questions.length > 0 && (

                            <QuestionCard

                                question={questions[currentQuestion]}

                                answer={
                                    answers[
                                    questions[currentQuestion].id
                                    ]
                                }

                                onAnswerSelect={selectAnswer}

                            />

                        )}

                        <div className="flex justify-between mt-8">

                            <button

                                onClick={previousQuestion}

                                disabled={currentQuestion === 0}

                                className="px-5 py-3 rounded-lg bg-gray-200 disabled:opacity-40"

                            >

                                Previous

                            </button>
                            {currentQuestion === questions.length - 1 ? (
                                <button
                                    disabled={submitted}
                                    onClick={submitAssessment}
                                    className={`px-8 py-3 rounded-lg text-white ${submitted
                                        ? "bg-gray-400 cursor-not-allowed"
                                        : "bg-green-600"
                                        }`}
                                >
                                    {submitted ? "Submitting..." : "Submit Assessment"}
                                </button>

                            ) : (

                                <button
                                    onClick={nextQuestion}
                                    className="px-8 py-3 rounded-lg bg-blue-600 text-white"

                                >
                                    Next
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right */}

                <div className="col-span-3">
                    <QuestionPalette
                        questions={questions}
                        answers={answers}
                        currentQuestion={currentQuestion}
                        onSelect={jumpQuestion}
                    />
                </div>
            </div>
        </DashboardLayout>
    );
}