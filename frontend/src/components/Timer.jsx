import React, { useEffect, useState } from "react";

export default function Timer({
    minutes = 60,
    onComplete,
}) {

    const [timeLeft, setTimeLeft] = useState(
        minutes * 60
    );

    useEffect(() => {
        if (minutes > 0 && timeLeft === 0) {
            setTimeLeft(minutes * 60);
        }
    }, [minutes]);

    useEffect(() => {

        if (timeLeft <= 0) {
            onComplete?.();
            return;
        }

        const timer = setTimeout(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);

        return () => clearTimeout(timer);

    }, [timeLeft, onComplete]);

    const hrs = Math.floor(timeLeft / 3600);

    const mins = Math.floor((timeLeft % 3600) / 60);

    const secs = timeLeft % 60;

    const format = (value) =>
        value.toString().padStart(2, "0");

    const warning =
        timeLeft <= 300; // Last 5 minutes

    return (

        <div
            className={`px-5 py-3 rounded-xl shadow font-bold text-lg transition-all
            ${warning
                    ? "bg-red-100 text-red-600 animate-pulse"
                    : "bg-green-100 text-green-700"
                }`}
        >

            ⏳ {format(hrs)}:{format(mins)}:{format(secs)}

        </div>

    );

}