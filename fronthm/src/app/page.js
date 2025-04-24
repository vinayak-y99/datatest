"use client";
import { useEffect } from "react";
import LoginDashboard from './login';


export default function Dashboard() {
  useEffect(() => {
    const loginPage = document.getElementById("loginPage");
    if (loginPage) {
      loginPage.style.display = "none";
    }

    const topBarDiv = document.getElementById("topBarDiv");
    if (topBarDiv) {
      topBarDiv.style.display = "none";
    }
  }, []); // Runs once when the component mounts

  return (
    <div>
      <LoginDashboard />
    </div>
  );
}