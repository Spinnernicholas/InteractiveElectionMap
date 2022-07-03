L.Control.ElectionSelector = L.Control.extend({
    options: {
        position: 'bottomleft',
    },
    initialize: function (layer, contests, options) {
        this._layer = layer;
        this._contests = contests;
        this._colorScale = chroma.scale(['white', '08306b']);
    },
    onAdd: function(map) {
        let div = this._container = L.DomUtil.create('div', 'election-selector leaflet-bar');
        this._addTitle();
        this._contestSelector = L.DomUtil.create('select', 'election-selector-select', div);
        this._choiceSelector = L.DomUtil.create('select', 'election-selector-select', div);

  		L.DomEvent.disableClickPropagation(div);

        this._addContests(Object.values(this._contests));
        this._addChoices(this._contests[this._contestSelector.value].choices);

        L.DomEvent.on(this._contestSelector, 'change', this._contestChanged, this);
        L.DomEvent.on(this._choiceSelector, 'change', this._choiceChanged, this);

        this._layer.setStyle(this._createStyle());

        return div;
    },

    onRemove: function(map) {
        // Nothing to do here
    },

    _addTitle: function(){
        let div = L.DomUtil.create('div', 'election-selector-credits', this._container);

        div.innerHTML = `
        <p><b>=</b></p>
        <p>
            <b>Contra Costa County Primary Election 2022 Interactive Map</b><br/>
            <i>*precinct map data may be incorrect. Working on getting correct data.</i><br/>
            Created by <a href="https://github.com/Spinnernicholas" target="_blank">Nick Spinner</a>
        </p>`;
    },

    _addContests: function(contests) {
        contests.forEach((c) => {
            let option = L.DomUtil.create('option', 'election-selector-option', this._contestSelector);
            option.value = c.id;
            option.textContent = c.label;
        });
    },

    _addChoices: function(choices) {
        choices.forEach((ch, i) => {
            let option = L.DomUtil.create('option', 'election-selector-option', this._choiceSelector);
            option.value = i;
            option.textContent = ch.label;
        });
    },

    _contestChanged: function() {
        L.DomUtil.empty(this._choiceSelector);
        this._addChoices(this._contests[this._contestSelector.value].choices);
        this._layer.setStyle(this._createStyle());
    },
    
    _choiceChanged: function() {
        this._layer.setStyle(this._createStyle());
    },

    _createStyle: function() {
        let selection = this.selection = {
            contest: this._contestSelector.value,
            choice: this._choiceSelector.value
        };
        let colors = this._colors;
        return feature => {    
            let fdata = this._contests[selection.contest].choices.map(ch => ({
                label: ch.label,
                votes: ch.votes[feature.properties.PrecinctID],
                percentage: ch.percentage[feature.properties.PrecinctID]
            }));
            return {
                fillColor: this._colorScale(fdata[selection.choice].percentage),
                fillOpacity: 1,
                fill: fdata[selection.choice].percentage !== undefined,
                stroke: fdata[selection.choice].percentage !== undefined,
                weight: 1,
                color: "#AAAAAA"
            }
        };
    }
});

L.control.ElectionSelector = function(layer, contests, options) {
    return new L.Control.ElectionSelector(layer, contests, options);
}