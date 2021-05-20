var addDeskOrRoom = 'desk'
var oldPosition = {}
var isDraggable = false
const floorImgUrl = './images/first-floor.png';
const reservedDeskIconUrl = './images/icons/red-laptop.png';
const vacantDeskIconUrl = './images/icons/green-laptop.png';
const reservedRoomIconUrl = './images/icons/room2.png';
const vacantRoomIconUrl = './images/icons/room.png';


var reservedDeskIcon = L.icon({
    iconUrl: reservedDeskIconUrl,
    iconSize: [25, 25], // size of the icon
    shadowSize: [20, 20], // size of the shadow
    iconAnchor: [10, 10], // point of the icon which will correspond to marker's location
    shadowAnchor: [13, 13],  // the same for the shadow
    popupAnchor: [3, -12] // point from which the popup should open relative to the iconAnchor
});


var vacantDeskIcon = L.icon({
    iconUrl: vacantDeskIconUrl,
    iconSize: [25, 25], // size of the icon
    shadowSize: [20, 20], // size of the shadow
    iconAnchor: [10, 10], // point of the icon which will correspond to marker's location
    shadowAnchor: [13, 13],  // the same for the shadow
    popupAnchor: [3, -12] // point from which the popup should open relative to the iconAnchor
});

var reservedRoomIcon = L.icon({
    iconUrl: reservedRoomIconUrl,
    iconSize: [50, 50], // size of the icon
    shadowSize: [20, 20], // size of the shadow
    iconAnchor: [10, 10], // point of the icon which will correspond to marker's location
    shadowAnchor: [13, 13],  // the same for the shadow
    popupAnchor: [3, -12] // point from which the popup should open relative to the iconAnchor
});


var vacantRoomIcon = L.icon({
    iconUrl: vacantRoomIconUrl,
    iconSize: [50, 50], // size of the icon
    shadowSize: [20, 20], // size of the shadow
    iconAnchor: [10, 10], // point of the icon which will correspond to marker's location
    shadowAnchor: [13, 13],  // the same for the shadow
    popupAnchor: [3, -12] // point from which the popup should open relative to the iconAnchor
});

// criando mapa
var myMap = L.map('map', {
    minZoom: 1,
    maxZoom: 5,
    center: [-456, -440],
    zoom: 3,
    crs: L.CRS.Simple,
    doubleClickZoom: false,// disable dbClick zoom
});

// dimensões na imagem com url dela
var w = 2000, // careful with these numbers, as they change the position of the desk on the picture. once they are set and 
    h = 1500  // the markers were added , these numbers shouldnt be modified.
// var w = 3350,
// h = 2550,


// caculando as lados da imagem com Coordenadas do spaco 
var southWest = myMap.unproject([0, h], myMap.getMaxZoom() - 1);
var northEast = myMap.unproject([w, 0], myMap.getMaxZoom() - 1);
var bounds = new L.LatLngBounds(southWest, northEast);


// aqui adicionado a imagem overlay para puder cobrir a mapa inteira mapa   
L.imageOverlay(floorImgUrl, bounds).addTo(myMap);

// manda para leaflet essa mapa para ficar como imagem grande
myMap.setMaxBounds(bounds);
//console.log(bounds)
// aqui a calcula width com height da imagem para puder pegar Coordenadas do click

console.log(reservationList);

//Hadnel on right click functions TODO: MOVE THIS LATER
myMap.on('contextmenu', onMapRightClick);

myMap.on('click', onMapClick)

// how geoJSON work https://leafletjs.com/examples/geojson/
// this instance (variable) is only being used in the Edit button so we can remove 
// the layer from the map and generate/add it again 
var geoJson = generateMarkers(false);


