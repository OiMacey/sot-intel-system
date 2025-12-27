async function login() {
  const res = await fetch("/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      codename: codename.value,
      service: service.value,
      phrase: phrase.value,
      role: role.value
    })
  });

  if (res.ok) {
    window.location = "decode.html";
  } else {
    status.innerText = "ACCESS DENIED";
  }
}
