import React, { useState, useRef, useEffect } from "react";
import { FiMessageSquare, FiSend, FiX } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { assets } from "../assets/assets";

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      text: "Hello! I'm your medical assistant. Describe your symptoms and I'll analyze them for you.",
      sender: "bot",
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [apiConnected, setApiConnected] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  // API configuration
  const API_BASE_URL = "https://hackers-4.onrender.com";
  const CHAT_API_URL = `${API_BASE_URL}/chat`;

  // Test API connection on component mount
  useEffect(() => {
    testAPIConnection();
  }, []);

  const testAPIConnection = async () => {
    try {
      // Test with a simple GET request to root or health endpoint
      const response = await axios.get(`${API_BASE_URL}/`, {
        timeout: 5000,
      });
      console.log("API Connection Test Response:", response.status);
      setApiConnected(true);
      
      // Update welcome message if API is connected
      setMessages([
        {
          text: "Hello! I'm your AI medical assistant, connected and ready to help. Describe your symptoms and I'll analyze them for you.",
          sender: "bot",
        },
      ]);
    } catch (error) {
      console.warn("API Connection Test Failed:", error.message);
      
      // Try testing the chat endpoint with OPTIONS (CORS preflight)
      try {
        const optionsResponse = await axios.options(CHAT_API_URL, {
          timeout: 5000,
        });
        console.log("CORS Preflight successful:", optionsResponse.status);
        setApiConnected(true);
      } catch (optionsError) {
        console.warn("CORS Preflight failed:", optionsError.message);
        setApiConnected(false);
      }
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Call your LLM API - POST to /chat
  const callLLMAPI = async (userMessage) => {
    setIsLoading(true);

    try {
      // Match EXACT format from your API docs
      const requestBody = {
        symptoms: userMessage,
        book: false,
      };

      console.log("Sending to /chat endpoint:", requestBody);

      const response = await axios.post(
        CHAT_API_URL,
        requestBody,
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 30000, // 30 seconds timeout
        }
      );

      console.log("Full API Response:", response);
      console.log("Response Data:", response.data);
      
      // Handle different response formats
      let diagnosisData;
      
      // CASE 1: API returns structured data with severity
      if (response.data && (response.data.severity || response.data.recommended_specialist)) {
        diagnosisData = {
          severity: response.data.severity || {
            severity: "Moderate",
            risk_reason: "AI analysis completed",
            recommended_specialist: response.data.recommended_specialist || "General Physician"
          },
          recommended_specialists: response.data.recommended_specialist || "General Physician",
          recommended_doctors: response.data.recommended_doctors || getMockDoctors(response.data.recommended_specialist),
          booking_status: response.data.booking_status || "Ready for consultation",
          date: response.data.date || Date.now(),
          agent_action: {
            input: `Patient symptoms: ${userMessage}`,
            output: response.data.agent_action?.output || "Diagnosis analysis complete"
          }
        };
      } 
      // CASE 2: API returns plain text response
      else if (response.data && response.data.response) {
        diagnosisData = createDiagnosisFromText(response.data.response, userMessage);
      }
      // CASE 3: API returns message field
      else if (response.data && response.data.message) {
        diagnosisData = createDiagnosisFromText(response.data.message, userMessage);
      }
      // CASE 4: Unexpected format - use mock data
      else {
        console.warn("Unexpected API response format, using mock data");
        diagnosisData = getMockDiagnosisData(userMessage);
      }
      
      return diagnosisData;

    } catch (error) {
      console.error("API Error Details:", {
        message: error.message,
        status: error.response?.status,
        url: error.config?.url,
        data: error.response?.data,
        headers: error.response?.headers
      });
      
      // Throw error so handleSendMessage knows API failed
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Create diagnosis data from text response
  const createDiagnosisFromText = (text, symptoms) => {
    // Analyze text to extract medical information
    const textLower = text.toLowerCase();
    
    // Determine severity from text
    let severityLevel = "Moderate";
    if (textLower.includes("emergency") || textLower.includes("immediately") || textLower.includes("911") || textLower.includes("urgent")) {
      severityLevel = "Severe";
    } else if (textLower.includes("mild") || textLower.includes("minor") || textLower.includes("low risk")) {
      severityLevel = "Low";
    }

    // Determine specialist from text
    let specialist = "General Physician";
    const specialistMapping = [
      { keywords: ["heart", "chest", "cardiac", "blood pressure"], specialist: "Cardiologist" },
      { keywords: ["head", "brain", "neuro", "migraine", "seizure"], specialist: "Neurologist" },
      { keywords: ["stomach", "abdominal", "digest", "gut", "nausea"], specialist: "Gastroenterologist" },
      { keywords: ["skin", "rash", "dermat", "itch", "hives"], specialist: "Dermatologist" },
      { keywords: ["bone", "joint", "muscle", "ortho", "fracture", "sprain"], specialist: "Orthopedist" },
      { keywords: ["child", "pediatric", "baby", "infant"], specialist: "Pediatrician" },
      { keywords: ["mental", "anxiety", "depress", "psych", "stress", "panic"], specialist: "Psychiatrist" },
      { keywords: ["eye", "vision", "glaucoma", "cataract"], specialist: "Ophthalmologist" },
      { keywords: ["ear", "throat", "nose", "sinus", "tonsil"], specialist: "ENT Specialist" },
    ];

    for (const mapping of specialistMapping) {
      if (mapping.keywords.some(keyword => textLower.includes(keyword))) {
        specialist = mapping.specialist;
        break;
      }
    }

    return {
      severity: {
        severity: severityLevel,
        risk_reason: text.length > 200 ? `${text.substring(0, 200)}...` : text,
        recommended_specialist: specialist,
      },
      recommended_specialists: specialist,
      recommended_doctors: getMockDoctors(specialist),
      booking_status: "Ready for consultation",
      date: Date.now(),
      agent_action: {
        input: `Patient symptoms: ${symptoms}`,
        output: text,
      },
    };
  };

  // Mock data for development/fallback
  const getMockDiagnosisData = (symptoms) => {
    const symptomsLower = symptoms.toLowerCase();
    let severity = "Moderate";
    let specialist = "General Physician";
    let riskReason = "Based on your symptoms, professional medical consultation is recommended.";

    if (symptomsLower.includes("chest") || symptomsLower.includes("shortness") || symptomsLower.includes("pressure") || symptomsLower.includes("heart")) {
      severity = "Severe";
      specialist = "Cardiologist";
      riskReason = "Chest-related symptoms may indicate serious cardiac issues requiring immediate attention.";
    } else if (symptomsLower.includes("headache") && symptomsLower.includes("blurred")) {
      severity = "Severe";
      specialist = "Neurologist";
      riskReason = "Headache with vision changes requires urgent neurological evaluation.";
    } else if (symptomsLower.includes("fever") && symptomsLower.includes("cough")) {
      severity = "Moderate";
      specialist = "General Physician";
      riskReason = "Respiratory symptoms with fever should be evaluated for infection.";
    }

    return {
      severity: {
        severity: severity,
        risk_reason: riskReason,
        recommended_specialist: specialist,
      },
      recommended_specialists: specialist,
      recommended_doctors: getMockDoctors(specialist),
      booking_status: "Ready for consultation",
      date: Date.now(),
      agent_action: {
        input: `Patient symptoms: ${symptoms}`,
        output: `Based on your symptoms "${symptoms}", I recommend consulting a ${specialist}. ${riskReason}`,
      },
    };
  };

  // Get mock doctors based on specialty
  const getMockDoctors = (specialty) => [
    {
      _id: "1",
      name: "Dr. Sarah Johnson",
      speciality: specialty,
      degree: "MD, MBBS",
      experience: "15 years",
      image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400",
      available: true,
      fees: 150,
      about: `Specialized in ${specialty.toLowerCase()} with extensive experience in diagnosis and treatment.`,
      address: { line1: "123 Medical Center", city: "New York" },
    },
    {
      _id: "2",
      name: "Dr. Michael Chen",
      speciality: specialty,
      degree: "MD, PhD",
      experience: "12 years",
      image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400",
      available: true,
      fees: 180,
      about: `Expert in ${specialty.toLowerCase()} with research background and patient-centered care.`,
      address: { line1: "456 Health Plaza", city: "New York" },
    },
  ];

  // Handle sending message with 3-second timeout
  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    // Add user message
    const userMessage = { text: inputText, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);
    setInputText("");

    // Add bot typing indicator
    setMessages((prev) => [
      ...prev,
      { text: "Analyzing your symptoms...", sender: "bot", typing: true },
    ]);

    setIsLoading(true);
    
    let apiSuccess = false;
    let fallbackTimer = null;
    
    // Set a timeout to use mock data after 3 seconds
    fallbackTimer = setTimeout(() => {
      if (!apiSuccess) {
        console.log("API call taking too long, using mock data after 3 seconds");
        
        // Remove typing indicator
        setMessages((prev) => {
          const newMessages = prev.filter((msg) => !msg.typing);
          return [
            ...newMessages,
            {
              text: "The AI is taking longer than expected. Using demo mode to provide immediate assistance...",
              sender: "bot",
            },
          ];
        });
        
        // Generate and use mock data
        const mockData = getMockDiagnosisData(inputText);
        
        // Navigate after showing message
        setTimeout(() => {
          localStorage.setItem("diagnosisData", JSON.stringify(mockData));
          navigate("/diagnosis", { state: { diagnosisData: mockData } });
          setIsLoading(false);
        }, 1500);
      }
    }, 3000);

    try {
      // Try API call
      const diagnosisData = await callLLMAPI(inputText);
      apiSuccess = true;
      
      // Clear the fallback timer if API succeeds
      if (fallbackTimer) {
        clearTimeout(fallbackTimer);
      }
      
      // Remove typing indicator
      setMessages((prev) => {
        const newMessages = prev.filter((msg) => !msg.typing);
        return [
          ...newMessages,
          {
            text: "I've analyzed your symptoms. Preparing your diagnosis report...",
            sender: "bot",
          },
        ];
      });

      // Navigate with real API data
      setTimeout(() => {
        localStorage.setItem("diagnosisData", JSON.stringify(diagnosisData));
        navigate("/diagnosis", { state: { diagnosisData } });
        setIsLoading(false);
      }, 1500);

    } catch (error) {
      // Clear the fallback timer on error
      if (fallbackTimer) {
        clearTimeout(fallbackTimer);
      }
      
      console.error("API Error:", error);
      
      // If API failed and timeout hasn't triggered yet, show error message
      if (!apiSuccess) {
        // Remove typing indicator
        setMessages((prev) => {
          const newMessages = prev.filter((msg) => !msg.typing);
          return [
            ...newMessages,
            {
              text: "I encountered an error while analyzing your symptoms. Using demo mode to provide assistance.",
              sender: "bot",
            },
          ];
        });
        
        // Generate mock data
        const mockData = getMockDiagnosisData(inputText);
        
        // Navigate with mock data after showing error message
        setTimeout(() => {
          localStorage.setItem("diagnosisData", JSON.stringify(mockData));
          navigate("/diagnosis", { state: { diagnosisData: mockData } });
          setIsLoading(false);
        }, 1500);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Chatbot Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-2 right-4 z-50 w-16 h-16 rounded-full flex items-center justify-center shadow-4xl  ${isOpen?"animate-none":"animate-bounce"} transition-all duration-300 hover:scale-110 overflow-hidden bg-transparent`}
      >
        {isOpen ? (
          <FiX 
  size={28} 
  className="text-white pointer-events-none drop-shadow-md bg-[#f8607c] p-1 rounded-full"
/>
        ) : (
          <img
            src={assets.chatbot_icon}
            alt="Medical Assistant"
            className="w-40 h-40 object-contain cursor-pointer"
          />
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div
          className="fixed bottom-24 right-6 z-50 w-96 h-[500px] rounded-2xl shadow-2xl flex flex-col bg-white overflow-hidden border-2"
          style={{ borderColor: "#F8607C" }}
        >
          {/* Chat Header with API status */}
          <div
            className="p-4 flex items-center justify-between border-b"
            style={{
              borderColor: "#F8607C",
              backgroundColor: `${"#F8607C"}10`,
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "#F8607C", color: "white" }}
              >
                <FiMessageSquare size={20} />
              </div>
              <div>
                <h3 className="font-bold" style={{ color: "black" }}>
                  Medical Assistant
                </h3>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${apiConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <p className="text-xs opacity-70" style={{ color: "black" }}>
                    {apiConnected ? 'API Connected • ' : 'API Offline • '}
                    Powered by AI
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100"
              style={{ color: "black" }}
            >
              <FiX size={18} />
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.sender === "user"
                      ? "rounded-br-none"
                      : "rounded-bl-none"
                  }`}
                  style={{
                    backgroundColor:
                      message.sender === "user" ? "#F8607C" : `${"#F8607C"}15`,
                    color: message.sender === "user" ? "white" : "black",
                  }}
                >
                  {message.typing ? (
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 rounded-full bg-current animate-bounce"></div>
                      <div
                        className="w-2 h-2 rounded-full bg-current animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                      <div
                        className="w-2 h-2 rounded-full bg-current animate-bounce"
                        style={{ animationDelay: "0.4s" }}
                      ></div>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap">{message.text}</p>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div
            className="p-4 border-t"
            style={{ borderColor: `${"#F8607C"}30` }}
          >
            <div className="flex gap-2">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Describe your symptoms here..."
                className="flex-1 border rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-offset-1"
                style={{
                  borderColor: "#F8607C",
                  color: "black",
                  minHeight: "60px",
                  maxHeight: "120px",
                }}
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputText.trim() || isLoading}
                className="self-end w-12 h-12 rounded-xl flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: "#F8607C",
                  color: "white",
                }}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <FiSend size={20} />
                )}
              </button>
            </div>
            <p
              className="text-xs mt-2 text-center opacity-60"
              style={{ color: "black" }}
            >
              {apiConnected ? 
                "API Connected • Press Enter to send" : 
                "Using demo mode • API is offline"}
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;