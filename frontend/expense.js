let token;
let currentPage = 1;
let totalPages = 1;
let rowsPerPage = Number(localStorage.getItem("rowsPerPage")) || 10;
let isPremium = false;
let theme = localStorage.getItem("theme") || false;

const params = new URLSearchParams(window.location.search);
const orderId = params.get("order_id");

// Extracting orderId after return url directed by cashfree and verifying payment
if (orderId) {
  (async () => {
    const response = await axios.get(`/payment/verify/${orderId}`);
    console.log(response.data.status);
    if (response.data.status === "PAID") {
      alert("You are a premium user now!");
    }
  })();
}

window.onload = () => {
  storedToken = localStorage.getItem("token");
  if (!storedToken) {
    // alert("User not logged in");
    window.location.href = "/index.html";
    return;
  }
  if (theme === "dark") {
    toggleTheme();
  }
  token = `Bearer ${storedToken}`;

  isUser();
  displayExpenseHistory();
};

async function isUser() {
  try {
    const response = await axios.get("/user/userDetail", {
      headers: { Authorization: token },
    });

    const userTag = document.getElementById("username-tag");
    userTag.innerText = response.data.name;
    if (response.data.isPremium) {
      premiumUser();
      isPremium = true;
    } else {
      document.getElementById("buy-premium-btn").innerText =
        "Buy Premium membership";
    }
  } catch (error) {
    console.log(error.message);
  }
}

function premiumUser() {
  document.getElementById("buy-premium-btn").remove();
  const h2Premium = document.getElementById("premium-h2");
  h2Premium.innerText = "Premium User";
  h2Premium.classList.add("px-5", "py-2.5");
  const premiumDiv = document.getElementById("premium-div");
  premiumDiv.classList.remove("hidden");
  premiumDiv.classList.add("flex");
}

let toggle = false;
async function showLeaderboard() {
  try {
    const ulContainer = document.getElementById("ul-leaderboard");
    ulContainer.innerHTML = "";

    if (toggle) {
      ulContainer.innerHTML = "";
      toggle = false;
      return;
    }

    document.getElementById("home-div").classList.remove("hidden");
    document.getElementById("yearly-div").classList.add("hidden");
    document.getElementById("monthly-div").classList.add("hidden");

    const response = await axios.get("/premium/leaderboard");
    const leaderboardData = response.data.leaderboard;
    console.log(leaderboardData);
    const h2 = document.createElement("h2");
    h2.innerText = "Leaderboard";
    h2.className =
      "text-2xl text-center px-2 dark:bg-slate-600 rounded-sm m-2 bg-blue-200";
    ulContainer.appendChild(h2);
    leaderboardData.forEach((record) => {
      const li = document.createElement("li");
      li.innerText = `Name - ${record.name}  Total expense - ${record.totalExpense}`;

      ulContainer.appendChild(li);
    });
    toggle = true;
  } catch (error) {
    console.log(error.message);
  }
}

async function handleCashfree() {
  try {
    const res = await axios.post(
      "/payment/create-order",
      {
        amount: 500,
      },
      { headers: { Authorization: token } },
    );

    const sessionId = res.data.data.payment_session_id;
    // 3️⃣ Open Cashfree Checkout
    const cashfree = Cashfree({ mode: "sandbox" });

    cashfree.checkout({
      paymentSessionId: sessionId,
      redirectTarget: "_self",
    });
  } catch (error) {
    console.log(error);
  }
}

async function handleExpenseSubmit(event) {
  event.preventDefault();
  try {
    const formData = new FormData(event.target);
    const amount = formData.get("amount");
    const description = formData.get("description");
    const category = formData.get("category");
    const note = formData.get("note");

    const addToUser = await axios.post(
      "/expense/add",
      {
        amount,
        description,
        category,
        note,
      },
      { headers: { Authorization: token } },
    );
    console.log(addToUser.data.message);
    displayExpenseHistory();
    event.target.reset();
  } catch (error) {
    console.log(error);
  }
}

