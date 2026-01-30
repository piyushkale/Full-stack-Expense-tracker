let toggleSignupLogin = false;

async function handleSignupSubmit(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const name = formData.get("name");
  const email = formData.get("email");
  const password = formData.get("password");

  if (!name || !email || !password) {
    signupStatus("fail", "Enter all the inputs");
    return;
  }

  try {
    const response = await axios.post("/user/signup/", {
      name,
      email,
      password,
    });
    signupStatus("success", "Account successfully created");
    event.target.reset();
  } catch (error) {
    signupStatus("fail", error.response?.data?.error || error.message);
  }
}

async function handleLoginSubmit(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const email = formData.get("email");
  const password = formData.get("password");
  try {
    const loginRes = await axios.post("/user/login/", {
      email,
      password,
    });

    signupStatus("success", "Login successful");

    if (loginRes.data.success) {
      localStorage.setItem("token", loginRes.data.token);
      window.location.href = `/expense.html`;
    }
  } catch (error) {
    signupStatus("fail", error.response.data.error);
  }
}

function signupStatus(status, message) {
  let vanishDiv;
  if (status == "success") {
    const divStatus = document.getElementById("signup-success");
    divStatus.innerText = message;
    vanishDiv = divStatus;
  }
  if (status == "fail") {
    const divStatus = document.getElementById("signup-fail");
    divStatus.innerText = message;
    vanishDiv = divStatus;
  }

  setTimeout(() => {
    vanishDiv.innerText = "";
  }, 6000);
}

function toggleForm(event) {
  toggleSignupLogin = !toggleSignupLogin;

  const signupForm = document.getElementById("signup-form");
  const loginForm = document.getElementById("login-form");
  if (toggleSignupLogin === true) {
    signupForm.classList.add("hidden");
    loginForm.classList.remove("hidden");
    event.target.innerText = "Signup";
  } else {
    signupForm.classList.remove("hidden");
    loginForm.classList.add("hidden");
    event.target.innerText = "Login";
  }
}
