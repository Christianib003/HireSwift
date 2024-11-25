import { Link } from 'react-router-dom'

const Welcome = () => {
  return (
    <main className="flex-1 flex flex-col items-center justify-center container-padding py-16">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-text mb-4">
          Welcome to HireSwift
        </h1>
        <p className="text-xl md:text-2xl text-text/80 mb-12">
          The right place for connecting to your future career
        </p>
        
        <div className="flex gap-4 flex-wrap justify-center">
          <Link 
            to="/register" 
            className="pill-button bg-primary text-text"
          >
            Get Started
          </Link>
          <Link 
            to="/admin" 
            className="pill-button bg-background/50 text-text border border-text/20"
          >
            Admin Portal
          </Link>
        </div>
      </div>
    </main>
  )
}

export default Welcome 