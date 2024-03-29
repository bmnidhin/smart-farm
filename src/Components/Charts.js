
import React, { Component } from 'react'
import axios from 'axios'
import moment from 'moment'
import { Line } from 'react-chartjs-2';





class Charts extends Component {
    constructor(props) {
        super(props)
        this.state = {
            name: "Sriraman",
            data: [20, 45, 28, 80, 99, 43, 555, 20, 45, 28, 80, 99, 43, 555],
            labels: ["January", "February", "March", "April", "May", "June", "January", "February", "March", "April", "May", "June", "June"],
            res: []

        }
    }
    componentDidMount() {
        axios
            .get("https://t4lk135-server-ksmmb5h97.vercel.app/" + this.props.type)
            .then((response) => {
                this.setState({

                    res: response.data.value,
                });
                console.log(response.data.value);

            })
            .catch((error) => {
                this.setState({

                });
                console.log(error);
            });
    }
    render() {
        let labelArr = [];
        let tempArray = [];
        for (let i = 0; i < this.state.res.length; i++) {
            const element = this.state.res[i]['key'];
            const formated = moment(element).fromNow();
            labelArr.push(formated)

        }
        for (let i = 0; i < this.state.res.length; i++) {
            const element = this.state.res[i]['temp'];
            tempArray.push(element)
        }
        console.log(labelArr)
        const data = {
            labels:labelArr.slice(-(this.props.limit)),
            datasets: [
              {
                label: "emg",
                fill: false,
                lineTension: 0.1,
                backgroundColor: 'rgba(75,192,192,0.4)',
                borderColor: 'rgba(75,192,192,1)',
                borderCapStyle: 'butt',
                borderDash: [],
                borderDashOffset: 0.0,
                borderJoinStyle: 'miter',
                pointBorderColor: 'rgba(75,192,192,1)',
                pointBackgroundColor: '#fff',
                pointBorderWidth: 1,
                pointHoverRadius: 5,
                pointHoverBackgroundColor: 'rgba(75,192,192,1)',
                pointHoverBorderColor: 'rgba(220,220,220,1)',
                pointHoverBorderWidth: 2,
                pointRadius: 1,
                pointHitRadius: 10,
                data: tempArray.slice(-(this.props.limit))
              }
            ]
          };
          
        return (
            <>
               
                <div className=" shadow-lg p-3 mb-4 bg-white rounded">
                <h3>{"EMG" }</h3>
                {this.props.para&&(<p className="text-muted">{this.props.para}</p>)}

                
                <Line ref="chart" data={data} />
                </div>
               
            </>
        );
    }
}

export default Charts;
