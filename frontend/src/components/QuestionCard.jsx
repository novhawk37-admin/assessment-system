import React from "react";

export default function QuestionCard({
    question,
    answer,
    onAnswerSelect,
}) {

    if (!question) {
        return (
            <div className="text-center py-10 text-gray-500">
                No Question Found
            </div>
        );
    }

    const options = [
        {
            key: "A",
            value: question.option_a,
        },
        {
            key: "B",
            value: question.option_b,
        },
        {
            key: "C",
            value: question.option_c,
        },
        {
            key: "D",
            value: question.option_d,
        },
    ];

    return (

        <div>

            {/* Question */}

            <h2 className="text-xl font-semibold mb-6">

                {question.question}

            </h2>

            {/* Options */}

            <div className="space-y-4">

                {options.map((option) => (

                    <label
                        key={option.key}
                        className={`flex items-center gap-4 border rounded-xl p-4 cursor-pointer transition

                        ${
                            answer === option.key
                                ? "border-blue-600 bg-blue-50"
                                : "border-gray-300 hover:bg-gray-50"
                        }`}
                    >

                        <input
                            type="radio"
                            name={`question-${question.id}`}
                            checked={answer === option.key}
                            onChange={() =>
                                onAnswerSelect(
                                    question.id,
                                    option.key
                                )
                            }
                        />

                        <div>
                            <span className="font-semibold mr-2">
                                {option.key}.
                            </span>
                            {option.value}
                        </div>
                    </label>
                ))}
            </div>
        </div>
    );
}