// adding toobox on the right side of the map
var toolbox = L.control({ position: 'topright' });
toolbox.onAdd = function (map) {
    var container = document.createElement('div')
    container.className = 'toolbox'

    var editBtn = document.createElement('div')
    editBtn.innerText = 'Edit'
    editBtn.className = 'edit-btn'
    editBtn.addEventListener('click', OnEditClick)

    var radioFrom = document.createElement('form')
    radioFrom.innerText = 'Add'
    radioFrom.className = 'radio-form'

    var inpRadioDesk = document.createElement('input')
    inpRadioDesk.setAttribute('type', 'radio')
    inpRadioDesk.setAttribute('name', 'type')
    inpRadioDesk.setAttribute('id', 'desk')
    inpRadioDesk.setAttribute('value', 'Desk')
    inpRadioDesk.setAttribute('checked', 'true')

    var deskRadio = document.createElement('label')
    deskRadio.htmlFor = 'desk';

    deskRadio.appendChild(inpRadioDesk)
    deskRadio.appendChild(document.createTextNode('Desk'));

    var inpRadioRoom = document.createElement('input')
    inpRadioRoom.setAttribute('type', 'radio')
    inpRadioRoom.setAttribute('name', 'type')
    inpRadioRoom.setAttribute('id', 'room')
    inpRadioRoom.setAttribute('value', 'Metting Room')

    var roomRadio = document.createElement('label')
    roomRadio.htmlFor = 'room';

    roomRadio.appendChild(inpRadioRoom)
    roomRadio.appendChild(document.createTextNode('room'));

    deskRadio.addEventListener('click', function (e) {
        addDeskOrRoom = 'desk'
    })
    roomRadio.addEventListener('click', function (e) {
        addDeskOrRoom = 'room'
    })

    radioFrom.appendChild(deskRadio)
    radioFrom.appendChild(roomRadio)

    container.appendChild(editBtn)
    container.appendChild(radioFrom)
    return container
}
toolbox.addTo(myMap)



// i dont know what this does?
Number.prototype.between = function (a, b) {
    var min = Math.min.apply(Math, [a, b]),
        max = Math.max.apply(Math, [a, b]);
    return this > min && this < max;
};


function getAnimatedIcon(feature) {
    var url = getUrl(feature)
    var type = feature.properties.type
    var className = `location-pin-${type}`
    var animationClass = `pulse-${type}`
    console.log(animationClass);
    return L.divIcon({
        className: className,
        html: `
        <img src=${url}>
        <div class=${animationClass}></div>
        `,
        // iconSize: [25, 25],//size being set in css.
        iconAnchor: [10, 10],

        shadowSize: [20, 20],
        shadowAnchor: [13, 13],
        popupAnchor: [3, -12]
    });
}

function generateMarkers(draggable, id = -1) {

    const geoLayer = L.geoJSON(reservationList, {
        onEachFeature: onEachFeature,
        pointToLayer: function (feature, latlng) {
            // set the icon based on the value of reserved.
            var icon = getIcon(feature)

            // if id is passed we need to animate the icon
            if (id != -1 && feature.properties.id === id) {

                icon = getAnimatedIcon(feature)
            }

            var marker = L.marker(latlng, { icon: icon, draggable: draggable });
            marker.on('moveend', onMarkerDragged); // moveEnd is same as dragEnd (the later happens multiple times dont know why)
            // just testing dbClick, (problem double click also make zoom if it was not on the marker)
            marker.on('dblclick', onDoubleClickMarker)
            //this event is ony to record the oldPosition in case if the last position is out of the map
            // to reset the markert to the old position
            marker.on('dragstart', function (e) {
                oldPosition = e.target._latlng
            })

            return marker;
        }
    });

    // if layer exists remove it and render it again
    if (myMap.hasLayer(geoJson)) {
        myMap.removeLayer(geoJson)
    }

    geoLayer.addTo(myMap);
    updateList()
    return geoLayer;
}

function getUrl(feature) {
    if (feature.properties.type == 'desk') {
        return feature.properties.reserved ? reservedDeskIconUrl : vacantDeskIconUrl;
    }
    return feature.properties.reserved ? reservedRoomIconUrl : vacantRoomIconUrl

}

function getIcon(feature) {
    if (feature.properties.type == 'desk') {
        return feature.properties.reserved ? reservedDeskIcon : vacantDeskIcon;
    }
    return feature.properties.reserved ? reservedRoomIcon : vacantRoomIcon;
}

function OnEditClick(e) {
    e.preventDefault();
    var editBtn = e.target

    // to disable/enable draggable on each marker in the map layer, 
    // need to remove them and create them with draggable false/true. this is what worked with me.
    if (editBtn.innerText == 'Edit') {

        editBtn.innerText = 'Save'
        isDraggable = !isDraggable
        geoJson = generateMarkers(isDraggable)

    } else {

        editBtn.innerText = 'Edit'
        isDraggable = !isDraggable
        geoJson = generateMarkers(isDraggable)

    }
}

function onDoubleClickMarker(e) {
    console.log('double clicked');
    console.log(e.target.dragging);
    console.log(e);

}
function onMapClick(e) {
    console.log('map clicked');
    console.log('print target');
    console.log(e.target);
};

