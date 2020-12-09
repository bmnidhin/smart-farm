import logo from './logo.svg';
import './App.css';
import Charts from './Components/Charts';


function App() {
  return (
    <div className="App p-3">
      <div className="p-3">
        <h1>Green House Monitor</h1>
      </div>
      <div className="container">

        <div className="row">
          <div className="col-12 col-md-6">
            <div className="card">

              <div className="card-body">
                
              </div>
            </div>
            <Charts type={'Temperature'} limit={"12"} />
          </div>
          <div className="col-12 col-md-6">
            <Charts type={'Humidity'} limit={"12"} />
          </div>
          <div className="col-12 col-md-6">
            <Charts type={'Moisture'} limit={"12"} />
          </div>
          <div className="col-12 col-md-6">
            <Charts type={'Light'} limit={"12"} />
          </div>
          <div className="col-12 col-md-6">
            <Charts type={'Water'} limit={"12"} />
          </div>
        </div>


      </div>
    </div>
  );
}

export default App;
