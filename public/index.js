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
            results[p] = c.V[i];
        });

        data.contests[c.K].results = results;
    });

    Object.entries(data.contests).forEach(([id, c]) => {
        c.choices.forEach((ch, i) => {
            ch.votes = {};
            ch.percentage = {};

            Object.entries(c.results).map(([p, r]) => {

                ch.votes[p.substring(0, 7)] = r[i];
                ch.percentage[p.substring(0, 7)] = r[i] === 0? 0 : r[i]/r.reduce((sum, x) => sum + x, 0);
            });
        })

        delete c.results;
    })

    precinctsLayer = L.geoJSON(data.precincts, {
        // style: (feature) => {
        //     let fdata = data.contests[selection.contest].choices.map(ch => ({
        //         label: ch.label,
        //         votes: ch.votes[feature.properties.PrecinctID],
        //         percentage: ch.percentage[feature.properties.PrecinctID],
        //         colorIndex: Math.floor(ch.percentage[feature.properties.PrecinctID] * colors.length)
        //     }));
        //     return {
        //         fillColor:colors[Math.floor(fdata[selection.choice].percentage * (colors.length - 1))],
        //         fillOpacity: 1,
        //         fill: fdata[selection.choice].percentage !== undefined,
        //         stroke: fdata[selection.choice].percentage !== undefined,
        //         color: "#AAAAAA"
        //     };
        // },
        onEachFeature: (feature, layer) => {
            layer.on({
                click: e => {
                    console.log(e.target.feature.properties.PrecinctID);
                }
            });
        }
    }).addTo(map);
    
    L.control.ElectionSelector(precinctsLayer, data.contests).addTo(map);
})();
