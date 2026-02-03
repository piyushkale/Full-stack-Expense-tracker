let token;
let currentPage = 1;
let totalPages = 1;
let rowsPerPage = Number(localStorage.getItem("rowsPerPage")) || 10;

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
    alert("User not logged in");
    window.location.href = "/index.html";
    return;
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
    h2.className = "text-2xl text-center px-2 font-mono rounded-sm bg-blue-200";
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

    const addToUser = await axios.post(
      "/expense/add",
      {
        amount,
        description,
        category,
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
    totalPages = response.data.totalPages;
    const ulContainer = document.getElementById("ul-container");
    ulContainer.innerHTML = "";

    data.forEach((expense) => {
      const li = document.createElement("li");
      li.innerText = `📑 Description: ${expense.description} ▪️ amount ${expense.amount} ▪️ category ${expense.category}`;
      li.className = "bg-gray-300 px-12 py-2 min-w-full rounded-md font-medium";
      const deleteBtn = document.createElement("button");
      deleteBtn.innerText = "Delete";
      deleteBtn.className =
        "bg-red-200 px-2 ml-4 rounded-md border border-gray-700 hover:bg-red-400";
      deleteBtn.onclick = () => {
        deleteExpense(expense.id);
      };
      li.appendChild(deleteBtn);
      ulContainer.append(li);
    });
  } catch (error) {
    console.log(error);
  }
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
