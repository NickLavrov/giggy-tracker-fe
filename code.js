$(document).ready(function() {
    const canvas = document.getElementById("myChart")
    const chartOptions = {
        legend: {
            display: true,
            position: 'top',
            labels: {
                boxWidth: 80,
                fontColor: 'black'
            }
        }
    };
    const makeChart = function(deploymentDiffs) {
        var data = []
        var labels = []
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
                    fill: false,
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
        var rows = [];
        const deploymentDiffs = formatDeployments(data);
        $.each(deploymentDiffs, function(index, value) {
            rows.push(`<tr><td>${index}</td><td>${value.timeToBuild}</td><td>${value.timeToDeploy}</td><td>${value.totalTime}</td><td><a href="${value.formattedLink}">${value.shortedSha}</a></td></tr>`)
        });
        makeChart(deploymentDiffs);
        $("#myTable").append('<tr><td>index</td><td>timeToBuild</td><td>timeToDeploy</td><td>totalTime</td><td>link</td></tr>')
        $("#myTable").append(rows.join(""));
    });
});