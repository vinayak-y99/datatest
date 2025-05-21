
"use client";
import { useState } from "react";
import React, { useEffect } from 'react';
import Link from "next/link";

export default function Sidebar({ roles, skills_data, sendRangeValue, onCreate, sendSelectedRoles, analysisData }) {
    const [selectedRoles, setSelectedRoles] = useState([]);
    const [sliderValue, setSliderValue] = useState(1);
    const [rangeValue, setRangeValue] = useState(1);
    const [prompt, setPrompt] = useState("");
    const [samplePromptCount, setSamplePromptCount] = useState(5);

    useEffect(() => {
        console.log('Analysis data in Sidebar:', analysisData);
    }, [analysisData]);

    const handleRangeChange = (e) => {
        setRangeValue(e.target.value);
    };

    const handleClick = () => {
        console.log("Creating dashboard with analysis data:", analysisData);
        sendRangeValue(rangeValue);
        onCreate(analysisData);
    };

    const handlePromptChange = (e) => {
        setPrompt(e.target.value);
    };

    const handleSamplePromptCountChange = (event) => {
        setSamplePromptCount(Number(event.target.value));
    };

    const prompts = [
        {
            title: "Cloud Services Understanding",
            color: "text-indigo-500",
            description: "Knowledge of different cloud service models (IaaS, PaaS, SaaS) and providers (AWS, Azure, Google Cloud)."
        },
        {
            title: "Infrastructure Management",
            color: "text-sky-600",
            description: "Skills in managing virtual machines, storage, and networking in the cloud."
        },
        {
            title: "Deployment and Automation",
            color: "text-green-400",
            description: "Experience with deploying applications and using automation tools (e.g., Terraform, CloudFormation)."
        }
    ];

    return (
        <div style={styles.outerContainer}>
            <div style={{paddingTop:'2px'}}>
                <input
                    type="range"
                    min="1"
                    max="10"
                    value={rangeValue}
                    onChange={handleRangeChange}
                    style={styles.slider}
                />
                <p>Number of Dashboards: {rangeValue}</p>
            </div>

            <button
                onClick={handleClick}
                style={styles.createButton}
                disabled={!analysisData}
            >
                Create Dashboard
            </button>

            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                    Custom Prompt
                </label>
                <textarea
                    value={prompt}
                    onChange={handlePromptChange}
                    className="w-full p-2 border rounded-md min-h-[100px]"
                    placeholder="Enter your prompt..."
                />
            </div>

            <div className="mt-4 space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                    Number of Sample Prompts (1-9)
                </label>
                <input
                    type="range"
                    min="1"
                    max="9"
                    value={samplePromptCount}
                    onChange={handleSamplePromptCountChange}
                    className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer"
                />
                <span className="block text-center text-sm font-semibold">
                    {samplePromptCount} Sample Prompts
                </span>
            </div>

            <div className="space-y-2">
                <div className="flex flex-col mt-3 w-full">
                    <nav className="flex flex-col w-full text-sm tracking-normal leading-3 capitalize text-slate-700">
                        <div className="w-full border border-solid bg-neutral-300 border-neutral-300 min-h-[1px]" />
                        <div className="flex justify-between items-center w-full">
                            <a href="#" className="gap-3 self-stretch px-3 py-4 my-auto font-bold border-b-2 border-solid border-b-indigo-700 w-[152px]">
                                Sample Prompts
                            </a>
                            <a href="#" className="gap-3 self-stretch px-3 py-4 my-auto border-b border-solid border-b-slate-500 w-[150px]">
                                Your history
                            </a>
                        </div>
                    </nav>
                    <div className="flex flex-col mt-5 w-full">
                        {prompts.map((prompt, index) => (
                            <div key={index} className="flex flex-col mt-2 w-full rounded-md">
                                <h3 className={`text-sm font-semibold tracking-wide leading-none ${prompt.color}`}>
                                    {prompt.title}
                                </h3>
                                <div className="self-end mt-2 max-w-full min-h-0 bg-violet-300 border border-violet-300 border-solid w-[302px]" />
                                <p className="flex flex-col mt-2 w-full text-xs tracking-wide leading-5 h-[55px] text-slate-700">
                                    <span className="w-full min-h-[66px]">{prompt.description}</span>
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

const styles = {
    outerContainer: {
        padding: "10px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        maxWidth: "400px",
        margin: "0 auto"
    },
    slider: {
        width: "100%",
        marginBottom: "10px"
    },
    createButton: {
        padding: "12px 24px",
        backgroundColor: "#6200ea",
        color: "white",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        fontSize: "16px",
        fontWeight: "600",
        transition: "background-color 0.3s ease",
        opacity: props => props.disabled ? 0.5 : 1
    }
};
