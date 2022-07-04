L.Control.ElectionSelector = L.Control.extend({
    options: {
        position: 'bottomleft',
    },
    initialize: function (layer, contests, options) {
        this.selection = {};

        this._closed = false;
        this._layer = layer;
        this._contests = contests;
        this._colorScale = chroma.scale(['white', '08306b']);
        this._colorClassifier = ['#1f78b4','#e31a1c','#33a02c','#ff7f00','#6a3d9a','#ffff99','#b15928','#a6cee3','#fb9a99','#b2df8a','#fdbf6f','#cab2d6'];
    },
    onAdd: function(map) {
        let container = this._container = L.DomUtil.create('div', 'election-selector leaflet-bar');

        let drawer = this._drawer = L.DomUtil.create('div', 'election-selector-drawer leaflet-bar', container);
        this._addTitle();
        this._contestSelector = L.DomUtil.create('select', 'election-selector-select', drawer);
        this._choiceSelector = L.DomUtil.create('select', 'election-selector-select', drawer);

  		L.DomEvent.disableClickPropagation(container);
  		L.DomEvent.disableScrollPropagation(container);

        this._addContests(Object.values(this._contests));
        this._addChoices(this._contests[this._contestSelector.value].choices);

        L.DomEvent.on(this._contestSelector, 'change', this._contestChanged, this);
        L.DomEvent.on(this._choiceSelector, 'change', this._choiceChanged, this);

        this._layer.setStyle(this._createStyle());

        L.DomEvent.on(container, {
            mouseenter: function () {
                L.DomEvent.on(container, 'mousedown', L.DomEvent.preventDefault);
                this._open();
                setTimeout(function () {
                    L.DomEvent.off(container, 'mousedown', L.DomEvent.preventDefault);
                });
            },
            mouseleave: this._close
        }, this);

        this._close();

        return container;
    },

    onRemove: function(map) {
        // Nothing to do here
    },

    _addTitle: function(){
        let div = L.DomUtil.create('div', 'election-selector-credits', this._drawer);

        div.innerHTML = `
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
        let option = L.DomUtil.create('option', 'election-selector-option', this._choiceSelector);
        option.value = "w"
        option.textContent = "WINNER BY PRECINCT";
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
        if(selection.choice !== "w") return feature => {
            let fdata = this._contests[selection.contest].choices.map(ch => ({
                label: ch.label,
                votes: ch.votes[feature.properties.PrecinctID],
                percentage: ch.percentage[feature.properties.PrecinctID]
            }));
            return {
                fillColor: this._colorScale(fdata[selection.choice].percentage),
                fill: fdata[selection.choice].percentage !== undefined,
                stroke: fdata[selection.choice].percentage !== undefined
            }
        };
        return feature => {
            let fdata = this._contests[selection.contest].results[feature.properties.PrecinctID];
            return {
                fillColor: fdata !== undefined && fdata.total !== 0 ? this._colorClassifier[fdata.winner.id] : 'white',
                fill: fdata !== undefined,
                stroke: fdata !== undefined
            }
        };
    },

    _close: function(){
        this._container.classList.add("closed");
        this._closed = true;
    },

    _open: function(){
        this._container.classList.remove("closed");
        this._closed = false;
    }
});

L.control.ElectionSelector = function(layer, contests, options) {
    return new L.Control.ElectionSelector(layer, contests, options);
}