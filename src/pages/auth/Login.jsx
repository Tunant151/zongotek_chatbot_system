import React from 'react'
import LoginForm from '@/components/auth/LoginForm'

const Login = () => {
  return (
    <div className="flex min-h-screen bg-zongotek-gray-light">
      {/* Left Panel - Illustration and Marketing Message */}
      <div className="relative items-center justify-center hidden w-1/2 p-8 overflow-hidden lg:flex bg-zongotek-gold">
        <div className="z-10 max-w-md text-center text-zongotek-black">
          <h1 className="mb-4 text-5xl font-bold leading-tight">
            <span className='text-primary'>Zongo</span>tek
          </h1>
          <p className="text-sm font-medium ">
            IT Services From Start to Z.
          </p>
          
          {/* Chatbot Illustration  chanhi*/} 
          <div className="relative w-full max-w-lg mx-auto">
            <div className="origin-center transform scale-75">
              <img 
                src="./chatbot-illustration.svg" 
                alt="Chatbot illustration" 
                className="w-full h-auto mx-auto"
              />
            </div>
          </div>
        </div>
        
        {/* Background decorative elements */}
        <div className="absolute w-20 h-20 rounded-full top-10 left-10 bg-zongotek-black/10"></div>
        <div className="absolute w-16 h-16 rounded-full right-20 bottom-20 bg-zongotek-black/10"></div>
        <div className="absolute w-12 h-12 rounded-full left-10 top-1/2 bg-zongotek-black/5"></div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex items-center justify-center w-full p-4 lg:w-1/2 bg-zongotek-white sm:p-8 lg:p-12">
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
