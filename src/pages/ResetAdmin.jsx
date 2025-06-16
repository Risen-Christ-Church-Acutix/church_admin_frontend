import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Send, AlertCircle } from "lucide-react";

const ResetAdmin = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    
    if (!email) {
      setError("Please enter your email address");
      return;
    }
    
    // Check if it's the admin email
    if (email.toLowerCase() !== "admin@risenchurch.org") {
      setError("This reset option is only available for administrators");
      return;
    }
    
    // Simulate sending reset email
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-20" 
        style={{ backgroundImage: `url('/assets/church-bg.jpg')` }} />
      
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl overflow-hidden z-10">
        <div className="bg-gradient-to-r from-amber-800 via-orange-800 to-red-800 py-6 px-6 text-white">
          <h2 className="text-2xl font-bold text-center">Risen Christ Church</h2>
          <p className="text-amber-100 text-center">Administrator Password Reset</p>
        </div>
        
        <div className="p-6">
          {submitted ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">Reset Email Sent</h3>
              <p className="text-gray-600 mb-6">
                We've sent a password reset link to <strong>{email}</strong>. 
                Please check your email and follow the instructions.
              </p>
              <p className="text-sm text-gray-500 mb-6import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Send, AlertCircle } from "lucide-react";

const ResetAdmin = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    
    if (!email) {
      setError("Please enter your email address");
      return;
    }
    
    // Check if it's the admin email
    if (email.toLowerCase() !== "admin@risenchurch.org") {
      setError("This reset option is only available for administrators");
      return;
    }
    
    // Simulate sending reset email
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-20" 
        style={{ backgroundImage: `url('/assets/church-bg.jpg')` }} />
      
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl overflow-hidden z-10">
        <div className="bg-gradient-to-r from-amber-800 via-orange-800 to-red-800 py-6 px-6 text-white">
          <h2 className="text-2xl font-bold text-center">Risen Christ Church</h2>
          <p className="text-amber-100 text-center">Administrator Password Reset</p>
        </div>
        
        <div className="p-6">
          {submitted ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">Reset Email Sent</h3>
              <p className="text-gray-600 mb-6">
                We've sent a password reset link to <strong>{email}</strong>. 
                Please check your email and follow the instructions.
              </p>
              <p className="text-sm text-gray-500 mb-6