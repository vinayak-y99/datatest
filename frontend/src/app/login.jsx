import React from 'react';

const Loginpage = () => {
  const slides = [
    {
      title: "Administrator",
      description: "Manage user accounts, subscriptions, and system configurations. Monitor performance, ensure data security, and oversee platform operations.",
      image: "/admin.jpg"
    },
    {
      title: "Hiring Manager",
      description: "Leads the recruitment process, identifying top talent to drive the company's success. Works closely with teams to ensure the right people join the right roles.",
      image: "/hm.jpg"
    },
    {
      title: "Technical Panel",
      description: "Assesses candidates' technical expertise, problem-solving skills, and innovation potential. Ensures the best minds contribute to our growing team.",
      image: "/tc.jpg"
    },
    {
      title: "Recruiter",
      description: "The first step in the hiring journey—sourcing, screening, and guiding candidates through the process to find the perfect fit for our organization.",
      image: "/rec.jpg"
    },
    {
      title: "Client",
      description: "Plays a crucial role in shaping hiring decisions by providing industry insights, expectations, and key requirements for a successful collaboration.",
      image: "/cl.jpg"
    }
  ];

  const handleSignIn = (title) => {
    localStorage.setItem('loggedInUser', title);
    window.location.href = 
      title === "Administrator" ? "/Admin" :
      title === "Hiring Manager" ? "/hiring" :
      title === "Technical Panel" ? "/Technical" :
      title === "Recruiter" ? "/recruiter" :
     // Update this line in handleSignIn function
title === "Client" ? "/client" : "/"; // Changed "client" to "Client"


  };

  return (
    <div className="min-h-screen bg-sky-50">
      <div className="max-w-6xl mx-auto p-4 mt-2 max-h-[250px]">
        <div className="grid grid-cols-2 gap-4 max-h-[250px]"> 
          {slides.map((slide, index) => (
            <div key={index} className="bg-white rounded-lg border border-gray-300 p-6">
              <div className="flex gap-6 items-center">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-indigo-900 mb-3">
                    {slide.title}
                  </h1>
                  <p className="text-gray-600 mb-6">
                    {slide.description}
                  </p>

                  <button 
                    onClick={() => handleSignIn(slide.title)}
                    className="bg-purple-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-purple-700 transition-colors"
                  >
                    SIGN IN
                  </button>
                
                  <div className="flex gap-2 mt-6">
                    {[0, 1, 2, 3, 4].map((dotIndex) => (
                      <div
                        key={dotIndex}
                        className={`w-2 h-2 rounded-full ${
                          dotIndex === index ? 'bg-purple-600' : 'bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              
                <div className="flex-1">
                  <img
                    src={slide.image}
                    alt={slide.title}
                    className="w-full rounded-lg"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Loginpage;
