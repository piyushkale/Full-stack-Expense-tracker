let token;

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
  const leaderboardBtn = document.getElementById("leaderboard-btn");
  leaderboardBtn.classList.remove("hidden");
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

async function displayExpenseHistory() {
  try {
    const response = await axios.get("/expense/get", {
      headers: { Authorization: token },
    });
    const data = response.data;
    const ulContainer = document.getElementById("ul-container");
    ulContainer.innerHTML = "";
    data.forEach((expense) => {
      const li = document.createElement("li");
      li.innerText = ` Description: ${expense.description} - amount-${expense.amount} category-${expense.category}`;
      li.className = "bg-gray-300 px-12 py-2 min-w-full rounded-md";
      const deleteBtn = document.createElement("button");
      deleteBtn.innerText = "Delete";
      deleteBtn.className =
        "bg-red-200 px-2 ml-4 rounded-md border border-gray-700 hover:bg-red-400";
      deleteBtn.onclick = () => {
        deleteExpense(expense.id);
      };
      li.appendChild(deleteBtn);
      ulContainer.prepend(li);
    });
  } catch (error) {
    console.log(error);
  }
}

async function deleteExpense(id) {
  try {
    await axios.delete(`/expense/delete/${id}`, {
      headers: { Authorization: token },
    });
    displayExpenseHistory();
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
