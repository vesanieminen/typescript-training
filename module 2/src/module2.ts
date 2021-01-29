const apiURL = "https://bad-api-assignment.reaktor.com";
const productsURL = apiURL + "/products/"
const availabilityURL = apiURL + "/availability/"
const limit = 10;
const manufacturers: string[] = [];
const availabilityMap: Record<string, string> = {}
const parser = new DOMParser();

interface Product {
    type: string;
    name: string;
    price: number;
    manufacturer: string;
    id: string;
}

interface AvailabilityResponse {
    code: number;
    response: Availability[];
}

interface Availability {
    id: string;
    DATAPAYLOAD: string;
}

async function fetchURL<T>(url: string): Promise<T> {
    const response = await fetch(url);
    if (response.status !== 200) {
        throw Error("Failed to fetch data: " + response.type);
    }
    return await response.json();
}

async function fetchType(type: string): Promise<Product[]> {
    const response = await fetchURL<Product[]>(productsURL + type);
    return response.slice(0, limit);
}

async function fetchProducts(): Promise<Product[][]> {
    return await Promise.all([fetchType("jackets"), fetchType("shirts"), fetchType("accessories")]);
}

async function fetchAvailability(manufacturers: string[]): Promise<AvailabilityResponse[]> {
    const array: Promise<AvailabilityResponse>[] = [];
    manufacturers.forEach(manufacturer => array.push(fetchURL<AvailabilityResponse>(availabilityURL + manufacturer)));
    return await Promise.all(array);
}

async function buildUI(): Promise<void> {
    const data = await fetchProducts();
    data.forEach(productsType =>
        productsType.forEach(product => {
                if (manufacturers.indexOf(product.manufacturer) === -1) {
                    manufacturers.push(product.manufacturer);
                }
            }
        )
    );
    const availabilities = await fetchAvailability(manufacturers);
    availabilities.forEach(manufacturer => manufacturer.response.forEach(
        availability => {
            let stockValue = parser.parseFromString(availability.DATAPAYLOAD, "text/xml").getElementsByTagName("INSTOCKVALUE")[0].childNodes[0].nodeValue;
            if (stockValue !== null) {
                availabilityMap[availability.id] = stockValue;
            }
        }));
    data.forEach(productsType =>
        productsType.forEach(product => {
                return createRow(product)
            }
        )
    );
}

function createRow(product: Product): void {
    const tr = createTableRow();
    tr.appendChild(createTableDataElement(product.type));
    tr.appendChild(createTableDataElement(product.name));
    tr.appendChild(createTableDataElement(product.price + "€"));
    tr.appendChild(createTableDataElement(product.manufacturer));
    tr.appendChild(createTableDataElement(product.id));
    tr.appendChild(createTableDataElement(availabilityMap[product.id.toUpperCase()]));
}

function createTableRow(): HTMLTableRowElement {
    const rowElement = document.createElement("tr");
    const table = document.getElementById("table")
    if (table !== null) {
        table.appendChild(rowElement);
    }
    return rowElement;
}

function createTableDataElement(text: string): HTMLTableDataCellElement {
    const node = document.createElement("td");
    node.appendChild(document.createTextNode(text));
    return node;
}

buildUI()
    .catch(e => console.log(e));
