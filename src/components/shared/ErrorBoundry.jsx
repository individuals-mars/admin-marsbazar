import React, { Component } from 'react'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error("🚨 Caught by ErrorBoundary:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen text-center p-10">
          <h1 className="text-3xl font-bold text-red-600 mb-4">Что-то пошло не так 😢</h1>
          <p className="text-gray-500">Мы уже работаем над этим. Попробуйте перезагрузить страницу.</p>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
