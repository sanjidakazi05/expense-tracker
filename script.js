let expenses = [];
const form = document.getElementById("expense-form");
const list = document.getElementById("expense-list");
const error = document.getElementById("error");
const totalSpan = document.getElementById("total");
const countSpan = document.getElementById("count");
const categoryTotalsList = document.getElementById("category-totals");
const eurTotal = document.getElementById("eur-total");
let currentFilter = "All";
let currentSort = "dateAsc";
document.getElementById("date").value =
new Date().toISOString().split("T")[0];
try {
expenses = JSON.parse(localStorage.getItem("expenses")) || [];
} catch {
expenses = [];
}
function saveExpenses() {
localStorage.setItem(
"expenses",
JSON.stringify(expenses)
);
}
function render() {
let filtered = [...expenses];
if (currentFilter !== "All") {
    filtered = filtered.filter(
        expense => expense.category === currentFilter
    );
}

switch (currentSort) {
    case "amountAsc":
        filtered.sort((a, b) => a.amount - b.amount);
        break;
    case "amountDesc":
        filtered.sort((a, b) => b.amount - a.amount);
        break;
    case "dateAsc":
        filtered.sort((a, b) =>
            new Date(a.date) - new Date(b.date)
        );
        break;
    case "dateDesc":
        filtered.sort((a, b) =>
            new Date(b.date) - new Date(a.date)
        );
        break;
}

list.innerHTML = "";

if (filtered.length === 0) {
    list.innerHTML =
        '<p class="empty-state">No expenses found.</p>';
}

filtered.forEach(expense => {
    const row = document.createElement("div");

    row.className = "expense-row";

    row.innerHTML = `
        <span>${expense.description}</span>
        <span>$${expense.amount.toFixed(2)}</span>
        <span>${expense.category}</span>
        <span>${expense.date}</span>
        <button>Delete</button>
    `;

    row.querySelector("button")
        .addEventListener("click", () => {
            expenses = expenses.filter(
                item => item.id !== expense.id
            );

            saveExpenses();
            render();
        });

    list.appendChild(row);
});

const total = filtered.reduce(
    (sum, expense) => sum + expense.amount,
    0
);

totalSpan.textContent =
    `$${total.toFixed(2)}`;

countSpan.textContent = filtered.length;

const categoryTotals = filtered.reduce(
    (acc, expense) => {
        acc[expense.category] =
            (acc[expense.category] || 0)
            + expense.amount;

        return acc;
    },
    {}
);

categoryTotalsList.innerHTML = "";

Object.entries(categoryTotals)
    .forEach(([category, total]) => {
        const li = document.createElement("li");

        li.textContent =
            `${category}: $${total.toFixed(2)}`;

        categoryTotalsList.appendChild(li);
    });

}
form.addEventListener("submit", event => {
event.preventDefault();
const description =
    document.getElementById("description").value.trim();

const amount =
    Number(document.getElementById("amount").value);

const category =
    document.getElementById("category").value;

const date =
    document.getElementById("date").value;

if (!description || amount <= 0 || !date) {
    error.textContent =
        "Please enter a valid description, amount, and date.";
    return;
}

error.textContent = "";

expenses.push({
    id: Date.now(),
    description,
    amount,
    category,
    date
});

saveExpenses();
render();
form.reset();

document.getElementById("date").value =
    new Date().toISOString().split("T")[0];

});
document.getElementById("filter")
.addEventListener("change", e => {
currentFilter = e.target.value;
render();
});
document.getElementById("sort")
.addEventListener("change", e => {
currentSort = e.target.value;
render();
});
document.getElementById("convert-btn")
.addEventListener("click", convertToEUR);
async function convertToEUR() {
const button =
document.getElementById("convert-btn");
button.disabled = true;
button.textContent = "Converting...";

try {
    const response = await fetch(
        "https://open.er-api.com/v6/latest/USD"
    );

    if (!response.ok) {
        throw new Error("Request failed");
    }

    const data = await response.json();

    const rate = data.rates.EUR;

    const total = expenses.reduce(
        (sum, expense) => sum + expense.amount,
        0
    );

    eurTotal.textContent =
        `EUR Total: €${(total * rate).toFixed(2)}`;
} catch {
    eurTotal.textContent =
        "Error converting currency.";
}

button.disabled = false;
button.textContent = "Convert to EUR";

}
render();
