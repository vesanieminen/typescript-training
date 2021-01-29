var apiURL = "https://bad-api-assignment.reaktor.com";
var productsURL = apiURL + "/products/"
var availabilityURL = apiURL + "/availability/"
const limit = 10;
var manufacturers = [];
var availabilityMap = {};
const parser = new DOMParser();

async function fetchURL(url) {
    const response = await fetch(url);
    if (response.status !== 200) {
        throw Error("Failed to fetch data: " + type);
    }
    return await response.json();
}

async function fetchType(type) {
    const response = await fetchURL(productsURL + type);
    return response.slice(0, limit);
}

async function fetchAll() {
    return await Promise.all([fetchType("jackets"), fetchType("shirts"), fetchType("accessories")]);
}

function createTableRow() {
    var rowElement = document.createElement("tr");
    var table = document.getElementById("table");
    table.appendChild(rowElement);
    return rowElement;
}

function createTableDataItem(text) {
    var node = document.createElement("td");
    node.appendChild(document.createTextNode(text));
    return node;
}

function createTableData(product, tr) {
    var type = createTableDataItem(product.type);
    var name = createTableDataItem(product.name);
    var price = createTableDataItem(product.price + "€");
    var manufacturer = createTableDataItem(product.manufacturer);
    var id = createTableDataItem(product.id);
    var availability = createTableDataItem(availabilityMap[product.id.toUpperCase()]);
    tr.appendChild(type);
    tr.appendChild(name);
    tr.appendChild(price);
    tr.appendChild(manufacturer);
    tr.appendChild(id);
    tr.appendChild(availability);
}

async function fetchManufacturers(manufacturers) {
    var array = [];
    manufacturers.forEach(manufacturer => array.push(fetchURL(availabilityURL + manufacturer)));
    return await Promise.all(array);
}

async function buildUI() {
    const data = await fetchAll();
    data.forEach(productsType =>
        productsType.forEach(product => {
                if (!manufacturers.includes(product.manufacturer)) {
                    manufacturers.push(product.manufacturer);
                }
            }
        )
    );
    const man = await fetchManufacturers(manufacturers);
    man.forEach(manufacturer => manufacturer.response.forEach(data => availabilityMap[data.id] = parser.parseFromString(data.DATAPAYLOAD, "text/xml").getElementsByTagName("INSTOCKVALUE")[0].childNodes[0].nodeValue));
    data.forEach(productsType =>
        productsType.forEach(product => {
                return createTableData(product, createTableRow())
            }
        )
    );

}


buildUI()
    .catch(e => console.log(e));