// Displaying expense
async function displayExpenseHistory(page = 1) {
  try {
    const response = await axios.get(
      `/expense/get?page=${page}&limit=${rowsPerPage}`,
      {
        headers: { Authorization: token },
      },
    );
    const data = response.data.expenses;
    currentPage = response.data.currentPage;
    document.getElementById("pageInfo").innerText = currentPage;
    totalPages = response.data.totalPages;
    const ulContainer = document.getElementById("ul-container");
    ulContainer.innerHTML = "";

    data.forEach((expense) => {
      const li = document.createElement("li");
      li.innerText = `📑 Description: ${expense.description} ▪️ amount ${expense.amount} ▪️ category ${expense.category} ▪️ note :${expense.note ? expense.note : "not added"}`;
      li.className =
        "bg-gray-300 dark:bg-slate-600 px-12 py-2 min-w-full rounded-md font-medium";
      // Edit functionality
      const editBtn = document.createElement('button');
      editBtn.innerText='Edit';
      editBtn.onclick=()=>{updateExpense(li,expense)}
      const deleteBtn = document.createElement("button");
      deleteBtn.innerText = "Delete";
      deleteBtn.className =
        "bg-red-300 dark:text-slate-700 cursor-pointer px-2 ml-4 rounded-md border border-gray-700 hover:bg-red-400";
      deleteBtn.onclick = () => {
        deleteExpense(expense.id);
      };
      
      
      li.appendChild(editBtn)
      li.appendChild(deleteBtn);
      ulContainer.append(li);
    });
  } catch (error) {
    console.log(error);
  }
}

async function updateExpense(li,expense){
  li.innerHTML = `Amount <input type="number" name="amount" value="${expense.amount}"/> Description <input type="text" name="description" value="${expense.description}"/> <button class="update-btn">Update</button>"`
  li.querySelector('.update-btn').addEventListener('click',()=>{
    // get value from this list element and make a put request to db
  })
}
// Pagination

document.getElementById("prevBtn").onclick = () => {
  if (currentPage > 1) {
    displayExpenseHistory(currentPage - 1);
  }
};

document.getElementById("nextBtn").onclick = () => {
  if (currentPage < totalPages) {
    displayExpenseHistory(currentPage + 1);
  }
};

document.getElementById("lastBtn").onclick = () => {
  displayExpenseHistory(totalPages);
};

document.getElementById("rowsPerPage").onchange = (e) => {
  rowsPerPage = Number(e.target.value);
  currentPage = 1; // 🔴 RESET PAGE
  localStorage.setItem("rowsPerPage", rowsPerPage);
  displayExpenseHistory(1);
};

// Delete expense

async function deleteExpense(id) {
  try {
    await axios.delete(`/expense/delete/${id}`, {
      headers: { Authorization: token },
    });
    const ulLength = document.getElementById("ul-container").children.length;
    if (ulLength === 1 && currentPage > 1) {
      displayExpenseHistory(currentPage - 1);
      return;
    }
    displayExpenseHistory(currentPage);
  } catch (error) {
    console.log(error);
  }
}

const description = document.getElementById("l-description");
let timeout;

description.addEventListener("input", () => {
  clearTimeout(timeout);

  timeout = setTimeout(async () => {
    try {
      const desc = description.value;
      if (desc.length < 3) return;

      const response = await axios.post(
        "/expense/getCategoryAI",
        { description: desc },
        {
          headers: { Authorization: token },
        },
      );

      let category = response.data.category;
      const select = document.getElementById("l-category");

      let option = [...select.options].find((opt) => opt.value === category);

      if (!option) {
        option = document.createElement("option");
        option.value = category;
        option.text = category;
        select.appendChild(option);
      }

      select.value = category;
    } catch (error) {
      console.log(error.message);
    }
  }, 500);
});

function displayMonthlyReport() {
  document.getElementById("home-div").classList.add("hidden");
  document.getElementById("yearly-div").classList.add("hidden");

  document.getElementById("monthly-div").classList.remove("hidden");
}

function displayYearlyReport() {
  document.getElementById("home-div").classList.add("hidden");
  document.getElementById("monthly-div").classList.add("hidden");
  document.getElementById("yearly-div").classList.remove("hidden");
}

// Toggle theme - dark mode
function toggleTheme() {
  document.documentElement.classList.toggle("dark");
  if (document.documentElement.classList.contains("dark")) {
    localStorage.setItem("theme", "dark");
  } else {
    localStorage.removeItem("theme");
  }
}

// Download report
async function downloadReport() {
  try {
    if (isPremium) {
      const response = await axios.get("/expense/downloadExpenses", {
        headers: { Authorization: token },
      });
      window.location.href = response.data.download;
    } else {
      alert("Feature only available to premium users!");
    }
  } catch (error) {
    console.log(error.response.data.error);
  }
}

function userLogout() {
  localStorage.removeItem("token");
  window.location.href = "/index.html";
}