function onMarkerDragged(event) {

    var marker = event.target;
    var position = marker.getLatLng();

    if (event.target._latlng.lng.between(bounds._southWest.lng, bounds._northEast.lng) && event.target._latlng.lat.between(bounds._southWest.lat, bounds._northEast.lat)) {

        console.log('setting new position');
        marker.setLatLng(new L.LatLng(position.lat, position.lng));

        // saving the coordinates in memory, later When click on Save button can be persisted to DB.
        saveNewCoordinates(position, marker.feature)
    } else {
        //falling back to the old position of the market because the markert was dragged out of the layer bounds.
        marker.setLatLng(new L.LatLng(oldPosition.lat, oldPosition.lng));
        console.log('outside, falling back');

    }
}

// update with new coordinates 
function saveNewCoordinates(position, feature) {
    console.log('save coordinates for :', feature.properties.name, ', id:', feature.properties.id);
    var deskId = feature.properties.id
    console.log(feature);
    reservationList.map(item => {
        if (item.properties.id === deskId) {
            console.log('item changed : ', item.properties.id);
            item.geometry.coordinates[0] = position.lng
            item.geometry.coordinates[1] = position.lat
        }
    })
}

function onMapRightClick(e) {
    // deactivate right click if not in edit mode
    if (!isDraggable) {
        return
    }
    var mapWidth = myMap._container.offsetWidth;
    var mapHeight = myMap._container.offsetHeight;
    var locationX = e.containerPoint.x * w / mapWidth;
    var locationY = e.containerPoint.y * h / mapHeight

    console.log("x : " + locationX + "    y : " + locationY);
    console.log(e.latlng.lng + ' : ' + e.latlng.lat)


    if (e.latlng.lng.between(bounds._southWest.lng, bounds._northEast.lng) && e.latlng.lat.between(bounds._southWest.lat, bounds._northEast.lat)) {

        var type = addDeskOrRoom
        obj = {

            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [e.latlng.lng, e.latlng.lat]
            },
            "properties": {
                "id": reservationList.length + 1,
                "type": type,
                "name": "Desk " + reservationList + 1,
                "name": "empty",
                "phone": "emtpy",
                "reserved": false,
            }
        }
        // only need to add the coordinates and let generateMarkers do the work.
        reservationList.push(obj);
        geoJson = generateMarkers(true)

    } else
        console.log("not okay")

    console.log(reservationList);

}

function onEachFeature(feature, layer) {
    layer.bindPopup(makePopupContent(feature), { closeButton: false, offset: L.point(0, -8) });
}

function makePopupContent(feature) {
    var typeName = feature.properties.type == 'desk' ? "mesa" : "sala"
    if (feature.properties.reserved) {
        return `
        <div>
                    <h3> ${typeName} ${feature.properties.id}</h3>
                    <h4>${feature.properties.name}</h4>
                    <p>${feature.properties.occupation}</p>
                    <div class="phone-number">
                        <a href="tel:${feature.properties.phone}">${feature.properties.phone}</a>
                    </div>
                </div>
                <p> a ${typeName} já está reservada, Você quer cancelar a reserva? </p>
                <button type="button" class="btn btn-primary btn-sm">Sim</button>
                <button type="button" class="btn btn-danger btn-sm">Não</button>
        `;
    }

    return `
        <div>
                    <h3> ${typeName} ${feature.properties.id}</h3>
                    <h4>${feature.properties.name}</h4>
                    <p>${feature.properties.occupation}</p>
                    <div class="phone-number">
                        <a href="tel:${feature.properties.phone}">${feature.properties.phone}</a>
                    </div>
                </div>
                <p>Quer reservar essa ${typeName}?</p>
                <button type="button" class="btn btn-primary btn-sm">Sim</button>
                <button type="button" class="btn btn-danger btn-sm">Não</button>
        `;
}

function updateList() {
    const ul = document.querySelector('.list');
    while (ul.firstChild) {
        ul.removeChild(ul.firstChild)
    }
    reservationList.forEach((desk) => {
        const li = document.createElement('li');
        const div = document.createElement('div');
        const a = document.createElement('a');
        const p = document.createElement('p');
        a.addEventListener('click', () => {
            animateMarker(desk);
        });
        div.classList.add('desk-item');
        a.innerText = desk.properties.name;
        a.href = '#';
        p.innerText = desk.properties.occupation;

        div.appendChild(a);
        div.appendChild(p);
        li.appendChild(div);
        ul.appendChild(li);
    });
}


function animateMarker(desk) {
    const id = desk.properties.id
    myMap.removeLayer(geoJson)
    // always assign it to this variable, to be able to remove it later. (otherwise strange things start happening, overlapping layers)
    geoJson = generateMarkers(false, id)
}
