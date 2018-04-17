$(document).ready(function() {
    const canvas = document.getElementById("myChart")
    const chartOptions = {
        legend: {
            display: true,
            position: 'right',
            labels: {
                boxWidth: 40,
                fontColor: 'black'
            }
        },
        // Straight line instead of curved
        elements: {
            line: {
                tension: 0
            }
        },
        scales: {
            yAxes: [{
                scaleLabel: {
                    display: true,
                    labelString: 'Time (s)'
                }
            }],
            xAxes: [{
                scaleLabel: {
                    display: true,
                    labelString: 'Date'
                }
            }]
        }
    };
    const makeChart = function(deploymentDiffs) {
        var buildData = [];
        var deployData = [];
        var totalData = [];
        var labels = [];
        deploymentDiffs.forEach(d => {
            buildData.push(d.timeToBuild);
            deployData.push(d.timeToDeploy);
            totalData.push(d.totalTime);
            labels.push(d.deployStart.slice(0,10));
        });
        var myChart = new Chart(canvas, {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    label: 'Time to build',
                    data: buildData,
                    fill: false,
                    borderColor: 'green',
                }, {
                    label: 'Time to deploy',
                    data: deployData,
                    fill: false,
                    borderColor: 'blue',
                }, {
                    label: 'Total time',
                    data: totalData,
                    fill: false,
                    borderColor: 'orange ',
                }],
            },
            options: chartOptions,
        });
        canvas.onclick = function(evt) {
            var point = myChart.getElementsAtEvent(evt)[0];
            if (point) {
                var link = deploymentDiffs[point._index].formattedLink;
                window.open(link);
            }
        };
    }
    const formatDeployments = function(data) {
        const deployments = data.filter(d => d.sellerId === 1)
        var deploymentDiffs = [];
        deployments.forEach(d => {
            // convert times to seconds
            const timeToBuild = ~~(new Date(d.deployStart) - new Date(d.buildStart))/1000;
            const timeToDeploy = ~~(new Date(d.deployFinish) - new Date(d.deployStart))/1000;
            const totalTime = ~~(new Date(d.deployFinish) - new Date(d.buildStart))/1000;
            diffs = { timeToBuild, timeToDeploy, totalTime }
            const shortedSha = d.name.slice(0, 8);
            const formattedLink = `https://github.com/liquidlabs-co/gig/commit/${d.name}`
            links = { shortedSha, formattedLink };
            dd = Object.assign({}, d, diffs, links)
            deploymentDiffs.push(dd)
        });
        return deploymentDiffs;
    }
    $.getJSON("https://giggy-tracker-api-staging.aws.gigsternetwork.com/api/deployments", function(data) {
        var rows = [];
        const deploymentDiffs = formatDeployments(data);
        $.each(deploymentDiffs, function(index, value) {
            rows.push(`<tr><th scope="row">${index}</th><td>${value.timeToBuild}</td><td>${value.timeToDeploy}</td><td>${value.totalTime}</td><td><a href="${value.formattedLink}" target="_blank">${value.shortedSha}</a></td></tr>`)
        });
        makeChart(deploymentDiffs);
        $("#myTable").append('<thead class="thead-light"><tr><th scope="col">index</th><th scope="col">timeToBuild</th><th scope="col">timeToDeploy</th><th scope="col">totalTime</th><th scope="col">link</th></tr></thead>')
        $("#myTbody").append(rows.join(""));
    });
});