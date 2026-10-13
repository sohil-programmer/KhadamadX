cat > src/App.jsx <<'EOF'
function App() {
  return (
    <div className="app">
      <nav className="navbar">
        <div className="logo">
          <span>K</span>hadamatX
        </div>

        <div className="nav-links">
          <a href="#">Home</a>
          <a href="#">Services</a>
          <a href="#">How It Works</a>
          <a href="#">About</a>
          <a href="#">Contact</a>
        </div>

        <div className="nav-buttons">
          <button>Login</button>
          <button className="register">Register</button>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-content">
          <div className="small-title">WELCOME TO KHADAMATX</div>

          <h1>
            ستاسې اړتیا،
            <br />
            <span>زموږ خدمت.</span>
          </h1>

          <p>
            خپل اړین خدمات په اسانۍ پیدا کړئ، یا خپل مهارتونه
            وړاندې کړئ او آنلاین عاید ترلاسه کړئ.
          </p>

          <div className="hero-buttons">
            <button className="primary">Find a Service</button>
            <button className="secondary">Offer Your Service</button>
          </div>
        </div>

        <div className="service-card">
          <div className="icon">⚡</div>
          <h2>Professional Services</h2>
          <p>
            Website Development, Design, Programming,
            Translation, CV & More.
          </p>

          <div className="available">
            <span></span>
            Available Services
          </div>
        </div>
      </section>
    </div>
  )
}

export default App
EOF