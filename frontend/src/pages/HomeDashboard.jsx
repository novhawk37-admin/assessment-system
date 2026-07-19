import React from "react";
import { useNavigate } from "react-router-dom";

export default function HomeDashboard() {

    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#F8FAFC]">

            {/* Navbar */}
            <nav
                className="
                bg-white
                border-b
                border-gray-100
                px-8
                py-5
                flex
                flex-col
                gap-4
                sm:flex-row
                justify-between
                items-center
                "
            >

                <div>
                    <h1
                        className="
                        text-2xl
                        font-bold
                        text-[#635BFF]
                        "
                    >
                        NovHawk Assessment
                    </h1>

                    <p className="text-sm text-gray-500">
                        Smart Testing Platform
                    </p>
                </div>


                <button
                    type="button"
                    onClick={() => navigate("/login")}
                    className="
                    bg-[#635BFF]
                    text-white
                    px-7
                    py-3
                    rounded-xl
                    cursor-pointer
                    hover:bg-[#5147E8]
                    hover:scale-105
                    transition
                    shadow-lg
                    "
                >
                    Login
                </button>

            </nav>



            {/* Hero Section */}

            <section
                className="
                px-8
                py-16
                bg-gradient-to-br
                from-[#635BFF]
                via-[#7C3AED]
                to-[#2563EB]
                text-white
                "
            >

                <div
                    className="
                    max-w-6xl
                    mx-auto
                    grid
                    md:grid-cols-2
                    gap-10
                    items-center
                    "
                >


                    <div>

                        <h2
                            className="
                            text-5xl
                            font-extrabold
                            leading-tight
                            "
                        >
                            Evaluate Skills.
                            <br />
                            Measure Success.
                        </h2>


                        <p
                            className="
                            mt-6
                            text-lg
                            text-indigo-100
                            "
                        >
                            A powerful online assessment platform
                            designed for students, employees and
                            organizations.
                        </p>


                        <button
                            type="button"
                            onClick={() => navigate("/login")}
                            className="
                            mt-8
                            bg-white
                            text-[#635BFF]
                            px-8
                            py-3
                            rounded-xl
                            font-semibold
                            cursor-pointer
                            hover:bg-gray-100
                            hover:scale-105
                            transition
                            "
                        >
                            Start Assessment
                        </button>

                    </div>



                    <div
                        className="
                        bg-white/20
                        backdrop-blur-lg
                        rounded-3xl
                        p-10
                        shadow-xl
                        "
                    >

                        <div
                            className="
                            bg-white
                            rounded-2xl
                            p-8
                            text-gray-800
                            "
                        >

                            <h3
                                className="
                                text-xl
                                font-bold
                                "
                            >
                                Assessment Overview
                            </h3>


                            <div className="mt-6 space-y-4">

                                <Info
                                    title="Questions"
                                    value="50+"
                                />

                                <Info
                                    title="Time Limit"
                                    value="60 Minutes"
                                />

                                <Info
                                    title="Reports"
                                    value="Instant Result"
                                />

                            </div>

                        </div>

                    </div>


                </div>

            </section>




            {/* Statistics */}

            <section
                className="
                max-w-6xl
                mx-auto
                px-8
                py-12
                "
            >

                <div
                    className="
                    grid
                    md:grid-cols-3
                    gap-6
                    "
                >

                    <Stat
                        number="50+"
                        title="Assessments"
                    />

                    <Stat
                        number="1000+"
                        title="Registered Users"
                    />

                    <Stat
                        number="5000+"
                        title="Completed Tests"
                    />

                </div>

            </section>





            {/* Features */}

            <section
                className="
                px-8
                pb-16
                "
            >

                <h2
                    className="
                    text-3xl
                    font-bold
                    text-center
                    text-gray-800
                    mb-10
                    "
                >
                    Platform Features
                </h2>



                <div
                    className="
                    max-w-6xl
                    mx-auto
                    grid
                    md:grid-cols-3
                    gap-6
                    "
                >

                    <Feature
                        icon="🔐"
                        title="Secure Login"
                        text="Role based authentication for students and admins."
                    />


                    <Feature
                        icon="📝"
                        title="Online Exams"
                        text="Conduct assessments with timer and question tracking."
                    />


                    <Feature
                        icon="📊"
                        title="Performance Reports"
                        text="Analyze scores and improvement history."
                    />


                </div>

            </section>





            {/* Footer CTA */}

            <section
                className="
                bg-[#0F172A]
                text-white
                py-12
                text-center
                "
            >

                <h2
                    className="
                    text-3xl
                    font-bold
                    "
                >
                    Ready to test your skills?
                </h2>


                <button
                    type="button"
                    onClick={() => navigate("/login")}
                    className="
                    mt-6
                    bg-[#635BFF]
                    px-8
                    py-3
                    rounded-xl
                    cursor-pointer
                    hover:bg-[#5147E8]
                    hover:scale-105
                    transition
                    "
                >
                    Login Now
                </button>


            </section>


        </div>
    );
}





function Stat({ number, title }) {

    return (
        <div
            className="
            bg-white
            rounded-2xl
            shadow-sm
            border
            border-gray-100
            hover:shadow-lg
            hover:-translate-y-1
            transition
            p-8
            text-center
            "
        >

            <h2
                className="
                text-4xl
                font-bold
                text-[#635BFF]
                "
            >
                {number}
            </h2>

            <p className="mt-2 text-gray-500">
                {title}
            </p>

        </div>
    );
}





function Feature({ icon, title, text }) {

    return (

        <div
            className="
            group
            bg-white
            rounded-2xl
            p-8
            border
            border-gray-100
            shadow-sm
            hover:shadow-xl
            transition
            "
        >

            <div
                className="
                text-4xl
                group-hover:scale-110
                transition
                "
            >
                {icon}
            </div>


            <h3
                className="
                mt-5
                text-xl
                font-bold
                "
            >
                {title}
            </h3>


            <p className="mt-3 text-gray-600">
                {text}
            </p>


        </div>

    );
}





function Info({ title, value }) {

    return (
        <div
            className="
            flex
            justify-between
            border-b
            pb-3
            "
        >

            <span className="text-gray-500">
                {title}
            </span>


            <span className="font-bold">
                {value}
            </span>

        </div>
    );
}