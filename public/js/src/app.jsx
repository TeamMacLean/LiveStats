import React from 'react';
import ReactDOM from 'react-dom';
import io from 'socket.io-client';
import ChartJS from 'chart.js';


class Chart extends React.Component {
    render() {
        return (
            <canvas id={"chart" + this.props.id} width="400" height="400"/>
        )
    }

    componentWillReceiveProps(nextProps) {
        const MAX = 20;
        const newVal = parseInt(nextProps.percent);

        if (this.state.chart) {
            //push data to chart
            this.state.chart.data.labels.push(Math.random());
            if (this.state.chart.data.labels.length > MAX) {
                this.state.chart.data.labels.shift()
            }
            this.state.chart.data.datasets.forEach((dataset) => {
                dataset.data.push(newVal);
                if (dataset.data.length > MAX) {
                    dataset.data.shift()
                }
            });
            this.state.chart.update();
        }

    }

    componentDidMount() {

        this.setState({id: this.props.id});

        const safe = '#2CDCBE';
        const warn = '#FEDB62';
        const danger = '#FC3C63';

        const ctx = document.getElementById("chart" + this.props.id).getContext('2d');
        const myChart = new ChartJS(ctx, {
            type: 'line',
            data: {
                labels: ["A"],
                datasets: [{
                    label: '',
                    data: [],
                    fill: false,
                    borderColor: [
                        'rgba(255,99,132,1)',
                    ],
                    borderWidth: 4
                }]
            },
            options: {
                legend: {
                    display: false
                },
                // animation: {
                //     easing: "easeInOutBack"
                // },
                elements: {point: {radius: 0, hitRadius: 30, hoverRadius: 0}},
                scales: {
                    yAxes: [{
                        gridLines: {
                            display: false,
                            drawBorder: false
                        },
                        ticks: {
                            // display: false,
                            suggestedMin: 0,
                            min: 0,
                            max:100,
                            beginAtZero: true
                        }
                    }],
                    xAxes: [{
                        gridLines: {
                            display: false,
                            drawBorder: false
                        },
                        ticks: {
                            display: false //this will remove only the label
                        }
                    }]
                },
                tooltip: {
                    mode: 'label'
                }
            }
            , plugins: [
                {
                    id: "responsiveGradient",

                    afterLayout: function (chart, options) {

                        const scales = chart.scales;

                        // create a linear gradient with the dimentions of the scale
                        const color = chart.ctx.createLinearGradient(
                            0,//scales["x-axis-0"].left,
                            scales["y-axis-0"].bottom,
                            0,//scales["x-axis-0"].right,
                            scales["y-axis-0"].top
                        ); //vertical


                        color.addColorStop(0, safe);
                        color.addColorStop(.75, warn);
                        color.addColorStop(1, danger);

                        chart.data.datasets[0].borderColor = color;
                        // chart.data.datasets[0].backgroundColor = color;
                    }
                }
            ]
        });

        this.setState({chart: myChart});
    }
}

class Graph extends React.Component {
    getChartColor() {

        if (this.props.percent >= 80) {
            return 'danger';
        }
        if (this.props.percent >= 50) {
            return 'warning';
        }
        return 'success';
    }

    render() {
        const color = "is-" + this.getChartColor();
        return (
            <progress className={"progress " + color} value={this.props.percent}
                      max="100">{this.props.percent}%
            </progress>
        )
    }


}

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {checkInterval: 1000, stats: {driveInfo: {}, memInfo: {}, netStat: {}}};
        const self = this;

        this.socket = io();
        this.socket.on('update', function (data) {
            // self.state.stats = data;
            self.setState(state => ({
                stats: data
            }));

        })
    }


    /**
     cpuCount: 4
     cpuModel: "Intel(R) Core(TM) i5-5257U CPU @ 2.70GHz"
     cpuPercentage: 76.37
     driveInfo: {totalGb: "233.6", usedGb: "191.1", freeGb: "39.8", usedPercentage: "81.8", freePercentage: "17.0"}
     memInfo: {totalMemMb: 16384, usedMemMb: 11525.6, freeMemMb: 4858.4, freeMemPercentage: 29.65}
     netStat: (15) [{…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}]
     osArch: "x64"
     osHostname: "N109435"
     osName: "Mac OS X 10.14.2"
     osPlatform: "darwin"
     osType: "Darwin"
     osUptime: 615690
     whoami: "pagem↵"
     **/
    render() {
        const self = this;

        return (
            <div>
                <h1 className="title">Stats</h1>
                <div className="columns">

                    <div className="column">
                        <div className="card">
                            <div className="card-content">
                                <h1 className="subtitle">CPU</h1>
                                <div>CPU Count: {self.state.stats.cpuCount}</div>
                                <div>CPU Model: {self.state.stats.cpuModel}</div>
                                {/*<div>CPU %: {self.state.stats.cpuPercentage}</div>*/}
                                {/*<Graph percent={self.state.stats.cpuPercentage} id={"CPU"}/>*/}
                                <Chart percent={self.state.stats.cpuPercentage} id={"CPU"}/>
                            </div>
                        </div>

                    </div>
                    <div className="column">
                        <div className="card">
                            <div className="card-content">
                                <h1 className="subtitle">Memory</h1>
                                <div>Total Memory (MB): {self.state.stats.memInfo.totalMemMb}</div>
                                <div>Used Memory (MB): {self.state.stats.memInfo.usedMemMb}</div>
                                <div>Free Memory (MB): {self.state.stats.memInfo.freeMemMb}</div>
                                {/*<div>Free Memory (%): {self.state.stats.memInfo.freeMemPercentage}</div>*/}
                                {/*<Graph percent={100 - self.state.stats.memInfo.freeMemPercentage} id={"MEM"}/>*/}
                                <Chart percent={100 - self.state.stats.memInfo.freeMemPercentage} id={"MEM"}/>
                            </div>
                        </div>
                    </div>


                </div>
                <div className="columns">


                    <div className="column">
                        <div className="card">
                            <div className="card-content">
                                <h1 className="subtitle">Disk</h1>
                                <div>Drive Total (GB): {self.state.stats.driveInfo.totalGb}</div>
                                <div>Drive Used (GB): {self.state.stats.driveInfo.usedGb}</div>
                                {/*<div>Drive Used (%): {self.state.stats.driveInfo.usedPercentage}</div>*/}
                                <div>Drive Free (GB): {self.state.stats.driveInfo.freeGb}</div>
                                {/*<div>Drive Free (%): {self.state.stats.driveInfo.freePercentage}</div>*/}
                                <Graph percent={self.state.stats.driveInfo.usedPercentage} id={"DRIVE"}/>
                            </div>
                        </div>
                    </div>


                    <div className="column">
                        <div className="card">
                            <div className="card-content">
                                <h1 className="subtitle">Operating System</h1>
                                <div>Arch: {self.state.stats.osArch}</div>
                                <div>Hostname: {self.state.stats.osHostname}</div>
                                <div>OS Name: {self.state.stats.osName}</div>
                                <div>OS Platform: {self.state.stats.osPlatform}</div>
                                <div>OS Type: {self.state.stats.osType}</div>
                                <div>OS Uptime: {self.state.stats.osUptime}</div>
                                <div>whoami: {self.state.stats.whoami}</div>
                            </div>
                        </div>
                    </div>
                </div>


                {/*MEMORY*/}

                {/*OS*/}

                {/*NET*/}

            </div>
        );
    }

}

ReactDOM.render(
    <App/>,
    document.getElementById('app')
);