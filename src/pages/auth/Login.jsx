import React from 'react'
import LoginForm from '@/components/auth/LoginForm'

const Login = () => {
  return (
    <div className="flex min-h-screen bg-zongotek-gray-light">
      {/* Left Panel - Illustration and Marketing Message */}
      <div className="hidden overflow-hidden relative justify-center items-center p-8 w-1/2 lg:flex bg-zongotek-gold">
        <div className="z-10 max-w-md text-center text-zongotek-black">
          <h1 className="mb-4 text-5xl font-bold leading-tight">
            Have your own
          </h1>
          <p className="mb-12 text-3xl font-medium">
            personal website?
          </p>
          
          {/* Chatbot Illustration */}
          <div className="relative mx-auto w-full max-w-lg">
            <div className="transform origin-center scale-75">
              <img 
                src="/chatbot-illustration.svg" 
                alt="Chatbot illustration" 
                className="mx-auto w-full h-auto"
              />
            </div>
          </div>
        </div>
        
        {/* Background decorative elements */}
        <div className="absolute top-10 left-10 w-20 h-20 rounded-full bg-zongotek-black/10"></div>
        <div className="absolute right-20 bottom-20 w-16 h-16 rounded-full bg-zongotek-black/10"></div>
        <div className="absolute left-10 top-1/2 w-12 h-12 rounded-full bg-zongotek-black/5"></div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex justify-center items-center p-4 w-full lg:w-1/2 bg-zongotek-white sm:p-8 lg:p-12">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-4xl font-bold text-zongotek-black">Get Started</h1>
            <p className="text-zongotek-black/70">
              Already have an account?{' '}
              <a href="#" className="font-semibold text-zongotek-gold hover:underline">
                Log in
              </a>
            </p>
          </div>
          <LoginForm />
        </div>
      </div>
    </div>
  )
}

export default Login
