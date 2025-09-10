import React, { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

const LoginForm = () => {
  const { login, isLoading } = useAuth()
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!formData.username || !formData.password) {
      setError('Please fill in all fields')
      return
    }

    try {
      const result = await login(formData.username, formData.password)
      
      if (result && !result.success) {
        setError(result.error || 'Login failed')
      }
    } catch (error) {
      setError('Login failed: ' + (error.message || 'Unknown error'))
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Username */}
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-zongotek-black mb-2">
            Username
          </label>
          <div className="relative">
            <Input
              id="username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter your username"
              disabled={isLoading}
              className="w-full pl-4 pr-4 py-3 border border-zongotek-gray-light rounded-lg focus:outline-none focus:ring-2 focus:ring-zongotek-gold focus:border-transparent transition-all duration-200"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <svg className="w-5 h-5 text-zongotek-black/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-zongotek-black mb-2">
            Password
          </label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              disabled={isLoading}
              className="w-full pl-4 pr-12 py-3 border border-zongotek-gray-light rounded-lg focus:outline-none focus:ring-2 focus:ring-zongotek-gold focus:border-transparent transition-all duration-200"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zongotek-black/50 hover:text-zongotek-black transition-colors"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-zongotek-gold hover:bg-zongotek-gold-dark text-zongotek-black font-semibold py-3 rounded-lg transition-all duration-200 transform hover:scale-[1.02]"
        >
          {isLoading ? (
            <>
              <Loader2 size={20} className="mr-2 animate-spin" />
              Signing in...
            </>
          ) : (
            'Sign Up'
          )}
        </Button>
      </form>

      {/* Separator */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-zongotek-gray-light"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-zongotek-white text-zongotek-black/70">Or</span>
        </div>
      </div>

      {/* Social Login Options */}
      <div className="flex justify-center space-x-4">
        <button className="w-12 h-12 bg-white border border-zongotek-gray-light rounded-full flex items-center justify-center hover:bg-zongotek-gray-light transition-colors">
          <svg className="w-6 h-6" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
        </button>
        <button className="w-12 h-12 bg-white border border-zongotek-gray-light rounded-full flex items-center justify-center hover:bg-zongotek-gray-light transition-colors">
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="#1877F2">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
        </button>
      </div>

      {/* Demo Credentials */}
      <div className="mt-8 p-4 bg-zongotek-gray-light rounded-lg">
        <h3 className="text-sm font-medium text-zongotek-black mb-2">
          Demo Credentials:
        </h3>
        <div className="text-xs text-zongotek-black/70 space-y-1">
          <div><strong>Admin:</strong> admin / admin123</div>
          <div><strong>Sales Agent:</strong> agent1 / agent123</div>
          <div><strong>Tech Agent:</strong> agent2 / agent123</div>
        </div>
      </div>
    </div>
  )
}

export default LoginForm
