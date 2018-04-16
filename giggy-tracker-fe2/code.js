$(document).ready(function() {
    const canvas = document.getElementById("myChart")
    const chartOptions = {
        legend: {
            display: true,
            position: 'top',
            labels: {
                boxWidth: 80,
                fontColor: 'black'
            },
            fill: false,
        }
    };
    const makeChart = function(deploymentDiffs) {
        var data = []
        var labels = []
        console.log(deploymentDiffs)
        deploymentDiffs.forEach(d => {
            data.push(d.timeToDeploy)
            labels.push(d.deployStart)
        });
        var myChart = new Chart(canvas, {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    label: 'Time to deploy',
                    data,
                }],
            },
            options: chartOptions,
        });
        canvas.onclick = function(evt) {
        	console.log(myChart)
            var points = myChart.getPointsAtEvent(evt);
            alert(chart.datasets[0].points.indexOf(points[0]));
        };
    }
    const formatDeployments = function(data) {
        const deployments = data.filter(d => d.sellerId === 1)
        var deploymentDiffs = [];
        deployments.forEach(d => {
            const timeToBuild = new Date(d.deployStart) - new Date(d.buildStart);
            const timeToDeploy = new Date(d.deployFinish) - new Date(d.deployStart);
            const totalTime = new Date(d.deployFinish) - new Date(d.buildStart);
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
        var items = [];
        $.each(data, function(index, value) {
            items.push("<li id='" + index + "'>" + value.name + "</li>");
        });
        const deploymentDiffs = formatDeployments(data)
        makeChart(deploymentDiffs);
        $("<ul/>", {
            "class": "my-new-list",
            html: items.join("")
        }).appendTo("body");
    });
});