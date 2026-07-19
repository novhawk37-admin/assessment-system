import React from "react";

export default function QuestionPalette({
    questions,
    answers,
    currentQuestion,
    onSelect,
}) {

    const answeredCount = Object.keys(answers).length;
    const unansweredCount = questions.length - answeredCount;

    return (

        <div className="bg-white rounded-xl shadow p-5 sticky top-5">

            <h2 className="text-lg font-bold mb-5">
                Question Palette
            </h2>

            {/* Summary */}

            <div className="space-y-3 mb-6">

                <div className="flex items-center justify-between">

                    <span>Answered</span>

                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                        {answeredCount}
                    </span>

                </div>

                <div className="flex items-center justify-between">

                    <span>Not Answered</span>

                    <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm font-semibold">
                        {unansweredCount}
                    </span>

                </div>

                <div className="flex items-center justify-between">

                    <span>Total</span>

                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
                        {questions.length}
                    </span>

                </div>

            </div>

            {/* Question Numbers */}

            <div className="grid grid-cols-5 gap-3">

                {questions.map((question, index) => {

                    const answered = answers[question.id];

                    let bgClass =
                        "bg-gray-200 text-gray-700";

                    if (answered) {
                        bgClass =
                            "bg-green-500 text-white";
                    }

                    if (currentQuestion === index) {
                        bgClass =
                            "bg-blue-600 text-white";
                    }

                    return (

                        <button
                            key={question.id}
                            onClick={() => onSelect(index)}
                            className={`h-10 w-10 rounded-lg font-semibold transition ${bgClass}`}
                        >
                            {index + 1}
                        </button>

                    );

                })}

            </div>

            {/* Legend */}

            <div className="mt-8 space-y-3 text-sm">

                <div className="flex items-center gap-3">

                    <div className="w-5 h-5 rounded bg-blue-600"></div>

                    <span>Current Question</span>

                </div>

                <div className="flex items-center gap-3">

                    <div className="w-5 h-5 rounded bg-green-500"></div>

                    <span>Answered</span>

                </div>

                <div className="flex items-center gap-3">

                    <div className="w-5 h-5 rounded bg-gray-300"></div>

                    <span>Not Answered</span>

                </div>

            </div>

        </div>

    );

}