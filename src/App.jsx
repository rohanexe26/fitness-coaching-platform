import Navbar from "./components/Navbar";

function App() {
  return (
    <>
      <Navbar />

      <div className="container">
        <h1>Fitness Coaching Platform</h1>

        <p>
          Track workouts • Set goals • Chat with trainers
        </p>

        <button>Get Started</button>
      </div>
    </>
  );
}

export default App;