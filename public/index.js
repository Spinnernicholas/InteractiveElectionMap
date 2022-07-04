const map = L.map('map', {preferCanvas: false}).setView([37.93, -121.95], 11);

let osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
}).addTo(map);

let data = {};
let precinctsLayer;

(async () => {
    let response = await fetch("data/sum.json")
    let sum = await response.json();
    data.sum_json = sum;

    response = await fetch("data/details.json")
    let details = await response.json();
    data.details_json = details;

    response = await fetch("data/precincts.gis.json")
    data.precincts = await response.json();

    data.contests = {};
    
    sum.Contests.forEach(c => {

        let contest = {
        id: c.K,
        label: c.C,
        choices: [],
        results: []
        }

        //Add Choices
        c.CH.forEach((ch, i) => {
            contest.choices.push({
                label: ch,
                party: c.P[i],
                votes: c.V[i]
            });
        });

        data.contests[c.K] = contest;
    });

    details.Contests.forEach(c => {
        let results = {};

        c.P.forEach((p, i) => {
            results[p.substring(0, 7)] = {
                votes: c.V[i],
                total: c.V[i].reduce((sum, x) => sum + x, 0)
            }
        });

        data.contests[c.K].results = results;
    });

    Object.entries(data.contests).forEach(([id, c]) => {
        c.choices.forEach((ch, i) => {
            ch.votes = {};
            ch.percentage = {};

            Object.entries(c.results).map(([p, r]) => {
                ch.votes[p.substring(0, 7)] = r.votes[i];
                ch.percentage[p.substring(0, 7)] = r.votes[i] === 0? 0 : r.votes[i]/r.total;
                let max = r.votes[0];
                let maxIndex = 0;
                for(j = 1; j < r.votes.length; j++) if(r.votes[j] > max) {
                    max = r.votes[j];
                    maxIndex = j;
                }
                r.winner = {
                    id: maxIndex,
                    label: r.total > 0 ? c.choices[maxIndex].label : "No Votes",
                    votes: max
                };
            });
        })
    })

    precinctsLayer = L.geoJSON(data.precincts, {
        style: feature => {
            return {
                fillOpacity: 1,
                weight: 1,
                color: "#AAAAAA"
            }
        },
        onEachFeature: (feature, layer) => {
            layer.on({
                click: e => {
                    let contest = data.contests[selector.selection.contest];
                    let choice = data.contests[selector.selection.contest].choices[selector.selection.choice];
                    let winner = data.contests[selector.selection.contest].results[e.target.feature.properties.PrecinctID].winner;
                    e.target.setStyle({
                        weight: 2,
                        color: "#FFFFFF"
                    }).bringToFront();
                    if(selector.selection.choice === 'w') L.popup()
                        .setLatLng(e.latlng)
                        .setContent(`
                        <p class="popup-title">${e.target.feature.properties.PrecinctID}<br/>
                        ${winner.label}
                        </p>
                        Votes: ${winner.votes}/${contest.results[e.target.feature.properties.PrecinctID].total} (${contest.results[e.target.feature.properties.PrecinctID].total !== 0 ? (100 * winner.votes/contest.results[e.target.feature.properties.PrecinctID].total).toFixed(2) : 0}%)<br/>
                        `)
                        .on({remove: () => e.target.setStyle({
                            weight: 1,
                            color: "#AAAAAA"
                        })})
                        .openOn(map);
                    else L.popup()
                        .setLatLng(e.latlng)
                        .setContent(`
                        <p class="popup-title">${e.target.feature.properties.PrecinctID}<br/>
                        ${choice.label}
                        </p>
                        Votes: ${choice.votes[e.target.feature.properties.PrecinctID]}/${contest.results[e.target.feature.properties.PrecinctID].total} (${(100 * choice.percentage[e.target.feature.properties.PrecinctID]).toFixed(2)}%)<br/>
                        `)
                        .on({remove: () => e.target.setStyle({
                            weight: 1,
                            color: "#AAAAAA"
                        })})
                        .openOn(map);
                }
            });
        }
    }).addTo(map);
    
    let selector = L.control.ElectionSelector(precinctsLayer, data.contests).addTo(map);
})();
