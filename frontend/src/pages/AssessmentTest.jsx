import React, { useEffect, useRef, useState } from "react";
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

    const ignoreFullscreenExit = useRef(false);

    const [submitted, setSubmitted] = useState(false);
    const [violations, setViolations] = useState(0);
    const [warning, setWarning] = useState("");
    const [lastViolationTime, setLastViolationTime] = useState(0);

    const MAX_VIOLATIONS = 3;

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

    useEffect(() => {
        const handleVisibility = () => {
            if (document.hidden && !submitted) {
                handleViolation("You switched away from the assessment.");
            }
        };

        document.addEventListener("visibilitychange", handleVisibility);

        return () => {
            document.removeEventListener(
                "visibilitychange",
                handleVisibility
            );
        };
    }, [submitted, lastViolationTime]);


    useEffect(() => {
        const handleFullscreenChange = () => {
            if (submitted) return;

            if (ignoreFullscreenExit.current) {
                ignoreFullscreenExit.current = false;
                return;
            }

            if (!document.fullscreenElement) {
                handleViolation("You exited Full Screen Mode.");
            }
        };

        document.addEventListener("fullscreenchange", handleFullscreenChange);

        return () => {
            document.removeEventListener(
                "fullscreenchange",
                handleFullscreenChange
            );
        };
    }, [submitted]);


    const handleViolation = (reason) => {
        if (submitted) return;

        const now = Date.now();

        // Ignore duplicate events within 2 seconds
        if (now - lastViolationTime < 2000) return;

        setLastViolationTime(now);

        setViolations((prev) => {
            const count = prev + 1;

            if (count >= MAX_VIOLATIONS) {
                setWarning(
                    `Maximum violations (${MAX_VIOLATIONS}) reached.\n\nYour assessment will now be submitted automatically.`
                );

                setTimeout(() => {
                    submitAssessment(true);
                }, 1500);
            } else {
                setWarning(
                    `${reason}

Warning ${count}/${MAX_VIOLATIONS}

Remaining Attempts: ${MAX_VIOLATIONS - count}`
                );
            }

            return count;
        });
    };

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

            if (document.fullscreenElement) {
                ignoreFullscreenExit.current = true;
                await document.exitFullscreen();
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

        <DashboardLayout hideSidebar>

            <div className="bg-white rounded-xl shadow p-5 mb-6 flex justify-between items-center">

                <div>
                    <h1 className="text-2xl font-bold">
                        {assessment?.title}
                    </h1>

                    <p className="text-gray-500">
                        {assessment?.description}
                    </p>
                </div>

                <div className="flex items-center gap-6">

                    <div className="text-red-600 font-semibold">
                        Remaining Attempts: {MAX_VIOLATIONS - violations}
                    </div>

                    <Timer
                        minutes={assessment?.duration || 60}
                        onComplete={() => submitAssessment(true)}
                    />

                </div>

            </div>

            {warning && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">

                    <div className="bg-white rounded-xl shadow-xl w-[420px] p-6">

                        <h2 className="text-2xl font-bold text-red-600">
                            Assessment Warning
                        </h2>

                        <p className="mt-4 whitespace-pre-line text-gray-700">
                            {warning}
                        </p>

                        {violations < MAX_VIOLATIONS && (
                            <button
                                onClick={async () => {
                                    try {
                                        if (!document.fullscreenElement) {
                                            await document.documentElement.requestFullscreen();
                                        }
                                        setWarning("");
                                    } catch (err) {
                                        console.error(err);
                                    }
                                }}
                                className="mt-6 w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg"
                            >
                                Return to Full Screen
                            </button>
                        )}

                    </div>

                </div>
            )}

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

                            {/* <div className="text-red-600 font-semibold">
                                Remaining Attempts: {MAX_VIOLATIONS - violations}
                            </div>

                            <Timer
                                minutes={assessment?.duration || 60}
                                onComplete={() => submitAssessment(true)}
                            /> */}

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